import type { ResumeData, AnalysisResult } from "@/contexts/ResumeContext";

// ── Aliases for common abbreviations ──
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

// Build reverse lookup: alias → canonical
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
  // Generic filler / non-job-specific words
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

// ── Normalize text: lowercase, strip punctuation, split combined tokens ──
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[^\w\s.#+/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Tokenize into individual meaningful words ──
function tokenize(text: string): string[] {
  const normalized = normalize(text);
  return normalized
    .split(/\s+/)
    .map(w => w.replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

// ── Canonicalize a term using alias map ──
function canonicalize(term: string): string {
  return REVERSE_ALIASES.get(term) ?? term;
}

// ── Extract meaningful keywords from JD ──
export function extractKeywords(jobDescription: string): string[] {
  const tokens = tokenize(jobDescription);
  const keywordSet = new Set<string>();

  // Single tokens (canonicalized, deduplicated)
  for (const token of tokens) {
    const canonical = canonicalize(token);
    if (canonical.length > 1) {
      keywordSet.add(canonical);
    }
  }

  // Known multi-word terms
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

  // Remove very generic single-char or noise tokens
  const results = Array.from(keywordSet).filter(kw => kw.length > 1);
  
  console.debug("[ATS] Extracted JD keywords:", results);
  return results;
}

// ── Check if resume text contains a keyword (with alias awareness) ──
function resumeContainsKeyword(resumeNormalized: string, resumeTokens: Set<string>, keyword: string): boolean {
  // Direct phrase match
  if (resumeNormalized.includes(keyword)) return true;

  // Check all aliases of this keyword
  const aliases = ALIASES[keyword];
  if (aliases) {
    for (const alias of aliases) {
      if (resumeNormalized.includes(alias)) return true;
    }
  }

  // Check if the keyword is an alias and the canonical form exists
  const canonical = REVERSE_ALIASES.get(keyword);
  if (canonical && canonical !== keyword && resumeNormalized.includes(canonical)) return true;

  // Individual token match for single-word keywords
  if (!keyword.includes(" ")) {
    if (resumeTokens.has(keyword)) return true;
    if (canonical && resumeTokens.has(canonical)) return true;
  }

  return false;
}

// ── Match keywords between resume and JD ──
export function matchKeywords(
  resumeText: string,
  jdKeywords: string[]
): { matched: string[]; missing: string[] } {
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

  console.debug("[ATS] Matched:", matched.length, "Missing:", missing.length);
  return { matched, missing };
}

// ── Skills score (30%) ──
function calculateSkillsScore(resumeSkills: string[], jdKeywords: string[]): number {
  if (jdKeywords.length === 0) {
    return Math.min(100, resumeSkills.length * 8);
  }

  const skillSet = new Set(resumeSkills.map(s => canonicalize(s.toLowerCase())));
  
  // Count how many JD keywords are covered by resume skills
  let matchCount = 0;
  for (const kw of jdKeywords) {
    const canonical = canonicalize(kw);
    if (skillSet.has(canonical)) {
      matchCount++;
      continue;
    }
    // Check if any skill contains or is contained by the keyword
    for (const skill of skillSet) {
      if (skill.includes(canonical) || canonical.includes(skill)) {
        matchCount++;
        break;
      }
    }
  }

  const ratio = matchCount / Math.max(jdKeywords.length, 1);
  // Scale so that covering 60%+ of keywords gives high scores
  const score = Math.round(Math.min(100, ratio * 130));
  
  console.debug("[ATS] Skills score:", score, `(${matchCount}/${jdKeywords.length} keywords matched by skills)`);
  return Math.max(5, Math.min(100, score));
}

// ── Experience score (30%) ──
function calculateExperienceScore(
  experience: ResumeData["experience"],
  resumeText: string,
  jdNormalized: string
): number {
  let score = 0;
  const textLower = resumeText.toLowerCase();

  // 1. Experience exists (up to 25 pts)
  if (experience.length >= 3) score += 25;
  else if (experience.length >= 2) score += 20;
  else if (experience.length >= 1) score += 15;
  // Even if parser failed, check raw text for experience indicators
  else if (/(?:experience|work history|employment|professional)/i.test(resumeText)) {
    score += 10;
  }

  // 2. Action verbs (up to 25 pts)
  const verbCount = ACTION_VERBS.filter(v => textLower.includes(v)).length;
  score += Math.min(25, verbCount * 4);

  // 3. Quantifiable metrics (up to 25 pts)
  const metricPatterns = [
    /\d+\s*%/g,
    /\$[\d,]+/g,
    /\d+\s*(?:users|clients|projects|customers|employees|team members|people)/gi,
    /\d+x\b/gi,
    /(?:increased|reduced|improved|grew|saved|generated|managed)\s+.*?\d+/gi,
  ];
  let metricCount = 0;
  for (const pattern of metricPatterns) {
    const matches = textLower.match(pattern);
    if (matches) metricCount += matches.length;
  }
  score += Math.min(25, metricCount * 5);

  // 4. Relevance to JD (up to 25 pts)
  if (jdNormalized) {
    const jdTokens = new Set(tokenize(jdNormalized));
    const expText = experience.map(e => `${e.title} ${e.company} ${e.description}`).join(" ").toLowerCase();
    const expTokens = tokenize(expText);
    const overlap = expTokens.filter(t => jdTokens.has(canonicalize(t))).length;
    const relevanceRatio = overlap / Math.max(jdTokens.size, 1);
    score += Math.min(25, Math.round(relevanceRatio * 80));
  }

  const finalScore = Math.max(5, Math.min(100, score));
  console.debug("[ATS] Experience score:", finalScore, `(entries: ${experience.length}, verbs: ${verbCount}, metrics: ${metricCount})`);
  return finalScore;
}

// ── Keywords score (25%) ──
function calculateKeywordsScore(matched: number, total: number): number {
  if (total === 0) return 50;
  const ratio = matched / total;
  // Generous curve: 50% match → ~70 score, 80%+ → 90+
  const score = Math.round(ratio * 110);
  const final = Math.max(5, Math.min(100, score));
  console.debug("[ATS] Keywords score:", final, `(${matched}/${total})`);
  return final;
}

// ── Formatting score (15%) ──
function calculateFormattingScore(text: string): number {
  let score = 30; // base

  // Has clear section headings
  const sections = ["experience", "education", "skills", "summary", "objective", "projects", "certifications"];
  const foundSections = sections.filter(s => new RegExp(`\\b${s}\\b`, "i").test(text));
  score += Math.min(20, foundSections.length * 5);

  // Reasonable word count (300-800 is ideal for 1-2 pages)
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 250 && wordCount <= 1000) score += 15;
  else if (wordCount >= 150) score += 8;
  else if (wordCount < 100) score -= 10;

  // Has contact info
  if (/[\w.-]+@[\w.-]+\.\w+/.test(text)) score += 10;
  if (/(?:\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/.test(text)) score += 5;

  // Has bullet points or structured content
  if (/[•\-–—]\s/.test(text) || /^\s*[-•]\s/m.test(text)) score += 10;

  // Not too dense (reasonable blank line ratio)
  const lines = text.split("\n");
  const nonEmpty = lines.filter(l => l.trim().length > 0).length;
  if (nonEmpty > 10) score += 10;

  const final = Math.max(5, Math.min(100, score));
  console.debug("[ATS] Formatting score:", final, `(sections: ${foundSections.length}, words: ${wordCount})`);
  return final;
}

// ── Generate data-driven suggestions ──
function generateSuggestions(
  resume: ResumeData,
  missingKeywords: string[],
  scores: { skills: number; experience: number; keywords: number; formatting: number }
): AnalysisResult["suggestions"] {
  const suggestions: AnalysisResult["suggestions"] = [];
  const textLower = resume.rawText.toLowerCase();

  // Keyword suggestions
  if (missingKeywords.length > 0) {
    const top = missingKeywords.slice(0, 6).join(", ");
    suggestions.push({
      category: "Keywords",
      text: `Your resume is missing these key terms from the job description: ${top}. Add them naturally in your skills or experience sections.`,
      priority: missingKeywords.length > 5 ? "high" : "medium",
    });
  }

  // Experience: missing metrics
  const hasMetrics = /\d+\s*%|\$[\d,]+|\d+\s*(?:users|clients|projects)/i.test(textLower);
  if (!hasMetrics && scores.experience < 80) {
    suggestions.push({
      category: "Experience",
      text: "Add quantifiable achievements (e.g., 'Increased revenue by 25%', 'Managed a team of 12', 'Reduced load time by 40%').",
      priority: "high",
    });
  }

  // Experience: weak action verbs
  const verbCount = ACTION_VERBS.filter(v => textLower.includes(v)).length;
  if (verbCount < 3) {
    suggestions.push({
      category: "Experience",
      text: `Use strong action verbs to start bullet points: Led, Developed, Implemented, Architected, Optimized, Spearheaded.`,
      priority: verbCount === 0 ? "high" : "medium",
    });
  }

  // Skills section
  if (resume.skills.length < 5 && scores.skills < 60) {
    suggestions.push({
      category: "Skills",
      text: "Add a dedicated skills section listing technical tools, languages, and frameworks relevant to the role.",
      priority: "high",
    });
  }

  // Formatting
  if (scores.formatting < 60) {
    const missingSections: string[] = [];
    if (!/summary|objective|profile/i.test(textLower)) missingSections.push("Summary/Profile");
    if (!/experience|employment/i.test(textLower)) missingSections.push("Experience");
    if (!/education/i.test(textLower)) missingSections.push("Education");
    if (!/skills/i.test(textLower)) missingSections.push("Skills");
    
    if (missingSections.length > 0) {
      suggestions.push({
        category: "Formatting",
        text: `Add clear section headings for: ${missingSections.join(", ")}. ATS systems rely on standard headings to parse your resume.`,
        priority: "medium",
      });
    }
  }

  // Contact info
  if (!/[\w.-]+@[\w.-]+\.\w+/.test(resume.rawText)) {
    suggestions.push({
      category: "Contact",
      text: "Include your email address at the top. Many ATS systems flag resumes without contact information.",
      priority: "high",
    });
  }

  // Education
  if (resume.education.length === 0 && !/education/i.test(textLower)) {
    suggestions.push({
      category: "Education",
      text: "Add an Education section with your degree, institution, and graduation year.",
      priority: "medium",
    });
  }

  // Length check
  const wordCount = resume.rawText.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 200) {
    suggestions.push({
      category: "Content",
      text: "Your resume appears too brief. Aim for 300-600 words to adequately describe your qualifications.",
      priority: "high",
    });
  } else if (wordCount > 1000) {
    suggestions.push({
      category: "Content",
      text: "Your resume may be too long. Consider condensing to 1-2 pages for better ATS compatibility.",
      priority: "low",
    });
  }

  return suggestions;
}

// ── Main analysis function ──
export function analyzeResume(resume: ResumeData, jobDescription: string): AnalysisResult {
  console.debug("[ATS] ═══ Starting analysis ═══");
  console.debug("[ATS] Resume:", resume.fileName, "| Text length:", resume.rawText.length);
  console.debug("[ATS] Skills found:", resume.skills);
  console.debug("[ATS] Experience entries:", resume.experience.length);

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

  console.debug("[ATS] ═══ Final Scores ═══");
  console.debug("[ATS] Skills:", skillsScore, "| Experience:", experienceScore, "| Keywords:", keywordsScore, "| Formatting:", formattingScore);
  console.debug("[ATS] Overall:", overallScore);

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
  };
}
