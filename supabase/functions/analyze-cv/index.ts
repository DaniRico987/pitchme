const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Configuration
const MAX_CV_LENGTH = 50000;
const MAX_JOB_DESC_LENGTH = 30000;
const MIN_JOB_DESC_LENGTH = 50;

// Common stop words to filter out
const STOP_WORDS_ES = new Set([
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "unos",
  "unas",
  "y",
  "e",
  "o",
  "u",
  "de",
  "del",
  "al",
  "a",
  "en",
  "con",
  "por",
  "para",
  "sin",
  "sobre",
  "entre",
  "hasta",
  "desde",
  "durante",
  "mediante",
  "según",
  "bajo",
  "tras",
  "versus",
  "vía",
  "que",
  "quien",
  "quienes",
  "cual",
  "cuales",
  "cuanto",
  "cuanta",
  "cuantos",
  "cuantas",
  "donde",
  "cuando",
  "como",
  "porque",
  "pues",
  "ya",
  "aun",
  "también",
  "tampoco",
  "ni",
  "sino",
  "pero",
  "mas",
  "más",
  "menos",
  "muy",
  "mucho",
  "poca",
  "poco",
  "bastante",
  "demasiado",
  "suficiente",
  "todo",
  "toda",
  "todos",
  "todas",
  "alguno",
  "alguna",
  "algunos",
  "algunas",
  "ninguno",
  "ninguna",
  "ningunos",
  "ningunas",
  "otro",
  "otra",
  "otros",
  "otras",
  "mismo",
  "misma",
  "mismos",
  "mismas",
  "tal",
  "tales",
  "tanto",
  "tanta",
  "tantos",
  "tantas",
  "este",
  "esta",
  "estos",
  "estas",
  "ese",
  "esa",
  "esos",
  "esas",
  "aquel",
  "aquella",
  "aquellos",
  "aquellas",
  "mi",
  "mis",
  "tu",
  "tus",
  "su",
  "sus",
  "nuestro",
  "nuestra",
  "nuestros",
  "nuestras",
  "vuestro",
  "vuestra",
  "vuestros",
  "vuestras",
  "me",
  "te",
  "se",
  "nos",
  "os",
  "le",
  "les",
  "lo",
  "la",
  "los",
  "las",
  "él",
  "ella",
  "ellos",
  "ellas",
  "ello",
  "yo",
  "tu",
  "usted",
  "ustedes",
  "nosotros",
  "nosotras",
  "vosotros",
  "vosotras",
]);

const STOP_WORDS_EN = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "up",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "among",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  "mine",
  "yours",
  "hers",
  "ours",
  "theirs",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",
  "will",
  "would",
  "should",
  "could",
  "ought",
  "can",
  "may",
  "might",
  "must",
  "shall",
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",
  "a",
  "an",
  "the",
  "and",
  "but",
  "if",
  "or",
  "because",
  "as",
  "until",
  "while",
  "of",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "to",
  "from",
  "up",
  "down",
  "in",
  "out",
  "on",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "s",
  "t",
  "can",
  "will",
  "just",
  "don",
  "should",
  "now",
]);

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
  jobTitle?: string;
};

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

// Sanitize input: remove control characters, normalize whitespace
function sanitizeInput(input: string): string {
  const controlChars = "[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]";
  return input
    .replace(new RegExp(controlChars, "gu"), "")
    .replace(/\s+/g, " ")
    .trim();
}

// Validate request input
function validateRequest(
  cvText: string,
  jobDescription: string,
  lang: string,
): { valid: boolean; error?: string; statusCode?: number } {
  if (!cvText || cvText.trim().length === 0) {
    return {
      valid: false,
      error: "cvText is required and cannot be empty",
      statusCode: 400,
    };
  }
  if (!jobDescription || jobDescription.trim().length === 0) {
    return {
      valid: false,
      error: "jobDescription is required and cannot be empty",
      statusCode: 400,
    };
  }
  if (cvText.length > MAX_CV_LENGTH) {
    return {
      valid: false,
      error: `CV text exceeds maximum length of ${MAX_CV_LENGTH} characters`,
      statusCode: 413,
    };
  }
  if (jobDescription.length > MAX_JOB_DESC_LENGTH) {
    return {
      valid: false,
      error: `Job description exceeds maximum length of ${MAX_JOB_DESC_LENGTH} characters`,
      statusCode: 413,
    };
  }
  if (jobDescription.trim().length < MIN_JOB_DESC_LENGTH) {
    return {
      valid: false,
      error: `Job description must be at least ${MIN_JOB_DESC_LENGTH} characters`,
      statusCode: 400,
    };
  }
  if (lang !== "es" && lang !== "en") {
    return {
      valid: false,
      error: "lang must be 'es' or 'en'",
      statusCode: 400,
    };
  }
  return { valid: true };
}

// Extract keywords from text
function extractKeywords(text: string, lang: "es" | "en"): string[] {
  const stopWords = lang === "es" ? STOP_WORDS_ES : STOP_WORDS_EN;

  // Convert to lowercase and split into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\sáéíóúüñ]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .filter((word) => !stopWords.has(word))
    .filter((word) => !/^\d+$/.test(word)); // Remove pure numbers

  // Count frequency
  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  // Return top 50 keywords by frequency
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word]) => word);
}

// Calculate keyword gap analysis
function calculateKeywordGap(
  cvKeywords: string[],
  jobKeywords: string[],
): {
  missing: string[];
  matching: string[];
  extra: string[];
  matchPercentage: number;
} {
  const cvSet = new Set(cvKeywords);
  const jobSet = new Set(jobKeywords);

  const matching = jobKeywords.filter((k) => cvSet.has(k));
  const missing = jobKeywords.filter((k) => !cvSet.has(k));
  const extra = cvKeywords.filter((k) => !jobSet.has(k));

  const matchPercentage =
    jobKeywords.length > 0
      ? Math.round((matching.length / jobKeywords.length) * 100)
      : 0;

  return { missing, matching, extra, matchPercentage };
}

// Helper to extract user from JWT
function getUserFromToken(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

// Validate response structure
function validateResponseStructure(parsedResult: unknown): boolean {
  return (
    typeof parsedResult === "object" &&
    parsedResult !== null &&
    typeof (parsedResult as Record<string, unknown>).score === "number"
  );
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get user ID from JWT (available for future use)
  getUserFromToken(req);

  try {
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      console.error("Missing GROQ_API_KEY");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let requestBody: AnalyzeRequest;
    try {
      requestBody = (await req.json()) as AnalyzeRequest;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { cvText, jobDescription, lang = "es" } = requestBody;

    // Validate input
    const validation = validateRequest(
      cvText || "",
      jobDescription || "",
      lang,
    );
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: validation.statusCode || 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize inputs
    const sanitizedCvText = sanitizeInput(cvText!);
    const sanitizedJobDescription = sanitizeInput(jobDescription!);

    console.log(
      `Processing analysis: lang=${lang}, cvLength=${sanitizedCvText.length}, jdLength=${sanitizedJobDescription.length}`,
    );

    // Extract keywords for gap analysis
    const cvKeywords = extractKeywords(sanitizedCvText, lang);
    const jobKeywords = extractKeywords(sanitizedJobDescription, lang);
    const keywordGap = calculateKeywordGap(cvKeywords, jobKeywords);

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

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          max_tokens: 3000,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `${userPrefix}CV:\n${sanitizedCvText}\n\nJOB DESCRIPTION:\n${sanitizedJobDescription}\n\nRespond with this exact JSON structure: { score: number 0-100, scoreLabel: string (examples: "Candidato fuerte", "Candidato promedio", "Necesita mejorar"), sections: [{ title: string, type: 'critical'|'improve'|'good', summary: string, suggestions: string[] }], createdAt: string ISO date }${userSuffix}`,
            },
          ],
        }),
      },
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error(`Groq API error ${groqResponse.status}:`, errorText);
      return new Response(
        JSON.stringify({ error: "Analysis service temporarily unavailable" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = (await groqResponse.json()) as GroqResponse;
    const textContent = data.choices?.[0]?.message?.content;
    if (!textContent) {
      throw new Error("Groq response did not include message content.");
    }

    let parsedResult: unknown;
    try {
      parsedResult = JSON.parse(textContent);
    } catch {
      console.error("Failed to parse Groq response as JSON:", textContent);
      return new Response(
        JSON.stringify({ error: "Invalid response from analysis service" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!validateResponseStructure(parsedResult)) {
      console.error("Invalid response structure from Groq:", parsedResult);
      return new Response(
        JSON.stringify({
          error: "Invalid response structure from analysis service",
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Enhance result with keyword gap analysis
    const enhancedResult = {
      ...(parsedResult as Record<string, unknown>),
      keywordGap: {
        missing: keywordGap.missing.slice(0, 20), // Top 20 missing keywords
        matching: keywordGap.matching.slice(0, 20),
        extra: keywordGap.extra.slice(0, 20),
        matchPercentage: keywordGap.matchPercentage,
        totalJobKeywords: jobKeywords.length,
        totalCVKeywords: cvKeywords.length,
      },
    };

    return new Response(JSON.stringify(enhancedResult), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Analyze function error:", message);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
