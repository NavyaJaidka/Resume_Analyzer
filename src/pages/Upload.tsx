import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useResume } from "@/contexts/ResumeContext";
import * as api from "@/lib/api";
import { Upload, FileText, Loader2, ArrowRight, AlertCircle } from "lucide-react";

export default function UploadPage() {
  const { currentResume, setCurrentResume, addResume, jobDescription, setJobDescription, setCurrentAnalysis, saveAnalysis } = useResume();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFile = useCallback(async (file: File) => {
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const validExtensions = [".pdf", ".docx"];
    if (!validTypes.includes(file.type) && !validExtensions.some(ext => file.name.endsWith(ext))) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }

    setError("");
    setIsUploading(true);
    try {
      const parsed = await api.uploadResume(file);
      addResume(parsed);
      setCurrentResume(parsed);
    } catch (e) {
      setError("Failed to upload resume to server. Please ensure the backend is running.");
    } finally {
      setIsUploading(false);
    }
  }, [addResume, setCurrentResume]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!currentResume || !jobDescription.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await api.analyzeResume(currentResume.id, jobDescription);
      result.jobDescription = jobDescription;
      setCurrentAnalysis(result);
      saveAnalysis(currentResume.id, result);

      // Update resume with analysis date
      const updated = { ...currentResume, lastAnalyzedDate: new Date().toISOString() };
      setCurrentResume(updated);
      navigate("/analysis");
    } catch (e) {
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10" style={{ animation: "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards" }}>
            <h1 className="text-3xl font-bold text-foreground mb-1">Upload & Analyze</h1>
            <p className="text-muted-foreground">Upload your resume and paste the job description to get your ATS score.</p>
          </div>

          {/* Step 1: Upload */}
          <div className="mb-8" style={{ animation: "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 100ms forwards", opacity: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
              <h2 className="text-lg font-semibold text-foreground">Upload Resume</h2>
            </div>

            {currentResume ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{currentResume.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentResume.skills.length} skills · {currentResume.experience.length} roles · {currentResume.education.length} education
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentResume(null)}>
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200 cursor-pointer ${
                  isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/40 hover:bg-muted/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                {isUploading ? (
                  <Loader2 className="h-10 w-10 text-primary mx-auto mb-4 animate-spin" />
                ) : (
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                )}
                <p className="font-medium text-foreground mb-1">
                  {isUploading ? "Parsing resume..." : "Drop your resume here or click to browse"}
                </p>
                <p className="text-sm text-muted-foreground">PDF or DOCX, up to 10MB</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 mt-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Step 2: Job Description */}
          <div className="mb-8" style={{ animation: "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 200ms forwards", opacity: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${currentResume ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div>
              <h2 className={`text-lg font-semibold ${currentResume ? "text-foreground" : "text-muted-foreground"}`}>Paste Job Description</h2>
            </div>

            <textarea
              className="w-full rounded-xl border border-border bg-card p-5 text-foreground text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow disabled:opacity-50 min-h-[200px]"
              placeholder="Paste the full job description here to compare against your resume..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={!currentResume}
            />
          </div>

          {/* Analyze button */}
          <div style={{ animation: "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 300ms forwards", opacity: 0 }}>
            <Button
              variant="hero"
              size="xl"
              className="w-full"
              disabled={!currentResume || !jobDescription.trim() || isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Resume
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
