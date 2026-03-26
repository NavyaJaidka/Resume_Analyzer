import { ResumeData, AnalysisResult } from './types';

// Ported logic from atsScorer.ts
const ALIASES: Record<string, string[]> = {
  javascript: ["js"],
  typescript: ["ts"],
  "node.js": ["node", "nodejs"],
  "react.js": ["react", "reactjs"],
  "vue.js": ["vue", "vuejs"],
  "next.js": ["next", "nextjs"],
  "angular.js": ["angular", "angularjs"],
  "express.js": ["express", "expressjs"],
  postgresql: ["postgres"],
  mongodb: ["mongo"],
  kubernetes: ["k8s"],
  "ci/cd": ["cicd", "ci cd", "continuous integration", "continuous deployment"],
  "amazon web services": ["aws"],
  "google cloud platform": ["gcp"],
  "machine learning": ["ml"],
  "artificial intelligence": ["ai"],
  "natural language processing": ["nlp"],
  "user interface": ["ui"],
  "user experience": ["ux"],
  "search engine optimization": ["seo"],
  "application programming interface": ["api"],
};

const REVERSE_ALIASES = new Map<string, string>();
for (const [canonical, aliases] of Object.entries(ALIASES)) {
  for (const alias of aliases) {
    REVERSE_ALIASES.set(alias, canonical);
  }
  REVERSE_ALIASES.set(canonical, canonical);
}

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with","by",
  "is","are","was","were","be","been","have","has","had","do","does","did",
  "will","would","could","should","may","might","can","shall","must","need",
  "about","above","after","again","all","also","am","as","before","between",
  "both","come","day","each","even","find","from","get","give","go","good",
  "great","here","him","his","her","how","if","into","it","its","just","know",
  "let","like","look","make","many","me","more","most","my","new","no","not",
  "now","number","old","only","other","our","out","over","own","part","people",
  "say","see","she","so","some","take","tell","than","that","them","then",
  "there","these","they","thing","think","this","those","through","time","too",
  "two","up","us","use","very","want","way","we","well","what","when","which",
  "who","why","work","world","year","you","your","such","being","able","etc",
  "including","using","within","across","working","strong","experience",
  "understanding","ability","role","team","join","company","required",
  "preferred","minimum","plus","years","position","responsibilities",
  "qualifications","requirements","description","job","candidate","ideal",
  "looking","opportunity","environment","based","related","relevant",
  "dear","students","student","market","hello","hi","greetings","sir","madam",
  "please","thank","thanks","regards","sincerely","respectfully","hereby",
  "apply","applying","application","submit","submitting","attached","resume",
  "cover","letter","curriculum","vitae","cv","enclosed","following","below",
  "above","mentioned","noted","herewith","kindly","request","requested",
  "would","like","interested","passion","passionate","excited","exciting",
  "dynamic","innovative","fast","paced","self","motivated","driven","oriented",
  "proven","track","record","leverage","leveraging","utilize","utilizing",
  "seeking","seek","eager","forward","contribute","contributing","growth",
  "growing","industry","field","sector","domain","landscape","ecosystem",
  "trends","trending","emerging","cutting","edge","state","art",
]);

const ACTION_VERBS = [
  "led","managed","developed","implemented","designed","created","built",
  "increased","reduced","improved","launched","delivered","optimized",
  "architected","automated","collaborated","coordinated","directed",
  "engineered","established","executed","facilitated","generated",
  "integrated","maintained","mentored","migrated","orchestrated",
  "pioneered","refactored","resolved","scaled","spearheaded",
  "streamlined","supervised","transformed","troubleshot","deployed",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s.#+/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  const normalized = normalize(text);
  return normalized
    .split(/\s+/)
    .map(w => w.replace(/^[.-]+|[.-]+$/g, ""))
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function canonicalize(term: string): string {
  return REVERSE_ALIASES.get(term) ?? term;
}

export function analyzeResume(resume: ResumeData, jobDescription: string): AnalysisResult {
  const jdKeywords = extractKeywords(jobDescription);
  const { matched, missing } = matchKeywords(resume.rawText, jdKeywords);

  const skillsScore = calculateSkillsScore(resume.skills, jdKeywords);
  const experienceScore = calculateExperienceScore(resume.experience, resume.rawText, normalize(jobDescription));
  const keywordsScore = calculateKeywordsScore(matched.length, jdKeywords.length);
  const formattingScore = calculateFormattingScore(resume.rawText);

  // Weighted total: Skills 30%, Experience 30%, Keywords 25%, Formatting 15%
  const overallScore = Math.round(
    skillsScore * 0.30 +
    experienceScore * 0.30 +
    keywordsScore * 0.25 +
    formattingScore * 0.15
  );

  const suggestions = generateSuggestions(resume, missing, {
    skills: skillsScore,
    experience: experienceScore,
    keywords: keywordsScore,
    formatting: formattingScore,
  });

  return {
    overallScore,
    sectionScores: {
      skills: skillsScore,
      experience: experienceScore,
      keywords: keywordsScore,
      formatting: formattingScore,
    },
    missingKeywords: missing,
    suggestions,
    matchedKeywords: matched,
    jobDescription,
    analyzedAt: new Date().toISOString(),
  };
}

function extractKeywords(jobDescription: string): string[] {
  const tokens = tokenize(jobDescription);
  const keywordSet = new Set<string>();

  for (const token of tokens) {
    const canonical = canonicalize(token);
    if (canonical.length > 1) {
      keywordSet.add(canonical);
    }
  }

  const normalizedJD = normalize(jobDescription);
  const multiWordTerms = [
    "machine learning", "deep learning", "data science", "data analysis",
    "data engineering", "project management", "product management",
    "system design", "software engineering", "web development",
    "mobile development", "cloud computing", "computer vision",
    "natural language processing", "rest api", "graphql api",
    "user experience", "user interface", "quality assurance",
    "test driven development", "continuous integration",
    "agile methodology", "scrum master", "full stack",
    "front end", "back end", "power bi", "material ui",
    "node.js", "next.js", "vue.js", "react.js", "express.js",
    "ci/cd",
  ];
  for (const term of multiWordTerms) {
    if (normalizedJD.includes(term)) {
      keywordSet.add(term);
    }
  }

  return Array.from(keywordSet).filter(kw => kw.length > 1);
}

function matchKeywords(resumeText: string, jdKeywords: string[]): { matched: string[]; missing: string[] } {
  const resumeNormalized = normalize(resumeText);
  const resumeTokens = new Set(tokenize(resumeText).map(canonicalize));

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of jdKeywords) {
    if (resumeContainsKeyword(resumeNormalized, resumeTokens, kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  return { matched, missing };
}

function resumeContainsKeyword(resumeNormalized: string, resumeTokens: Set<string>, keyword: string): boolean {
  if (resumeNormalized.includes(keyword)) return true;
  const aliases = ALIASES[keyword];
  if (aliases) {
    for (const alias of aliases) {
      if (resumeNormalized.includes(alias)) return true;
    }
  }
  const canonical = REVERSE_ALIASES.get(keyword);
  if (canonical && canonical !== keyword && resumeNormalized.includes(canonical)) return true;
  if (!keyword.includes(" ")) {
    if (resumeTokens.has(keyword)) return true;
    if (canonical && resumeTokens.has(canonical)) return true;
  }
  return false;
}

function calculateSkillsScore(resumeSkills: string[], jdKeywords: string[]): number {
  if (jdKeywords.length === 0) return 80;
  const skillSet = new Set(resumeSkills.map(s => canonicalize(s.toLowerCase())));
  let matchCount = 0;
  for (const kw of jdKeywords) {
    const canonical = canonicalize(kw);
    if (skillSet.has(canonical)) {
      matchCount++;
      continue;
    }
    for (const skill of skillSet) {
      if (skill.includes(canonical) || canonical.includes(skill)) {
        matchCount++;
        break;
      }
    }
  }
  const ratio = matchCount / Math.max(jdKeywords.length, 1);
  return Math.max(5, Math.min(100, Math.round(ratio * 130)));
}

function calculateExperienceScore(experience: ResumeData["experience"], resumeText: string, jdNormalized: string): number {
  let score = 0;
  const textLower = resumeText.toLowerCase();

  if (experience.length >= 3) score += 25;
  else if (experience.length >= 2) score += 20;
  else if (experience.length >= 1) score += 15;

  const verbCount = ACTION_VERBS.filter(v => textLower.includes(v)).length;
  score += Math.min(25, verbCount * 4);

  const metricPatterns = [/\d+\s*%/g, /\$[\d,]+/g, /\d+\s*(?:users|clients|projects|customers)/gi];
  let metricCount = 0;
  for (const pattern of metricPatterns) {
    const matches = textLower.match(pattern);
    if (matches) metricCount += matches.length;
  }
  score += Math.min(25, metricCount * 5);

  if (jdNormalized) {
    const jdTokens = new Set(tokenize(jdNormalized));
    const expText = experience.map(e => `${e.title} ${e.company} ${e.description}`).join(" ").toLowerCase();
    const expTokens = tokenize(expText);
    const overlap = expTokens.filter(t => jdTokens.has(canonicalize(t))).length;
    const relevanceRatio = overlap / Math.max(jdTokens.size, 1);
    score += Math.min(25, Math.round(relevanceRatio * 80));
  }

  return Math.max(5, Math.min(100, score));
}

function calculateKeywordsScore(matched: number, total: number): number {
  if (total === 0) return 50;
  return Math.max(5, Math.min(100, Math.round((matched / total) * 110)));
}

function calculateFormattingScore(text: string): number {
  let score = 30;
  const sections = ["experience", "education", "skills", "summary", "objective", "projects"];
  const foundSections = sections.filter(s => new RegExp(`\\b${s}\\b`, "i").test(text));
  score += Math.min(20, foundSections.length * 5);

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 250 && wordCount <= 1000) score += 15;

  if (/[\w.-]+@[\w.-]+\.\w+/.test(text)) score += 10;
  if (/[•\-–—]\s/.test(text)) score += 10;

  return Math.max(5, Math.min(100, score));
}

function generateSuggestions(resume: ResumeData, missingKeywords: string[], scores: { skills: number, experience: number, keywords: number, formatting: number }): AnalysisResult["suggestions"] {
  const suggestions: AnalysisResult["suggestions"] = [];
  if (missingKeywords.length > 0) {
    suggestions.push({
      category: "Keywords",
      text: `Add missing keywords: ${missingKeywords.slice(0, 5).join(", ")}.`,
      priority: "high",
    });
  }
  if (scores.experience < 70) {
    suggestions.push({
      category: "Experience",
      text: "Add quantifiable metrics and action verbs to your experience bullets.",
      priority: "high",
    });
  }
  return suggestions;
}