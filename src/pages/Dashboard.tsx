import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Building2, GraduationCap, Briefcase, Search, Clock, Plus, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-parchment">
      <Navbar />
      <div className="container mx-auto py-16 px-6 max-w-4xl">

        {/* Page header */}
        <div className="mb-12">
          <p className="font-mono text-[12px] text-crimson uppercase tracking-[0.1em] mb-3">Your Account</p>
          <h1 className="font-display font-bold text-[39px] text-ink leading-[1.1] capitalize">
            {role} Dashboard
          </h1>
          <p className="font-body text-[16px] text-slate mt-2">{user?.email}</p>
        </div>

        <hr className="border-[#D6D0C4] mb-12" />

        {/* Investor pending state */}
        {role === "investor" && investorStatus === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-sm p-6 flex items-start gap-4 mb-8">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-bold text-[20px] text-amber-900">Your account is under review</p>
              <p className="font-body text-[14px] text-amber-700 mt-1 leading-relaxed">
                We're reviewing your investor profile. You'll receive an email once approved, giving you full access to browse startups and signal interest.
              </p>
            </div>
          </div>
        )}

        {/* Founder: my startups */}
        {role === "founder" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-[25px] text-ink">My Startups</h2>
              <Link to="/submit">
                <button className="inline-flex items-center gap-2 h-9 px-4 bg-ink text-white font-body font-medium text-[13px] rounded-sm hover:bg-crimson transition-colors duration-150">
                  <Plus className="w-3.5 h-3.5" />Add Startup
                </button>
              </Link>
            </div>
            {dataLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-20 bg-white border border-[#D6D0C4] rounded-sm animate-pulse" />)}
              </div>
            ) : myStartups.length === 0 ? (
              <div className="border border-[#D6D0C4] rounded-sm p-12 text-center bg-white">
                <Building2 className="w-8 h-8 text-slate mx-auto mb-4" />
                <p className="font-display font-bold text-[20px] text-ink mb-2">No startups yet</p>
                <p className="font-body text-[14px] text-slate mb-6">Create your first startup profile to appear in the directory.</p>
                <Link to="/submit">
                  <button className="h-11 px-6 bg-ink text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson transition-colors duration-150">
                    Create Startup Profile
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myStartups.map(s => (
                  <Link key={s.id} to={`/startup/${s.id}`} className="block group">
                    <div className="bg-white border border-[#D6D0C4] rounded-sm p-5 hover:border-ink transition-colors duration-150 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-sm bg-crimson/10 border border-crimson/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-display font-bold text-crimson text-base">{s.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-display font-bold text-[17px] text-ink">{s.name}</p>
                          <p className="font-mono text-[11px] text-slate uppercase tracking-[0.06em]">{s.industry} · {s.stage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {s.is_hiring && <span className="font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 bg-crimson text-white rounded-sm">Hiring</span>}
                        {s.open_to_vc && <span className="font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 bg-[#EDE9DE] text-slate border border-[#D6D0C4] rounded-sm">VC Ready</span>}
                        <ArrowRight className="w-4 h-4 text-slate group-hover:text-ink transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student / Applicant */}
        {(role === "student" || role === "applicant") && !dataLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link to="/" className="block group">
              <div className="bg-white border border-[#D6D0C4] rounded-sm p-6 hover:border-ink transition-colors duration-150">
                <Building2 className="w-6 h-6 text-crimson mb-4" />
                <p className="font-display font-bold text-[20px] text-ink">Browse Startups</p>
                <p className="font-body text-[14px] text-slate mt-2">Explore Harvard ventures and find opportunities.</p>
              </div>
            </Link>
            <Link to="/" className="block group">
              <div className="bg-white border border-[#D6D0C4] rounded-sm p-6 hover:border-ink transition-colors duration-150">
                <Briefcase className="w-6 h-6 text-crimson mb-4" />
                <p className="font-display font-bold text-[20px] text-ink">Open Roles</p>
                <p className="font-body text-[14px] text-slate mt-2">Find roles that match your skills and interests.</p>
              </div>
            </Link>
          </div>
        )}

        {/* Investor approved */}
        {role === "investor" && investorStatus === "approved" && !dataLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link to="/" className="block group">
              <div className="bg-white border border-[#D6D0C4] rounded-sm p-6 hover:border-ink transition-colors duration-150">
                <Building2 className="w-6 h-6 text-crimson mb-4" />
                <p className="font-display font-bold text-[20px] text-ink">Browse Startups</p>
                <p className="font-body text-[14px] text-slate mt-2">Discover Harvard ventures actively seeking investment.</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
