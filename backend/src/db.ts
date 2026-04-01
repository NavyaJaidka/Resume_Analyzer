import { Pool } from 'pg';
import { ResumeData, AnalysisResult, StoredAnalysis } from './types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export { pool };

export const saveResume = async (resume: ResumeData): Promise<ResumeData> => {
  await pool.query(
    `INSERT INTO resumes (id, file_name, raw_text, skills, experience, education, upload_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO UPDATE SET
     file_name = EXCLUDED.file_name,
     raw_text = EXCLUDED.raw_text,
     skills = EXCLUDED.skills,
     experience = EXCLUDED.experience,
     education = EXCLUDED.education`,
    [
      resume.id,
      resume.fileName,
      resume.rawText,
      JSON.stringify(resume.skills),
      JSON.stringify(resume.experience),
      JSON.stringify(resume.education),
      resume.uploadDate,
    ]
  );
  return resume;
};

export const getResumeById = async (id: string): Promise<ResumeData | null> => {
  const result = await pool.query('SELECT * FROM resumes WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    fileName: row.file_name,
    rawText: row.raw_text,
    skills: row.skills,
    experience: row.experience,
    education: row.education,
    uploadDate: row.upload_date,
    lastAnalyzedDate: row.last_analyzed_date,
  };
};

export const saveAnalysis = async (resumeId: string, result: AnalysisResult): Promise<StoredAnalysis> => {
  const analysis: StoredAnalysis = {
    id: Math.random().toString(36).substring(7),
    resumeId,
    result,
    analyzedAt: new Date().toISOString(),
  };

  await pool.query(
    'INSERT INTO analyses (id, resume_id, result, analyzed_at) VALUES ($1, $2, $3, $4)',
    [analysis.id, analysis.resumeId, JSON.stringify(analysis.result), analysis.analyzedAt]
  );

  // Update last_analyzed_date on the resume
  await pool.query('UPDATE resumes SET last_analyzed_date = $1 WHERE id = $2', [analysis.analyzedAt, resumeId]);

  return analysis;
};

export const getHistoryByUserId = async (userId: string): Promise<StoredAnalysis[]> => {
  const result = await pool.query(
    'SELECT a.* FROM analyses a JOIN resumes r ON a.resume_id = r.id ORDER BY a.analyzed_at DESC'
  );
  return result.rows.map((row) => ({
    id: row.id,
    resumeId: row.resume_id,
    result: row.result,
    analyzedAt: row.analyzed_at,
  }));
};
