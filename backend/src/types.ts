export interface ResumeData {
  id: string;
  fileName: string;
  rawText: string;
  skills: string[];
  experience: { title: string; company: string; duration: string; description: string }[];
  education: { degree: string; institution: string; year: string }[];
  uploadDate: string;
  lastAnalyzedDate?: string;
}

export interface AnalysisResult {
  overallScore: number;
  sectionScores: {
    skills: number;
    experience: number;
    keywords: number;
    formatting: number;
  };
  missingKeywords: string[];
  suggestions: { category: string; text: string; priority: "high" | "medium" | "low" }[];
  matchedKeywords: string[];
  jobDescription?: string;
  analyzedAt?: string;
}

export interface StoredAnalysis {
  id: string;
  resumeId: string;
  result: AnalysisResult;
  analyzedAt: string;
}
