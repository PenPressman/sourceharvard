import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Building2, Briefcase, Clock, Plus, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-[#0A0A09]">
      <Navbar />

      {/* Top glow */}
      <div className="absolute top-16 left-0 right-0 h-64 bg-gradient-to-b from-crimson/5 to-transparent pointer-events-none" />
      <div className="fixed inset-0 grid-overlay pointer-events-none opacity-30" />

      <div className="relative container mx-auto py-16 px-6 max-w-4xl">

        {/* Page header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse-crimson" />
            <p className="font-mono text-[12px] text-crimson uppercase tracking-[0.12em]">Your Account</p>
          </div>
          <h1 className="font-display font-bold text-[39px] text-white leading-[1.1] capitalize">
            {role} Dashboard
          </h1>
          <p className="font-body text-[16px] text-[#C8C9C0] mt-2">{user?.email}</p>
        </div>

        <div className="h-px bg-[#2A2A28] mb-12" />

        {/* Investor pending */}
        {role === "investor" && investorStatus === "pending" && (
          <div className="bg-[#141413] border border-[#2A2A28] rounded-sm p-6 flex items-start gap-4 mb-8 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500/60" />
            <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-bold text-[20px] text-white">Your account is under review</p>
              <p className="font-body text-[14px] text-[#C8C9C0] mt-1 leading-relaxed">
                We're reviewing your investor profile. You'll receive an email once approved.
              </p>
            </div>
          </div>
        )}

        {/* Founder: my startups */}
        {role === "founder" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-[25px] text-white">My Startups</h2>
              <Link to="/submit">
                <button className="inline-flex items-center gap-2 h-9 px-4 bg-crimson text-white font-body font-medium text-[13px] rounded-sm hover:bg-crimson-dim transition-colors duration-150">
                  <Plus className="w-3.5 h-3.5" />Add Startup
                </button>
              </Link>
            </div>
            {dataLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-20 bg-[#141413] border border-[#2A2A28] rounded-sm animate-pulse" />)}
              </div>
            ) : myStartups.length === 0 ? (
              <div className="border border-[#2A2A28] rounded-sm p-12 text-center bg-[#141413] relative overflow-hidden">
                <div className="absolute inset-0 grid-overlay opacity-50" />
                <Building2 className="w-8 h-8 text-[#8A8B80] mx-auto mb-4 relative" />
                <p className="font-display font-bold text-[20px] text-white mb-2 relative">No startups yet</p>
                <p className="font-body text-[14px] text-[#C8C9C0] mb-6 relative">Create your first startup profile to appear in the directory.</p>
                <Link to="/submit" className="relative">
                  <button className="h-11 px-6 bg-crimson text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson-dim transition-colors duration-150">
                    Create Startup Profile
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myStartups.map(s => (
                  <Link key={s.id} to={`/startup/${s.id}`} className="block group">
                    <div className="bg-[#141413] border border-[#2A2A28] rounded-sm p-5 hover:border-crimson/40 transition-colors duration-150 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-sm bg-crimson/10 border border-crimson/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-display font-bold text-crimson text-base">{s.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-display font-bold text-[17px] text-white">{s.name}</p>
                          <p className="font-mono text-[11px] text-[#C8C9C0] uppercase tracking-[0.06em]">{s.industry} · {s.stage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {s.is_hiring && <span className="font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 bg-crimson text-white rounded-sm">Hiring</span>}
                        {s.open_to_vc && <span className="font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 bg-[#1C1C1A] text-[#C8C9C0] border border-[#2A2A28] rounded-sm">VC Ready</span>}
                        <ArrowRight className="w-4 h-4 text-[#8A8B80] group-hover:text-crimson transition-colors" />
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
              <div className="bg-[#141413] border border-[#2A2A28] rounded-sm p-6 hover:border-crimson/40 transition-colors duration-150 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-8 h-px bg-crimson opacity-0 group-hover:opacity-100 transition-opacity" />
                <Building2 className="w-6 h-6 text-crimson mb-4" />
                <p className="font-display font-bold text-[20px] text-white">Browse Startups</p>
                <p className="font-body text-[14px] text-[#C8C9C0] mt-2">Explore Harvard ventures and find opportunities.</p>
              </div>
            </Link>
            <Link to="/" className="block group">
              <div className="bg-[#141413] border border-[#2A2A28] rounded-sm p-6 hover:border-crimson/40 transition-colors duration-150 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-8 h-px bg-crimson opacity-0 group-hover:opacity-100 transition-opacity" />
                <Briefcase className="w-6 h-6 text-crimson mb-4" />
                <p className="font-display font-bold text-[20px] text-white">Open Roles</p>
                <p className="font-body text-[14px] text-[#C8C9C0] mt-2">Find roles that match your skills and interests.</p>
              </div>
            </Link>
          </div>
        )}

        {/* Investor approved */}
        {role === "investor" && investorStatus === "approved" && !dataLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link to="/" className="block group">
              <div className="bg-[#141413] border border-[#2A2A28] rounded-sm p-6 hover:border-crimson/40 transition-colors duration-150 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-8 h-px bg-crimson opacity-0 group-hover:opacity-100 transition-opacity" />
                <Building2 className="w-6 h-6 text-crimson mb-4" />
                <p className="font-display font-bold text-[20px] text-white">Browse Startups</p>
                <p className="font-body text-[14px] text-[#C8C9C0] mt-2">Discover Harvard ventures actively seeking investment.</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
