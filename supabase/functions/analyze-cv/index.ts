const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

type AnalyzeRequest = {
  cvText?: string;
  jobDescription?: string;
  lang?: "es" | "en";
};

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      throw new Error("Missing GROQ_API_KEY");
    }

    const { cvText, jobDescription, lang = "es" } = (await req.json()) as AnalyzeRequest;
    console.log("Lang received:", lang);
    if (!cvText || !jobDescription) {
      throw new Error("cvText and jobDescription are required");
    }

    if (lang !== "es" && lang !== "en") {
      throw new Error("lang must be 'es' or 'en'");
    }

    const systemPrompt =
      lang === "en"
        ? "You are an expert ATS and recruitment consultant. IMPORTANT: You MUST respond ONLY in English. Every single word in your JSON response must be in English. No Spanish words allowed. Analyze the CV against the job description and respond ONLY with a valid JSON object, no markdown, no extra text."
        : "Eres un experto consultor de ATS y reclutamiento. IMPORTANTE: Debes responder ÚNICAMENTE en español. Cada palabra en tu respuesta JSON debe estar en español. Analiza el CV contra la descripción del puesto y responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin texto extra.";

    const userPrefix =
      lang === "en"
        ? "RESPOND ONLY IN ENGLISH. ALL TEXT MUST BE IN ENGLISH.\n\n"
        : "RESPONDE ÚNICAMENTE EN ESPAÑOL. TODO EL TEXTO DEBE ESTAR EN ESPAÑOL.\n\n";

    const userSuffix =
      lang === "en"
        ? "\n\nREMEMBER: Respond only in English."
        : "\n\nRECUERDA: Responde únicamente en español.";

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `${userPrefix}CV:\n${cvText}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nRespond with this exact JSON structure: { score: number 0-100, scoreLabel: string (examples: \"Candidato fuerte\", \"Candidato promedio\", \"Necesita mejorar\"), sections: [{ title: string, type: 'critical'|'improve'|'good', summary: string, suggestions: string[] }], createdAt: string ISO date }${userSuffix}`,
          },
        ],
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      throw new Error(`Groq API error ${groqResponse.status}: ${errorText}`);
    }

    const data = (await groqResponse.json()) as GroqResponse;
    const textContent = data.choices?.[0]?.message?.content;
    if (!textContent) {
      throw new Error("Groq response did not include message content.");
    }

    const parsedResult = JSON.parse(textContent);

    return new Response(JSON.stringify(parsedResult), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
