import { Pool } from 'pg';
import { ResumeData, AnalysisResult, StoredAnalysis } from './types';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Mock DB for now to avoid connection issues if PG is not running
const resumes = new Map<string, ResumeData>();
const analyses = new Map<string, StoredAnalysis[]>();

export const saveResume = async (resume: ResumeData): Promise<ResumeData> => {
  resumes.set(resume.id, resume);
  // try {
  //   await pool.query('INSERT INTO resumes (id, data) VALUES ($1, $2)', [resume.id, JSON.stringify(resume)]);
  // } catch (e) {
  //   console.warn('DB Insert failed, using in-memory fallback');
  // }
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
  // Simple history retrieval
  return Array.from(analyses.values()).flat();
};
