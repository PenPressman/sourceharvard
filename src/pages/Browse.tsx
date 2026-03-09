import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Plus, X, ChevronDown, Flame, ThumbsUp, Building2, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import StartupCard from "@/components/StartupCard";
import type { Database } from "@/integrations/supabase/types";

type Startup = Database["public"]["Tables"]["startups"]["Row"];
type IndustryType = Database["public"]["Enums"]["industry_type"];
type StageType = Database["public"]["Enums"]["stage_type"];

interface EndorsementScore { total: number; investorCount: number; }

const INDUSTRIES: IndustryType[] = ["Fintech", "Biotech", "AI/ML", "Consumer", "B2B SaaS", "Hardware", "Social Impact", "Deep Tech" as IndustryType, "Other"];
const STAGES: StageType[] = ["Idea", "Pre-seed", "Seed", "Series A+"];

const SORT_OPTIONS = [
  { value: "recent",            label: "Most Recent",       icon: Clock },
  { value: "most_endorsed",     label: "Most Endorsed",     icon: ThumbsUp },
  { value: "investor_endorsed", label: "Investor Endorsed", icon: Building2 },
  { value: "trending",          label: "Trending",          icon: Flame },
] as const;

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
        supabase.rpc("get_trending_startup_ids"),
      ]);
      setStartups(startupData ?? []);
      const scoreMap = new Map<string, EndorsementScore>();
      (scoreData ?? []).forEach((r: any) => {
        scoreMap.set(r.startup_id, { total: Number(r.total), investorCount: Number(r.investor_count) });
      });
      setScores(scoreMap);
      const trendMap = new Map<string, number>();
      (trendData ?? []).forEach((r: any) => trendMap.set(r.startup_id, Number(r.recent_count)));
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
    return arr;
  }, [filtered, sortBy, scores, trending]);

  const hasFilters = filterIndustry || filterStage || filterHiring || filterVC;
  const clearFilters = () => { setFilterIndustry(""); setFilterStage(""); setFilterHiring(false); setFilterVC(false); setSearch(""); };

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />

      {/* Hero — left-aligned, editorial */}
      <section className="border-b border-rule bg-parchment">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <p className="font-mono text-[12px] text-crimson uppercase tracking-[0.1em] mb-5">
              Harvard Startup Community
            </p>
            {/* Headline */}
            <h1 className="font-display font-bold text-[49px] text-ink leading-[1.1] mb-5 max-w-[560px]">
              Discover Harvard<br />
              <span className="text-crimson">Student Startups</span>
            </h1>
            {/* Subhead */}
            <p className="font-body text-[18px] text-slate leading-relaxed max-w-[480px] mb-8">
              Browse ventures built by Harvard founders. Find co-founders, explore careers, or signal interest as an investor.
            </p>
            {/* CTAs */}
            <div className="flex items-center gap-4">
              {!user ? (
                <>
                  <Link to="/signup">
                    <button className="h-11 px-6 bg-ink text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson transition-colors duration-150">
                      Join Source
                    </button>
                  </Link>
                  <Link to="/login" className="font-body text-[14px] text-crimson underline underline-offset-2 hover:text-crimson-dim transition-colors duration-150">
                    Sign in
                  </Link>
                </>
              ) : (
                <Link to="/submit">
                  <button className="inline-flex items-center gap-2 h-11 px-6 bg-ink text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson transition-colors duration-150">
                    <Plus className="w-4 h-4" />
                    Add Your Startup
                  </button>
                </Link>
              )}
            </div>
            {/* Trust signal */}
            <p className="font-body text-[13px] text-slate mt-6">
              Built for the Harvard founder ecosystem
            </p>
          </div>
        </div>
      </section>

      {/* Directory */}
      <div className="container mx-auto px-6 py-12 max-w-7xl">

        {/* Search bar */}
        <div className="mb-8">
          <div className="flex max-w-[680px]">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search startups…"
                className="w-full h-[52px] pl-11 pr-4 font-body text-[16px] text-ink placeholder:text-slate bg-white border-[1.5px] border-ink rounded-l-sm rounded-r-none outline-none focus:border-crimson focus:shadow-glow transition-all duration-150"
              />
            </div>
            {/* Sort select flush to right */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="appearance-none h-[52px] pl-4 pr-10 font-body text-[14px] font-medium text-ink bg-ink text-white border-[1.5px] border-ink rounded-l-none rounded-r-sm cursor-pointer outline-none hover:bg-crimson transition-colors duration-150"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 items-center mt-4">
            {/* Industry */}
            <div className="relative">
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value as IndustryType | "")}
                className={`appearance-none h-8 pl-3 pr-8 font-body text-[13px] rounded-sm border cursor-pointer outline-none transition-colors duration-150 ${
                  filterIndustry
                    ? "bg-ink text-white border-ink"
                    : "bg-[#EDE9DE] text-ink border-[#D6D0C4] hover:border-ink"
                }`}
              >
                <option value="">Industry</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${filterIndustry ? "text-white" : "text-slate"}`} />
            </div>

            {/* Stage */}
            <div className="relative">
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value as StageType | "")}
                className={`appearance-none h-8 pl-3 pr-8 font-body text-[13px] rounded-sm border cursor-pointer outline-none transition-colors duration-150 ${
                  filterStage
                    ? "bg-ink text-white border-ink"
                    : "bg-[#EDE9DE] text-ink border-[#D6D0C4] hover:border-ink"
                }`}
              >
                <option value="">Stage</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${filterStage ? "text-white" : "text-slate"}`} />
            </div>

            {[
              { active: filterHiring, label: "Hiring", onClick: () => setFilterHiring(!filterHiring) },
              { active: filterVC,     label: "Open to VCs", onClick: () => setFilterVC(!filterVC) },
            ].map(({ active, label, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className={`h-8 px-3 font-body text-[13px] rounded-sm border transition-colors duration-150 ${
                  active
                    ? "bg-ink text-white border-ink"
                    : "bg-[#EDE9DE] text-ink border-[#D6D0C4] hover:border-ink"
                }`}
              >
                {label}
              </button>
            ))}

            {(hasFilters || search) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 font-body text-[13px] text-slate border border-[#D6D0C4] rounded-sm hover:border-ink hover:text-ink flex items-center gap-1 transition-colors duration-150"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Count line */}
        <p className="font-mono text-[12px] text-slate mb-6 uppercase tracking-[0.06em]">
          {loading ? "Loading…" : `${sorted.length} startup${sorted.length !== 1 ? "s" : ""}`}
          {sortBy !== "recent" && (
            <span className="ml-3 text-crimson">
              · sorted by {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
            </span>
          )}
        </p>

        {/* Divider */}
        <hr className="border-[#D6D0C4] mb-8" />

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#D6D0C4] rounded-sm p-6 animate-pulse h-52">
                <div className="h-4 bg-[#EDE9DE] rounded-sm w-1/3 mb-4" />
                <div className="h-6 bg-[#EDE9DE] rounded-sm w-3/4 mb-3" />
                <div className="h-3 bg-[#EDE9DE] rounded-sm w-full mb-2" />
                <div className="h-3 bg-[#EDE9DE] rounded-sm w-5/6" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-[25px] text-ink mb-3">No startups found</p>
            <p className="font-body text-[14px] text-slate">
              {hasFilters || search ? "Try adjusting your filters." : "Be the first to add a startup!"}
            </p>
            {!hasFilters && !search && user && (
              <Link to="/submit" className="mt-6 inline-block">
                <button className="inline-flex items-center gap-2 h-11 px-6 bg-ink text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson transition-colors duration-150">
                  <Plus className="w-4 h-4" /> Add Your Startup
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((s) => (
              <StartupCard
                key={s.id}
                startup={s}
                score={scores.get(s.id) ?? { total: 0, investorCount: 0 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
