import { useState } from "react";
import { analyzeCV } from "../lib/claude";
import { supabase } from "../lib/supabase";
import type { AnalysisResult } from "../types";

export function useAnalyzer() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<AnalysisResult | null>(null);

	const analyze = async (
		cvText: string,
		jobDescription: string,
		jobTitle: string
	) => {
		setIsLoading(true);
		setError(null);

		try {
			const analysisResult = await analyzeCV(cvText, jobDescription);

			const { error: insertError } = await supabase.from("analyses").insert({
				job_title: jobTitle,
				job_description: jobDescription,
				cv_text: cvText,
				result: analysisResult,
				created_at: new Date().toISOString(),
			});

			if (insertError) {
				throw new Error(insertError.message);
			}

			setResult(analysisResult);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	return { isLoading, error, result, analyze };
}
