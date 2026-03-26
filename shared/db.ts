import { ResumeData, AnalysisResult, StoredAnalysis } from './types';

// In-memory storage for Vercel serverless functions
// Note: This data will be lost between function invocations
// For production, use a database like Vercel Postgres, PlanetScale, or Supabase
const resumes = new Map<string, ResumeData>();
const analyses = new Map<string, StoredAnalysis[]>();

export const saveResume = async (resume: ResumeData): Promise<ResumeData> => {
  resumes.set(resume.id, resume);
  return resume;
};

export const getResumeById = async (id: string): Promise<ResumeData | null> => {
  return resumes.get(id) || null;
};

export const saveAnalysis = async (resumeId: string, result: AnalysisResult): Promise<StoredAnalysis> => {
  const analysis: StoredAnalysis = {
    id: Math.random().toString(36).substring(7),
    resumeId,
    result,
    analyzedAt: new Date().toISOString(),
  };
  const list = analyses.get(resumeId) || [];
  list.push(analysis);
  analyses.set(resumeId, list);
  return analysis;
};

export const getHistoryByUserId = async (userId: string): Promise<StoredAnalysis[]> => {
  // Simple history retrieval - in production, you'd filter by userId
  return Array.from(analyses.values()).flat();
};