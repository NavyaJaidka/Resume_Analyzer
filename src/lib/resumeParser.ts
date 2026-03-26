import type { ResumeData } from "@/contexts/ResumeContext";

export async function parseResumeFile(file: File): Promise<ResumeData> {
  const text = await extractText(file);
  const skills = extractSkills(text);
  const experience = extractExperience(text);
  const education = extractEducation(text);

  return {
    id: crypto.randomUUID(),
    fileName: file.name,
    rawText: text,
    skills,
    experience,
    education,
    uploadDate: new Date().toISOString(),
  };
}

async function extractText(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    return extractPdfText(file);
  }
  if (file.name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return extractDocxText(file);
  }
  return file.text();
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ") + "\n";
  }
  return text;
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

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
  let current: any = null;

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
