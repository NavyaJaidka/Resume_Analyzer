import { FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <FileText className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm text-foreground">ResumeIQ</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ResumeIQ. Built to help you land interviews.
        </p>
      </div>
    </footer>
  );
}
