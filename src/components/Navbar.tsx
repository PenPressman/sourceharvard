import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, BookOpen, LayoutDashboard, Bookmark, ShieldAlert } from "lucide-react";

const ROLE_BADGE: Record<string, {label: string;cls: string;}> = {
  founder: { label: "Founder", cls: "bg-primary/15 text-primary border border-primary/25" },
  investor: { label: "Investor", cls: "bg-blue-accent-muted text-accent border border-accent/20" },
  student: { label: "Student", cls: "bg-secondary text-muted-foreground border border-border" },
  applicant: { label: "Applicant", cls: "bg-secondary text-muted-foreground border border-border" },
  admin: { label: "Admin", cls: "bg-destructive/15 text-destructive border border-destructive/25" }
};

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-display font-bold text-sm">S</span>
          </div>
          <span className="font-display font-semibold text-foreground text-[15px] tracking-tight hidden sm:inline">
            ​SOURCE  
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5 text-xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Browse</span>
            </Button>
          </Link>

          {user ?
          <>
              {role &&
            <span className={`hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${ROLE_BADGE[role]?.cls ?? ROLE_BADGE.applicant.cls}`}>
                  {ROLE_BADGE[role]?.label}
                </span>
            }
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5 text-xs">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              {role === "investor" &&
            <Link to="/favorites">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5 text-xs">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Saved</span>
                  </Button>
                </Link>
            }
              {role === "founder" &&
            <Link to="/submit">
                  <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-crimson-light text-xs ml-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add Startup</span>
                  </Button>
                </Link>
            }
              <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground text-xs">
              
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </> :

          <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-crimson-light text-xs ml-1">
                  Join
                </Button>
              </Link>
            </>
          }
        </nav>
      </div>
    </header>);

}