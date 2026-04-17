export type AnalysisSection = {
	title: string;
	type: "critical" | "improve" | "good";
	summary: string;
	suggestions: string[];
};

export type AnalysisResult = {
	score: number;
	scoreLabel: string;
	sections: AnalysisSection[];
	createdAt: string;
};

export type AnalysisRecord = {
	id: string;
	jobTitle: string;
	jobDescription: string;
	cvText: string;
	result: AnalysisResult;
	createdAt: string;
};
