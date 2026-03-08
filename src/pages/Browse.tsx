import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X, ChevronDown, Flame, ThumbsUp, Building2, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import StartupCard from "@/components/StartupCard";
import type { Database } from "@/integrations/supabase/types";

type Startup = Database["public"]["Tables"]["startups"]["Row"];
type IndustryType = Database["public"]["Enums"]["industry_type"];
type StageType = Database["public"]["Enums"]["stage_type"];

interface EndorsementScore {total: number;investorCount: number;}

const INDUSTRIES: IndustryType[] = ["Fintech", "Biotech", "AI/ML", "Consumer", "B2B SaaS", "Hardware", "Social Impact", "Deep Tech" as IndustryType, "Other"];
const STAGES: StageType[] = ["Idea", "Pre-seed", "Seed", "Series A+"];

const SORT_OPTIONS = [
{ value: "recent", label: "Most Recent", icon: Clock },
{ value: "most_endorsed", label: "Most Endorsed", icon: ThumbsUp },
{ value: "investor_endorsed", label: "Investor Endorsed", icon: Building2 },
{ value: "trending", label: "Trending", icon: Flame }] as
const;

type SortKey = typeof SORT_OPTIONS[number]["value"];

export default function BrowsePage() {
  const { user } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [scores, setScores] = useState<Map<string, EndorsementScore>>(new Map());
  const [trending, setTrending] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterIndustry, setFilterIndustry] = useState<IndustryType | "">("");
  const [filterStage, setFilterStage] = useState<StageType | "">("");
  const [filterHiring, setFilterHiring] = useState(false);
  const [filterVC, setFilterVC] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("recent");

  useEffect(() => {
    const load = async () => {
      const [{ data: startupData }, { data: scoreData }, { data: trendData }] = await Promise.all([
      supabase.from("startups").select("*").order("created_at", { ascending: false }),
      supabase.rpc("get_all_startup_endorsements"),
      supabase.rpc("get_trending_startup_ids")]
      );

      setStartups(startupData ?? []);

      const scoreMap = new Map<string, EndorsementScore>();
      (scoreData ?? []).forEach((r: any) => {
        scoreMap.set(r.startup_id, { total: Number(r.total), investorCount: Number(r.investor_count) });
      });
      setScores(scoreMap);

      const trendMap = new Map<string, number>();
      (trendData ?? []).forEach((r: any) => {
        trendMap.set(r.startup_id, Number(r.recent_count));
      });
      setTrending(trendMap);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return startups.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterIndustry && s.industry !== filterIndustry) return false;
      if (filterStage && s.stage !== filterStage) return false;
      if (filterHiring && !s.is_hiring) return false;
      if (filterVC && !s.open_to_vc) return false;
      return true;
    });
  }, [startups, search, filterIndustry, filterStage, filterHiring, filterVC]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === "most_endorsed") return arr.sort((a, b) => (scores.get(b.id)?.total ?? 0) - (scores.get(a.id)?.total ?? 0));
    if (sortBy === "investor_endorsed") return arr.sort((a, b) => (scores.get(b.id)?.investorCount ?? 0) - (scores.get(a.id)?.investorCount ?? 0));
    if (sortBy === "trending") return arr.sort((a, b) => (trending.get(b.id) ?? 0) - (trending.get(a.id) ?? 0));
    return arr; // recent — already sorted by created_at desc
  }, [filtered, sortBy, scores, trending]);

  const hasFilters = filterIndustry || filterStage || filterHiring || filterVC;
  const clearFilters = () => {setFilterIndustry("");setFilterStage("");setFilterHiring(false);setFilterVC(false);setSearch("");};

  const ActiveSortIcon = SORT_OPTIONS.find((o) => o.value === sortBy)?.icon ?? Clock;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-14 text-center max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-crimson-muted text-primary text-xs font-medium px-3 py-1 rounded-full border border-primary/20 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Harvard Startup Community
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-4 leading-tight tracking-tight">Discover Harvard
Student Startups<br />
            <span className="text-primary">Student Startups</span>
          </h1>
          <p className="text-muted-foreground text-base mb-8 leading-relaxed max-w-lg mx-auto">
            Browse ventures built by Harvard founders. Find co-founders, explore careers, or signal interest as an investor.
          </p>
          {!user ?
          <div className="flex gap-3 justify-center">
              <Link to="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-crimson-light h-10 px-5 font-semibold">
                  Join as Founder
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="h-10 px-5 border-border text-muted-foreground hover:text-foreground">
                  Sign in
                </Button>
              </Link>
            </div> :

          <Link to="/submit">
              <Button className="bg-primary text-primary-foreground hover:bg-crimson-light h-10 px-5 gap-2 font-semibold">
                <Plus className="w-4 h-4" />
                Add Your Startup
              </Button>
            </Link>
          }
        </div>
      </section>

      {/* Directory */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Controls bar */}
        <div className="space-y-3 mb-7">
          <div className="flex gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search startups…"
                className="pl-9 h-9 bg-card border-border" />
              
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="appearance-none h-9 pl-8 pr-8 text-sm rounded-md border border-border bg-card text-foreground cursor-pointer outline-none focus:border-primary/60 transition-colors">
                
                {SORT_OPTIONS.map((o) =>
                <option key={o.value} value={o.value}>{o.label}</option>
                )}
              </select>
              <ActiveSortIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Industry */}
            <div className="relative">
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value as IndustryType | "")}
                className={`appearance-none h-7 pl-3 pr-7 text-xs rounded-full border cursor-pointer outline-none transition-colors ${
                filterIndustry ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-foreground/30"}`
                }>
                
                <option value="">Industry</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${filterIndustry ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>

            {/* Stage */}
            <div className="relative">
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value as StageType | "")}
                className={`appearance-none h-7 pl-3 pr-7 text-xs rounded-full border cursor-pointer outline-none transition-colors ${
                filterStage ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-foreground/30"}`
                }>
                
                <option value="">Stage</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${filterStage ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>

            {[
            { active: filterHiring, label: "Hiring", onClick: () => setFilterHiring(!filterHiring) },
            { active: filterVC, label: "Open to VCs", onClick: () => setFilterVC(!filterVC) }].
            map(({ active, label, onClick }) =>
            <button
              key={label}
              onClick={onClick}
              className={`h-7 px-3 text-xs rounded-full border transition-colors ${
              active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-foreground/30"}`
              }>
              
                {label}
              </button>
            )}

            {(hasFilters || search) &&
            <button onClick={clearFilters} className="h-7 px-2.5 text-xs rounded-full border border-border text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" /> Clear
              </button>
            }
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-muted-foreground mb-5">
          {loading ? "Loading…" : `${sorted.length} startup${sorted.length !== 1 ? "s" : ""}`}
          {sortBy !== "recent" &&
          <span className="ml-2 text-primary">· sorted by {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
          }
        </p>

        {/* Grid */}
        {loading ?
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) =>
          <div key={i} className="bg-card border border-border rounded-lg p-5 animate-pulse h-44">
                <div className="w-10 h-10 bg-muted rounded-lg mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full mb-1.5" />
                <div className="h-3 bg-muted rounded w-5/6" />
              </div>
          )}
          </div> :
        sorted.length === 0 ?
        <div className="text-center py-16">
            <p className="text-muted-foreground text-base mb-1">No startups found</p>
            <p className="text-sm text-muted-foreground">{hasFilters || search ? "Try adjusting your filters." : "Be the first to add a startup!"}</p>
            {!hasFilters && !search && user &&
          <Link to="/submit" className="mt-4 inline-block">
                <Button className="bg-primary text-primary-foreground hover:bg-crimson-light gap-2 mt-4">
                  <Plus className="w-4 h-4" /> Add Your Startup
                </Button>
              </Link>
          }
          </div> :

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((s) =>
          <StartupCard
            key={s.id}
            startup={s}
            score={scores.get(s.id) ?? { total: 0, investorCount: 0 }} />

          )}
          </div>
        }
      </div>
    </div>);

}