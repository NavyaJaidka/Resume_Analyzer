import React, { createContext, useContext, useState, useCallback } from "react";

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

interface ResumeContextType {
  resumes: ResumeData[];
  currentResume: ResumeData | null;
  currentAnalysis: AnalysisResult | null;
  jobDescription: string;
  analyses: StoredAnalysis[];
  setJobDescription: (jd: string) => void;
  addResume: (resume: ResumeData) => void;
  setCurrentResume: (resume: ResumeData | null) => void;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  deleteResume: (id: string) => void;
  saveAnalysis: (resumeId: string, result: AnalysisResult) => void;
  getAnalysesForResume: (resumeId: string) => StoredAnalysis[];
  getAverageScore: () => number | null;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resumes, setResumes] = useState<ResumeData[]>(() => {
    const saved = localStorage.getItem("resumeiq-resumes");
    return saved ? JSON.parse(saved) : [];
  });
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>(() => {
    const saved = localStorage.getItem("resumeiq-analyses");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentResume, setCurrentResume] = useState<ResumeData | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  const addResume = useCallback((resume: ResumeData) => {
    setResumes(prev => {
      const updated = [resume, ...prev];
      localStorage.setItem("resumeiq-resumes", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteResume = useCallback((id: string) => {
    setResumes(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem("resumeiq-resumes", JSON.stringify(updated));
      return updated;
    });
    setAnalyses(prev => {
      const updated = prev.filter(a => a.resumeId !== id);
      localStorage.setItem("resumeiq-analyses", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const saveAnalysis = useCallback((resumeId: string, result: AnalysisResult) => {
    const entry: StoredAnalysis = {
      id: crypto.randomUUID(),
      resumeId,
      result: { ...result, analyzedAt: new Date().toISOString() },
      analyzedAt: new Date().toISOString(),
    };
    setAnalyses(prev => {
      const updated = [entry, ...prev];
      localStorage.setItem("resumeiq-analyses", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getAnalysesForResume = useCallback((resumeId: string) => {
    return analyses.filter(a => a.resumeId === resumeId);
  }, [analyses]);

  const getAverageScore = useCallback(() => {
    if (analyses.length === 0) return null;
    const sum = analyses.reduce((acc, a) => acc + a.result.overallScore, 0);
    return Math.round(sum / analyses.length);
  }, [analyses]);

  return (
    <ResumeContext.Provider value={{
      resumes, currentResume, currentAnalysis, jobDescription, analyses,
      setJobDescription, addResume, setCurrentResume, setCurrentAnalysis,
      deleteResume, saveAnalysis, getAnalysesForResume, getAverageScore,
    }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used within ResumeProvider");
  return ctx;
};
