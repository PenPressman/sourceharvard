import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Plus, LayoutDashboard, Bookmark, ShieldAlert } from "lucide-react";

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  founder:  { label: "Founder",  cls: "bg-primary/10 text-primary border border-primary/30" },
  investor: { label: "Investor", cls: "bg-[#EDE9DE] text-[#4A4E5A] border border-[#D6D0C4]" },
  student:  { label: "Student",  cls: "bg-[#EDE9DE] text-[#4A4E5A] border border-[#D6D0C4]" },
  applicant:{ label: "Applicant",cls: "bg-[#EDE9DE] text-[#4A4E5A] border border-[#D6D0C4]" },
  admin:    { label: "Admin",    cls: "bg-destructive/10 text-destructive border border-destructive/25" },
};

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-parchment border-b border-rule h-16 flex items-center">
      <div className="container mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-7 h-7 rounded-sm bg-crimson flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm leading-none">S</span>
          </div>
          <span className="hidden sm:flex items-baseline gap-1">
            <span className="font-display font-bold text-[#1A1A18] text-[17px] tracking-tight leading-none">Source</span>
            <span className="font-body font-light text-[#4A4E5A] text-[13px] tracking-wide">Harvard</span>
          </span>
        </Link>

        {/* Center nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-3 py-1.5 text-[14px] font-body font-medium text-[#4A4E5A] hover:text-[#1A1A18] transition-colors duration-150">
            Browse
          </Link>
          {user && (
            <Link to="/dashboard" className="px-3 py-1.5 text-[14px] font-body font-medium text-[#4A4E5A] hover:text-[#1A1A18] transition-colors duration-150">
              Dashboard
            </Link>
          )}
          {role === "investor" && (
            <Link to="/favorites" className="px-3 py-1.5 text-[14px] font-body font-medium text-[#4A4E5A] hover:text-[#1A1A18] transition-colors duration-150">
              Saved
            </Link>
          )}
          {role === "admin" && (
            <Link to="/admin" className="px-3 py-1.5 text-[14px] font-body font-medium text-destructive hover:text-destructive/80 transition-colors duration-150">
              Admin
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {role && (
                <span className={`hidden sm:inline-block text-[11px] font-mono px-2.5 py-0.5 rounded-sm uppercase tracking-wider ${ROLE_BADGE[role]?.cls ?? ROLE_BADGE.applicant.cls}`}>
                  {ROLE_BADGE[role]?.label}
                </span>
              )}
              {/* Mobile: dashboard icon */}
              <Link to="/dashboard" className="md:hidden p-2 text-[#4A4E5A] hover:text-[#1A1A18] transition-colors">
                <LayoutDashboard className="w-4 h-4" />
              </Link>
              {role === "investor" && (
                <Link to="/favorites" className="md:hidden p-2 text-[#4A4E5A] hover:text-[#1A1A18] transition-colors">
                  <Bookmark className="w-4 h-4" />
                </Link>
              )}
              {role === "admin" && (
                <Link to="/admin" className="md:hidden p-2 text-destructive hover:text-destructive/80 transition-colors">
                  <ShieldAlert className="w-4 h-4" />
                </Link>
              )}
              {role === "founder" && (
                <Link to="/submit">
                  <button className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#1A1A18] text-white text-[13px] font-body font-medium rounded-sm hover:bg-crimson transition-colors duration-150">
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add Startup</span>
                  </button>
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="p-2 text-[#4A4E5A] hover:text-[#1A1A18] transition-colors duration-150"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 text-[14px] font-body font-medium text-[#4A4E5A] hover:text-[#1A1A18] transition-colors duration-150">
                Sign in
              </Link>
              <Link to="/signup">
                <button className="h-9 px-5 bg-[#1A1A18] text-white text-[13px] font-body font-medium rounded-sm hover:bg-crimson transition-colors duration-150">
                  Join
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
