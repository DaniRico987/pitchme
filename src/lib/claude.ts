import type { AnalysisResult } from "../types";

export async function analyzeCV(
  cvText: string,
  jobDescription: string,
  lang: string,
): Promise<AnalysisResult> {
  try {
    console.log("Sending lang:", lang);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-cv`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ cvText, jobDescription, lang: lang }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Analyze function error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as AnalysisResult;
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to analyze CV: ${message}`);
  }
}
