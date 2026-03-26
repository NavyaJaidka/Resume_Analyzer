import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileText, Target, TrendingUp, Download, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.animationPlayState = "running"; el.classList.add("opacity-100"); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

const features = [
  { icon: FileText, title: "Smart Parsing", desc: "Upload PDF or DOCX resumes and get structured data extracted automatically — skills, experience, education." },
  { icon: Target, title: "ATS Score", desc: "Paste any job description and see how well your resume matches. Get a 0–100 score broken down by category." },
  { icon: TrendingUp, title: "Actionable Tips", desc: "Receive specific suggestions on missing keywords, weak bullet points, and formatting improvements." },
  { icon: Download, title: "Export Ready", desc: "Download your optimized resume as a clean PDF, ready to submit to any job portal or recruiter." },
];

const steps = [
  { num: "01", title: "Upload", desc: "Drop your resume PDF or DOCX file" },
  { num: "02", title: "Analyze", desc: "Paste the job description to compare" },
  { num: "03", title: "Optimize", desc: "Follow suggestions to boost your score" },
];

export default function Index() {
  const featuresRef = useScrollReveal();
  const stepsRef = useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient absolute inset-0 opacity-[0.03]" />
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-32 md:pb-36">
          <div className="max-w-2xl" style={{ animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards" }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-sm text-primary font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Free ATS Resume Analyzer
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.08] mb-6">
              Land more interviews with an{" "}
              <span className="text-gradient-primary">ATS-optimized</span>{" "}
              resume
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
              Upload your resume, paste a job description, and get an instant ATS compatibility score with actionable improvement suggestions.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/upload">
                <Button variant="hero" size="xl">
                  Analyze your resume
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="hero-outline" size="xl">
                  View dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28" ref={featuresRef} style={{ opacity: 0, animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards", animationPlayState: "paused" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything you need to beat the bots</h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Most resumes get rejected by ATS before a human ever sees them. Fix that.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/15">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 md:py-28 bg-muted/40" ref={stepsRef} style={{ opacity: 0, animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards", animationPlayState: "paused" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Three steps to a stronger resume</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="text-center" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-5xl font-extrabold text-primary/15 mb-3">{s.num}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="rounded-2xl hero-gradient p-12 md:p-16" style={{ animation: "scale-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}>
            <CheckCircle2 className="h-10 w-10 text-primary-foreground/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Ready to optimize your resume?</h2>
            <p className="text-primary-foreground/70 text-lg mb-8 max-w-md mx-auto">
              Join thousands of job seekers who improved their ATS scores and landed more interviews.
            </p>
            <Link to="/upload">
              <Button size="xl" className="bg-background text-foreground hover:bg-background/90 shadow-xl font-semibold">
                Get started free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
