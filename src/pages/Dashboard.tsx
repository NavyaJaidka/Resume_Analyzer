import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useResume } from "@/contexts/ResumeContext";
import { FileText, Plus, Trash2, Calendar, BarChart3, TrendingUp, Eye } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { resumes, analyses, deleteResume, setCurrentResume, setCurrentAnalysis, getAnalysesForResume, getAverageScore } = useResume();
  const [expandedResume, setExpandedResume] = useState<string | null>(null);
  const avgScore = getAverageScore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
              <p className="text-muted-foreground">Manage your uploaded resumes and analysis history.</p>
            </div>
            <Link to="/upload">
              <Button variant="default" size="lg">
                <Plus className="h-4 w-4" />
                Upload resume
              </Button>
            </Link>
          </div>

          {/* Average ATS Score */}
          {avgScore !== null && (
            <div className="rounded-xl border border-border bg-card p-6 mb-8 flex items-center gap-6" style={{ animation: "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}>
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Average ATS Score</p>
                <p className="text-3xl font-extrabold text-foreground">{avgScore}<span className="text-lg text-muted-foreground font-normal"> / 100</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">Across {analyses.length} {analyses.length === 1 ? "analysis" : "analyses"}</p>
              </div>
            </div>
          )}

          {resumes.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border bg-card p-16 text-center" style={{ animation: "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards" }}>
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
                <FileText className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No resumes yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Upload your first resume to get an ATS compatibility score and improvement suggestions.
              </p>
              <Link to="/upload">
                <Button variant="default">
                  <Plus className="h-4 w-4" />
                  Upload your first resume
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {resumes.map((resume, i) => {
                const resumeAnalyses = getAnalysesForResume(resume.id);
                const isExpanded = expandedResume === resume.id;

                return (
                  <div
                    key={resume.id}
                    className="rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
                    style={{ animation: `fade-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 70}ms forwards`, opacity: 0 }}
                  >
                    <div className="p-6 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{resume.fileName}</h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(resume.uploadDate).toLocaleDateString()}
                          </span>
                          <span>{resume.skills.length} skills · {resume.experience.length} roles</span>
                          {resumeAnalyses.length > 0 && (
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              {resumeAnalyses.length} {resumeAnalyses.length === 1 ? "analysis" : "analyses"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {resumeAnalyses.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedResume(isExpanded ? null : resume.id)}
                          >
                            <Eye className="h-4 w-4" />
                            History
                          </Button>
                        )}
                        <Link to="/upload" onClick={() => setCurrentResume(resume)}>
                          <Button variant="outline" size="sm">Analyze</Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteResume(resume.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expandable analysis history */}
                    {isExpanded && resumeAnalyses.length > 0 && (
                      <div className="border-t border-border px-6 py-4 bg-muted/30">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Past Analyses</p>
                        <div className="space-y-2">
                          {resumeAnalyses.map((analysis) => (
                            <Link
                              key={analysis.id}
                              to="/analysis"
                              onClick={() => {
                                setCurrentResume(resume);
                                setCurrentAnalysis(analysis.result);
                              }}
                              className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`text-sm font-bold ${
                                  analysis.result.overallScore >= 80 ? "score-excellent" :
                                  analysis.result.overallScore >= 60 ? "score-good" :
                                  analysis.result.overallScore >= 40 ? "score-fair" : "score-poor"
                                }`}>
                                  {analysis.result.overallScore}/100
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Skills {analysis.result.sectionScores.skills}% · Experience {analysis.result.sectionScores.experience}% · Keywords {analysis.result.sectionScores.keywords}%
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(analysis.analyzedAt).toLocaleString()}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
