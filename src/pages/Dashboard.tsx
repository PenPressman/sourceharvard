import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Building2, GraduationCap, Briefcase, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Startup = Database["public"]["Tables"]["startups"]["Row"];

export default function Dashboard() {
  const { user, role, loading, roleLoading } = useAuth();
  const navigate = useNavigate();
  const [myStartups, setMyStartups] = useState<Startup[]>([]);
  const [investorStatus, setInvestorStatus] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !roleLoading && !user) navigate("/login");
  }, [user, loading, roleLoading, navigate]);

  useEffect(() => {
    if (!user || !role) return;
    const load = async () => {
      setDataLoading(true);
      if (role === "founder") {
        const { data } = await supabase.from("startups").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
        setMyStartups(data ?? []);
      }
      if (role === "investor") {
        const { data } = await supabase.from("investor_profiles").select("status").eq("user_id", user.id).maybeSingle();
        setInvestorStatus(data?.status ?? null);
      }
      setDataLoading(false);
    };
    load();
  }, [user, role]);

  if (loading || roleLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        {/* Role banner */}
        <div className={`rounded-xl border p-5 mb-7 flex items-start gap-4 ${
          role === "founder" ? "bg-crimson-muted border-primary/20" :
          role === "investor" ? "bg-amber-50 border-amber-200" :
          role === "student" ? "bg-sky-50 border-sky-200" :
          "bg-muted border-border"
        }`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            role === "founder" ? "bg-primary text-primary-foreground" :
            role === "investor" ? "bg-amber-400 text-amber-50" :
            role === "student" ? "bg-sky-500 text-sky-50" :
            "bg-muted text-muted-foreground"
          }`}>
            {role === "founder" && <Building2 className="w-5 h-5" />}
            {role === "investor" && <Briefcase className="w-5 h-5" />}
            {role === "student" && <GraduationCap className="w-5 h-5" />}
            {role === "applicant" && <Search className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-display font-semibold text-foreground capitalize">{role} Dashboard</p>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Investor pending state */}
        {role === "investor" && investorStatus === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4">
            <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Your account is under review</p>
              <p className="text-sm text-amber-700 mt-1">
                We're reviewing your investor profile. You'll receive an email once approved, giving you full access to browse startups and signal interest.
              </p>
            </div>
          </div>
        )}

        {/* Founder: my startups */}
        {role === "founder" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-xl text-foreground">My Startups</h2>
              <Link to="/submit">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
                  + Add Startup
                </Button>
              </Link>
            </div>
            {dataLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map(i => <div key={i} className="h-20 bg-muted rounded-lg" />)}
              </div>
            ) : myStartups.length === 0 ? (
              <div className="border border-border rounded-xl p-8 text-center">
                <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">No startups yet</p>
                <p className="text-sm text-muted-foreground mb-4">Create your first startup profile to appear in the directory.</p>
                <Link to="/submit">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Create Startup Profile</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myStartups.map(s => (
                  <Link key={s.id} to={`/startup/${s.id}`} className="block">
                    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-display font-bold text-primary">{s.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.industry} · {s.stage}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {s.is_hiring && <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">Hiring</span>}
                        {s.open_to_vc && <span className="text-xs px-2 py-0.5 rounded-full bg-crimson-muted text-accent-foreground border border-primary/20">VC Ready</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student / Applicant: links to browse */}
        {(role === "student" || role === "applicant") && !dataLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/" className="block">
              <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                <Building2 className="w-6 h-6 text-primary mb-3" />
                <p className="font-semibold text-foreground">Browse Startups</p>
                <p className="text-sm text-muted-foreground mt-1">Explore Harvard ventures and find opportunities.</p>
              </div>
            </Link>
            <Link to="/" className="block">
              <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                <Briefcase className="w-6 h-6 text-primary mb-3" />
                <p className="font-semibold text-foreground">Open Roles</p>
                <p className="text-sm text-muted-foreground mt-1">Find roles that match your skills and interests.</p>
              </div>
            </Link>
          </div>
        )}

        {/* Investor approved: browse startups */}
        {role === "investor" && investorStatus === "approved" && !dataLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/" className="block">
              <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                <Building2 className="w-6 h-6 text-primary mb-3" />
                <p className="font-semibold text-foreground">Browse Startups</p>
                <p className="text-sm text-muted-foreground mt-1">Discover Harvard ventures actively seeking investment.</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
