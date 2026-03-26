import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, FileText, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/upload", label: "Upload" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">ResumeIQ</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path}>
              <Button
                variant="ghost"
                size="sm"
                className={isActive(link.path) ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border px-6 py-4 bg-background space-y-1">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}>
              <Button
                variant="ghost"
                className={`w-full justify-start ${isActive(link.path) ? "bg-muted font-semibold" : "text-muted-foreground"}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
