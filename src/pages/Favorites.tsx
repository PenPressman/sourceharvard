import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import StartupCard from "@/components/StartupCard";
import { Bookmark, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      const { data: startupData } = await supabase
        .from("startups")
        .select("*")
        .in("id", ids);

      setStartups(startupData ?? []);

      // Fetch endorsement scores
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Bookmark className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">Saved Startups</h1>
            <p className="text-sm text-muted-foreground">Companies you've bookmarked for later</p>
          </div>
        </div>

        {dataLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-44 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : startups.length === 0 ? (
          <div className="border border-border rounded-xl p-12 text-center">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-semibold text-foreground mb-1">No saved startups yet</p>
            <p className="text-sm text-muted-foreground mb-5">
              Browse the directory and bookmark companies that interest you.
            </p>
            <Link to="/">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Browse Startups</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {startups.map(s => (
              <StartupCard key={s.id} startup={s} score={scores[s.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
