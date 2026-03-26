import * as fs from 'fs';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import { randomBytes } from 'crypto';
import { ResumeData, AnalysisResult, StoredAnalysis } from './types';
import * as db from './db';
import * as scoringEngine from './scoringEngine';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse');

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

export const parseResume = async (file: MulterFile): Promise<ResumeData> => {
  let text = '';
  if (file.mimetype === 'application/pdf') {
    try {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdf(dataBuffer);
      text = data.text;
    } catch (err: any) {
      console.error("PDF Parsing Error:", err.message);
      // Fallback: If pdf-parse totally fails (e.g. malformed PDF), just extract raw buffer strings or return empty
      text = fs.readFileSync(file.path, 'utf8').replace(/[^\x20-\x7E]/g, ' ');
    }
  } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ path: file.path });
    text = result.value;
  } else {
    text = fs.readFileSync(file.path, 'utf8');
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
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
    "git", "linux", "windows", "macos", "bash", "powershell",
    "rest api", "graphql", "websocket", "microservices", "serverless",
    "machine learning", "data science", "artificial intelligence", "deep learning",
    "agile", "scrum", "kanban", "jira", "confluence", "slack",
    "figma", "photoshop", "illustrator", "sketch", "adobe xd",
    "excel", "power bi", "tableau", "google analytics", "seo",
    "android", "ios", "flutter", "react native", "xamarin",
    "cypress", "jest", "selenium", "postman", "swagger",
    "jenkins", "github actions", "circleci", "travis ci", "gitlab ci",
    "nginx", "apache", "iis", "tomcat", "pm2",
    "oauth", "jwt", "cors", "helmet", "rate limiting",
    "typescript", "flow", "prop types", "eslint", "prettier",
    "webpack", "vite", "rollup", "babel", "parcel",
    "redux", "zustand", "context api", "mobx", "recoil",
    "styled components", "emotion", "css modules", "bem", "atomic css",
    "firebase", "supabase", "planetscale", "vercel", "netlify",
    "stripe", "paypal", "twilio", "sendgrid", "mailgun",
    "pwa", "webassembly", "webgl", "canvas", "svg",
    "blockchain", "ethereum", "solidity", "web3", "nft",
    "quantum computing", "edge computing", "iot", "5g", "vr/ar",
];

function extractSkills(text: string): string[] {
  const skills = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const skill of COMMON_SKILLS) {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  }

  // Extract skills from bullet points or lists
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('·')) {
      const skillText = trimmed.substring(1).trim();
      if (skillText.length > 0 && skillText.length < 50) {
        // Check if it looks like a skill
        if (!/\d/.test(skillText) && skillText.split(' ').length <= 5) {
          skills.add(skillText.toLowerCase());
        }
      }
    }
  }

  return Array.from(skills).filter(skill => skill.length > 1);
}

function extractExperience(text: string): { title: string; company: string; duration: string; description: string }[] {
  const experience: { title: string; company: string; duration: string; description: string }[] = [];
  const lines = text.split('\n');

  let currentExp: Partial<{ title: string; company: string; duration: string; description: string }> = {};
  let inExperienceSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if we're in the experience section
    if (line.toLowerCase().includes('experience') || line.toLowerCase().includes('work history')) {
      inExperienceSection = true;
      continue;
    }

    if (inExperienceSection && (line.toLowerCase().includes('education') || line.toLowerCase().includes('skills'))) {
      inExperienceSection = false;
    }

    if (!inExperienceSection) continue;

    // Look for job titles (usually capitalized or at start of line)
    if (line.length > 0 && line.length < 100 && !line.includes('@') && !/\d{4}/.test(line)) {
      // Check if it looks like a job title
      const words = line.split(' ');
      if (words.length <= 8 && words.some(word => word.length > 3)) {
        if (currentExp.title && currentExp.company) {
          experience.push(currentExp as any);
        }
        currentExp = { title: line, description: '' };
        continue;
      }
    }

    // Look for company names (often after "at" or with location)
    if (line.includes(' at ') || line.includes(' - ') || /\w+,\s*\w+/.test(line)) {
      if (!currentExp.company) {
        currentExp.company = line;
        continue;
      }
    }

    // Look for dates
    const datePattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\s*[-–]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december|present|current)?\s*\d{4}?\b/i;
    if (datePattern.test(line)) {
      currentExp.duration = line;
      continue;
    }

    // Add to description
    if (currentExp.title && line.startsWith('•') || line.startsWith('-')) {
      currentExp.description = (currentExp.description || '') + line.substring(1).trim() + ' ';
    }
  }

  // Add the last experience entry
  if (currentExp.title && currentExp.company) {
    experience.push(currentExp as any);
  }

  return experience.slice(0, 5); // Limit to 5 entries
}

function extractEducation(text: string): { degree: string; institution: string; year: string }[] {
  const education: { degree: string; institution: string; year: string }[] = [];
  const lines = text.split('\n');

  let inEducationSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if we're in the education section
    if (trimmed.toLowerCase().includes('education') || trimmed.toLowerCase().includes('academic')) {
      inEducationSection = true;
      continue;
    }

    if (inEducationSection && (trimmed.toLowerCase().includes('experience') || trimmed.toLowerCase().includes('skills'))) {
      inEducationSection = false;
    }

    if (!inEducationSection) continue;

    // Look for degrees
    const degreeKeywords = ['bachelor', 'master', 'phd', 'doctorate', 'associate', 'certificate', 'diploma', 'mba', 'ms', 'ma', 'ba', 'bs', 'bsc', 'msc', 'btech', 'mtech'];
    const hasDegree = degreeKeywords.some(keyword => trimmed.toLowerCase().includes(keyword));

    if (hasDegree || /\b\d{4}\b/.test(trimmed)) {
      // Extract degree, institution, and year
      let degree = '';
      let institution = '';
      let year = '';

      // Try to extract year
      const yearMatch = trimmed.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        year = yearMatch[0];
      }

      // Try to extract degree
      for (const keyword of degreeKeywords) {
        if (trimmed.toLowerCase().includes(keyword)) {
          degree = trimmed;
          break;
        }
      }

      // Try to extract institution (usually after comma or "from")
      const institutionMatch = trimmed.match(/(?:from|at|,)\s*([^,]+)(?:,|\d{4}|$)/i);
      if (institutionMatch) {
        institution = institutionMatch[1].trim();
      }

      if (degree || institution || year) {
        education.push({
          degree: degree || 'Degree',
          institution: institution || 'Institution',
          year: year || 'Year'
        });
      }
    }
  }

  return education.slice(0, 3); // Limit to 3 entries
}