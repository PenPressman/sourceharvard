import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, BookOpen, LayoutDashboard } from "lucide-react";

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  founder: { label: "Founder", color: "bg-primary text-primary-foreground" },
  investor: { label: "Investor", color: "bg-amber-100 text-amber-800" },
  student: { label: "Student", color: "bg-sky-100 text-sky-800" },
  applicant: { label: "Applicant", color: "bg-muted text-muted-foreground" },
  admin: { label: "Admin", color: "bg-destructive text-destructive-foreground" },
};

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-display font-bold text-sm">H</span>
          </div>
          <span className="font-display font-semibold text-foreground text-lg tracking-tight hidden sm:inline">
            HarvardFounders
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Browse</span>
            </Button>
          </Link>

          {user ? (
            <>
              {role && (
                <span className={`hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${ROLE_BADGE[role]?.color ?? ROLE_BADGE.applicant.color}`}>
                  {ROLE_BADGE[role]?.label}
                </span>
              )}
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              {role === "founder" && (
                <Link to="/submit">
                  <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Startup</span>
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground gap-1.5">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Join</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
