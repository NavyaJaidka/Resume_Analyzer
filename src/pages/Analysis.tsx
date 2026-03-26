import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useResume } from "@/contexts/ResumeContext";
import { ArrowLeft, Download, Target, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb, FileText, BookOpen, Wrench, ExternalLink } from "lucide-react";
import { useEffect, useRef } from "react";
import { generateLatex, openInOverleaf } from "@/lib/latexGenerator";
import * as api from "@/lib/api";

function ScoreRing({ score, size = 140, strokeWidth = 10 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.strokeDashoffset = String(circumference);
      requestAnimationFrame(() => {
        if (ref.current) ref.current.style.strokeDashoffset = String(offset);
      });
    }
  }, [circumference, offset]);

  const color = score >= 80 ? "var(--score-excellent)" : score >= 60 ? "var(--score-good)" : score >= 40 ? "var(--score-fair)" : "var(--score-poor)";
  const colorClass = score >= 80 ? "score-excellent" : score >= 60 ? "score-good" : score >= 40 ? "score-fair" : "score-poor";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} />
        <circle
          ref={ref}
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={`hsl(${color})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-extrabold ${colorClass}`}>{score}</span>
        <span className="text-xs text-muted-foreground font-medium">/ 100</span>
      </div>
    </div>
  );
}

function SectionBar({ label, score, icon: Icon, delay }: { label: string; score: number; icon: any; delay: number }) {
  const colorClass = score >= 80 ? "bg-score-excellent" : score >= 60 ? "bg-score-good" : score >= 40 ? "bg-score-fair" : "bg-score-poor";
  const textColor = score >= 80 ? "score-excellent" : score >= 60 ? "score-good" : score >= 40 ? "score-fair" : "score-poor";

  return (
    <div style={{ animation: `slide-left 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms forwards`, opacity: 0 }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className={`text-sm font-bold ${textColor}`}>{score}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%`, transitionDelay: `${delay + 200}ms` }}
        />
      </div>
    </div>
  );
}

export default function Analysis() {
  const { currentResume, currentAnalysis } = useResume();
  const navigate = useNavigate();

  if (!currentAnalysis || !currentResume) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-10">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No analysis yet</h2>
            <p className="text-muted-foreground mb-6">Upload and analyze a resume first.</p>
            <Link to="/upload"><Button>Go to upload</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { overallScore, sectionScores, missingKeywords, suggestions, matchedKeywords } = currentAnalysis;
  const priorityIcon = (p: string) => p === "high" ? AlertTriangle : p === "medium" ? Lightbulb : CheckCircle2;
  const priorityColor = (p: string) => p === "high" ? "text-destructive" : p === "medium" ? "text-accent" : "text-primary";

  const handleDownloadPdf = async () => {
    try {
      const blob = await api.downloadResume(currentResume.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimized-resume-${currentResume.fileName.replace(/\.[^.]+$/, "")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download resume:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10" style={{ animation: "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards" }}>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/upload")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Analysis Report</h1>
                <p className="text-sm text-muted-foreground">{currentResume.fileName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleDownloadPdf}>
                <Download className="h-4 w-4" />
                Download report
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  const latex = generateLatex(currentResume);
                  openInOverleaf(latex);
                }}
              >
                <ExternalLink className="h-4 w-4" />
                Edit in Overleaf
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Score */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-xl border border-border bg-card p-8 text-center" style={{ animation: "scale-in 0.5s cubic-bezier(0.16,1,0.3,1) 100ms forwards", opacity: 0 }}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">ATS Score</h2>
                <ScoreRing score={overallScore} />
                <p className="mt-4 text-sm text-muted-foreground">
                  {overallScore >= 80 ? "Excellent match! Your resume is well optimized." :
                   overallScore >= 60 ? "Good match. A few improvements could help." :
                   overallScore >= 40 ? "Fair match. Several areas need attention." :
                   "Low match. Significant changes recommended."}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-5" style={{ animation: "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 200ms forwards", opacity: 0 }}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Section Scores</h3>
                <SectionBar label="Skills Match" score={sectionScores.skills} icon={Wrench} delay={300} />
                <SectionBar label="Experience" score={sectionScores.experience} icon={BookOpen} delay={400} />
                <SectionBar label="Keywords" score={sectionScores.keywords} icon={Target} delay={500} />
                <SectionBar label="Formatting" score={sectionScores.formatting} icon={FileText} delay={600} />
              </div>
            </div>

            {/* Right: Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Keywords */}
              <div className="rounded-xl border border-border bg-card p-6" style={{ animation: "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 200ms forwards", opacity: 0 }}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Keyword Analysis</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      Matched ({matchedKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {matchedKeywords.slice(0, 15).map(kw => (
                        <span key={kw} className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{kw}</span>
                      ))}
                      {matchedKeywords.length === 0 && <span className="text-sm text-muted-foreground">None detected</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      Missing ({missingKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {missingKeywords.slice(0, 15).map(kw => (
                        <span key={kw} className="inline-flex items-center rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">{kw}</span>
                      ))}
                      {missingKeywords.length === 0 && <span className="text-sm text-muted-foreground">Great coverage!</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="rounded-xl border border-border bg-card p-6" style={{ animation: "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 350ms forwards", opacity: 0 }}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">How to Improve</h3>
                <div className="space-y-4">
                  {suggestions.map((s, i) => {
                    const Icon = priorityIcon(s.priority);
                    return (
                      <div
                        key={i}
                        className="flex gap-3 p-4 rounded-lg bg-muted/50 border border-border/50"
                        style={{ animation: `slide-left 0.4s cubic-bezier(0.16,1,0.3,1) ${400 + i * 80}ms forwards`, opacity: 0 }}
                      >
                        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${priorityColor(s.priority)}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.category}</span>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                              s.priority === "high" ? "bg-destructive/10 text-destructive" :
                              s.priority === "medium" ? "bg-accent/10 text-accent" :
                              "bg-primary/10 text-primary"
                            }`}>
                              {s.priority}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{s.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resume data preview */}
              <div className="rounded-xl border border-border bg-card p-6" style={{ animation: "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 500ms forwards", opacity: 0 }}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Parsed Resume Data</h3>

                {currentResume.skills.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Skills Detected</p>
                    <div className="flex flex-wrap gap-2">
                      {currentResume.skills.map(s => (
                        <span key={s} className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {currentResume.experience.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Experience</p>
                    <div className="space-y-3">
                      {currentResume.experience.map((exp, i) => (
                        <div key={i} className="p-3 rounded-lg border border-border/50">
                          <p className="font-medium text-sm text-foreground">{exp.title}</p>
                          {exp.company && <p className="text-xs text-muted-foreground">{exp.company}</p>}
                          {exp.duration && <p className="text-xs text-muted-foreground">{exp.duration}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentResume.education.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Education</p>
                    <div className="space-y-2">
                      {currentResume.education.map((edu, i) => (
                        <div key={i} className="p-3 rounded-lg border border-border/50">
                          <p className="font-medium text-sm text-foreground">{edu.degree}</p>
                          {edu.institution && <p className="text-xs text-muted-foreground">{edu.institution}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
