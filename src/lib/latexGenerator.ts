import type { ResumeData } from "@/contexts/ResumeContext";

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}~^]/g, m => `\\${m}`)
    .replace(/\n/g, " ");
}

export function generateLatex(resume: ResumeData): string {
  const e = escapeLatex;

  const skillsList = resume.skills.length > 0
    ? resume.skills.map(s => e(s)).join(", ")
    : "Add your skills here";

  const experienceEntries = resume.experience.length > 0
    ? resume.experience.map(exp => `
\\subsection*{${e(exp.title)}${exp.company ? ` -- ${e(exp.company)}` : ""}}
${exp.duration ? `\\textit{${e(exp.duration)}}\\\\` : ""}
${exp.description ? e(exp.description) : "Describe your responsibilities and achievements here."}
`).join("\n")
    : "\\textit{Add your work experience here.}\n";

  const educationEntries = resume.education.length > 0
    ? resume.education.map(edu => `
\\subsection*{${e(edu.degree)}${edu.institution ? ` -- ${e(edu.institution)}` : ""}}
${edu.year ? `\\textit{${e(edu.year)}}` : ""}
`).join("\n")
    : "\\textit{Add your education here.}\n";

  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage[utf8]{inputenc}

\\titleformat{\\section}{\\Large\\bfseries}{}{0em}{}[\\titlerule]
\\titleformat{\\subsection}[runin]{\\bfseries}{}{0em}{}

\\pagestyle{empty}

\\begin{document}

% ── Header ──
\\begin{center}
{\\LARGE\\bfseries ${e(resume.fileName.replace(/\.[^.]+$/, ""))}}\\\\[4pt]
\\textit{Update with your contact info: email, phone, LinkedIn}
\\end{center}

\\vspace{8pt}

% ── Skills ──
\\section*{Skills}
${skillsList}

% ── Experience ──
\\section*{Experience}
${experienceEntries}

% ── Education ──
\\section*{Education}
${educationEntries}

\\end{document}
`;
}

export function openInOverleaf(latexCode: string) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://www.overleaf.com/docs";
  form.target = "_blank";

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "snip_uri";
  input.value = `data:application/x-tex;base64,${btoa(unescape(encodeURIComponent(latexCode)))}`;

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
