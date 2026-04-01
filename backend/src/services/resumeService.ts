import * as fs from 'fs';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import crypto from 'crypto';
import { ResumeData, AnalysisResult, StoredAnalysis } from '../types';
import * as db from '../db';
import * as scoringEngine from './scoringEngine';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse');

export interface ParsableFile {
  originalname: string;
  mimetype: string;
  buffer?: Buffer;
  path?: string;
}

export const parseResume = async (file: ParsableFile): Promise<ResumeData> => {
  let text = '';
  const dataBuffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
  
  if (!dataBuffer) {
    throw new Error('No file data provided');
  }

  if (file.mimetype === 'application/pdf') {
    try {
      const data = await pdf(dataBuffer);
      text = data.text;
    } catch (err) {
      const error = err as Error;
      console.error("PDF Parsing Error:", error.message);
      // Fallback: If pdf-parse totally fails (e.g. malformed PDF), just extract raw strings
      text = dataBuffer.toString('utf8').replace(/[^\x20-\x7E]/g, ' '); 
    }
  } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammothInput = file.path ? { path: file.path } : { buffer: dataBuffer };
    const result = await mammoth.extractRawText(mammothInput as any);
    text = result.value;
  } else {
    text = dataBuffer.toString('utf8');
  }

  // Ported parsing logic
  const skills = extractSkills(text);
  const experience = extractExperience(text);
  const education = extractEducation(text);

  return {
    id: crypto.randomUUID(),
    fileName: file.originalname,
    rawText: text,
    skills,
    experience,
    education,
    uploadDate: new Date().toISOString(),
  };
};

export const saveResume = async (resume: ResumeData): Promise<ResumeData> => {
  return await db.saveResume(resume);
};

export const analyzeResume = async (resumeId: string, jobDescription: string): Promise<AnalysisResult> => {
  const resume = await db.getResumeById(resumeId);
  if (!resume) throw new Error('Resume not found');

  const result = scoringEngine.analyzeResume(resume, jobDescription);
  await db.saveAnalysis(resumeId, result);
  return result;
};

export const getResumeById = async (id: string): Promise<ResumeData | null> => {
  return await db.getResumeById(id);
};

export const getHistoryByUserId = async (userId: string): Promise<StoredAnalysis[]> => {
  return await db.getHistoryByUserId(userId);
};

export const generateOptimizedResume = async (resumeId: string): Promise<Buffer> => {
  const resume = await db.getResumeById(resumeId);
  if (!resume) throw new Error('Resume not found');

  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.text(resume.fileName.replace(/\.[^/.]+$/, ""), 20, 20);
  
  doc.setFontSize(16);
  doc.text('Skills', 20, 40);
  doc.setFontSize(12);
  doc.text(resume.skills.join(', '), 20, 50);

  doc.setFontSize(16);
  doc.text('Experience', 20, 70);
  let y = 80;
  resume.experience.forEach((exp: { title: string; company: string; duration: string; description: string }) => {
    doc.setFontSize(14);
    doc.text(`${exp.title} at ${exp.company}`, 20, y);
    doc.setFontSize(10);
    doc.text(exp.duration, 20, y + 5);
    doc.text(exp.description, 20, y + 10, { maxWidth: 170 });
    y += 30;
  });

  return Buffer.from(doc.output('arraybuffer'));
};

// Helper functions (ported from frontend)
const COMMON_SKILLS = [
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "go", "rust", "swift",
    "react", "angular", "vue", "next.js", "node.js", "express", "django", "flask", "spring",
    "html", "css", "sass", "tailwind", "bootstrap", "material ui",
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd",
    "git", "github", "gitlab", "jira", "agile", "scrum",
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch",
    "rest api", "graphql", "microservices", "system design",
    "figma", "sketch", "adobe", "photoshop", "illustrator",
    "project management", "leadership", "communication", "problem solving", "teamwork",
    "data analysis", "data science", "tableau", "power bi", "excel",
    "salesforce", "hubspot", "seo", "marketing", "analytics",
];

function extractSkills(text: string): string[] {
    const lower = text.toLowerCase();
    return COMMON_SKILLS.filter(skill => lower.includes(skill));
}

function extractExperience(text: string): ResumeData["experience"] {
    const lines = text.split("\n").filter(l => l.trim());
    const experiences: ResumeData["experience"] = [];
    const expPattern = /(?:experience|work|employment|professional)/i;

    let inExpSection = false;
    let current: { title: string; company: string; duration: string; description: string } | null = null;

    for (const line of lines) {
        if (expPattern.test(line) && line.length < 40) {
            inExpSection = true;
            continue;
        }
        if (inExpSection && /(?:education|skills|projects|certif|awards|summary|objective)/i.test(line) && line.length < 40) {
            if (current) experiences.push(current);
            break;
        }
        if (inExpSection) {
            const dateMatch = line.match(/(\d{4})\s*[-–—]\s*(\d{4}|present|current)/i);
            if (dateMatch || /(?:senior|junior|lead|manager|engineer|developer|analyst|designer|intern|director|coordinator|specialist|consultant)/i.test(line)) {
                if (current) experiences.push(current);
                current = {
                    title: line.replace(/\s*[-–—]\s*\d{4}.*/, "").trim(),
                    company: "",
                    duration: dateMatch ? `${dateMatch[1]} - ${dateMatch[2]}` : "",
                    description: "",
                };
            } else if (current) {
                if (!current.company && line.length < 60) {
                    current.company = line.trim();
                } else {
                    current.description += line.trim() + " ";
                }
            }
        }
    }
    if (current) experiences.push(current);
    return experiences.slice(0, 8);
}

function extractEducation(text: string): ResumeData["education"] {
    const lines = text.split("\n").filter(l => l.trim());
    const education: ResumeData["education"] = [];
    let inEduSection = false;

    for (const line of lines) {
        if (/^education/i.test(line.trim())) {
            inEduSection = true;
            continue;
        }
        if (inEduSection && /(?:experience|skills|projects|certif|awards)/i.test(line) && line.length < 40) break;
        if (inEduSection) {
            const degreeMatch = line.match(/(bachelor|master|phd|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|mba|associate|diploma)/i);
            const yearMatch = line.match(/\b(19|20)\d{2}\b/);
            if (degreeMatch) {
                education.push({
                    degree: line.trim(),
                    institution: "",
                    year: yearMatch ? yearMatch[0] : "",
                });
            } else if (education.length > 0 && !education[education.length - 1].institution) {
                education[education.length - 1].institution = line.trim();
            }
        }
    }
    return education.slice(0, 4);
}
