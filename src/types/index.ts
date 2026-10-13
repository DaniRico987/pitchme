export type AnalysisSection = {
  title: string;
  type: "critical" | "improve" | "good";
  summary: string;
  suggestions: string[];
};

export type KeywordGap = {
  missing: string[];
  matching: string[];
  extra: string[];
  matchPercentage: number;
  totalJobKeywords: number;
  totalCVKeywords: number;
};

export type AnalysisResult = {
  score: number;
  scoreLabel: string;
  sections: AnalysisSection[];
  createdAt: string;
  keywordGap?: KeywordGap;
};

export type AnalysisRecord = {
  id: string;
  jobTitle: string;
  jobDescription: string;
  cvText: string;
  result: AnalysisResult;
  createdAt: string;
};
