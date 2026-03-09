import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import StartupCard from "@/components/StartupCard";
import { Bookmark, Building2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Startup = Database["public"]["Tables"]["startups"]["Row"];

interface EndorsementScore {
  total: number;
  investorCount: number;
}

export default function FavoritesPage() {
  const { user, role, loading, roleLoading } = useAuth();
  const navigate = useNavigate();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [scores, setScores] = useState<Record<string, EndorsementScore>>({});
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !roleLoading) {
      if (!user) navigate("/login");
      else if (role && role !== "investor" && role !== "admin") navigate("/");
    }
  }, [user, loading, role, roleLoading, navigate]);

  useEffect(() => {
    if (!user || !role) return;
    const load = async () => {
      setDataLoading(true);
      const { data: saved } = await supabase
        .from("saved_startups" as any)
        .select("startup_id")
        .eq("user_id", user.id);

      if (!saved || saved.length === 0) {
        setStartups([]);
        setDataLoading(false);
        return;
      }

      const ids = saved.map((s: any) => s.startup_id);
      const { data: startupData } = await supabase.from("startups").select("*").in("id", ids);
      setStartups(startupData ?? []);

      const { data: endorsements } = await supabase.rpc("get_all_startup_endorsements");
      if (endorsements) {
        const map: Record<string, EndorsementScore> = {};
        for (const e of endorsements) {
          map[e.startup_id] = { total: e.total, investorCount: e.investor_count };
        }
        setScores(map);
      }
      setDataLoading(false);
    };
    load();
  }, [user, role]);

  if (loading || roleLoading) return null;

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      <div className="container mx-auto py-16 px-6 max-w-6xl">

        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-[12px] text-crimson uppercase tracking-[0.1em] mb-3">Investor View</p>
          <h1 className="font-display font-bold text-[39px] text-ink leading-[1.1]">
            Saved Startups
          </h1>
          <p className="font-body text-[16px] text-slate mt-2">Companies you've bookmarked for later</p>
        </div>

        <hr className="border-[#D6D0C4] mb-12" />

        {dataLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-52 bg-white border border-[#D6D0C4] rounded-sm animate-pulse" />
            ))}
          </div>
        ) : startups.length === 0 ? (
          <div className="border border-[#D6D0C4] rounded-sm p-16 text-center bg-white">
            <Building2 className="w-8 h-8 text-slate mx-auto mb-4" />
            <p className="font-display font-bold text-[25px] text-ink mb-2">No saved startups yet</p>
            <p className="font-body text-[14px] text-slate mb-8 max-w-sm mx-auto">
              Browse the directory and bookmark companies that interest you.
            </p>
            <Link to="/">
              <button className="h-11 px-6 bg-ink text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson transition-colors duration-150">
                Browse Startups
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map(s => (
              <StartupCard key={s.id} startup={s} score={scores[s.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
