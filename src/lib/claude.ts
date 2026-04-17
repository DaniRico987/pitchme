import type { AnalysisResult } from "../types";

type AnthropicMessageResponse = {
	content?: Array<{
		type?: string;
		text?: string;
	}>;
};

export async function analyzeCV(
	cvText: string,
	jobDescription: string
): Promise<AnalysisResult> {
	try {
		const response = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: "claude-opus-4-5",
				max_tokens: 2000,
				system:
					"You are an expert ATS and recruitment consultant. Analyze the CV against the job description and respond ONLY with a valid JSON object, no markdown, no explanation.",
				messages: [
					{
						role: "user",
						content: `CV:\n${cvText}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nRespond with this exact JSON structure: { score: number 0-100, scoreLabel: string, sections: [{ title: string, type: 'critical'|'improve'|'good', summary: string, suggestions: string[] }], createdAt: string ISO date }`,
					},
				],
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
		}

		const data = (await response.json()) as AnthropicMessageResponse;
		const textContent = data.content?.find((item) => item.type === "text")?.text;

		if (!textContent) {
			throw new Error("Anthropic response did not include text content.");
		}

		return JSON.parse(textContent) as AnalysisResult;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to analyze CV: ${message}`);
	}
}
