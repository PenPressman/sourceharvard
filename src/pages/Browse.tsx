import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Plus, X, ChevronDown, Flame, ThumbsUp, Building2, Clock, TrendingUp, Briefcase, Users } from "lucide-react";
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

// Animated stat counter component
function StatBlock({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  return (
    <div className="flex flex-col" style={{ animationDelay: `${delay}ms` }}>
      <span className="font-display font-bold text-[31px] text-[#F5F1E8] leading-none">{value}</span>
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#5A5B53] mt-1">{label}</span>
    </div>
  );
}

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

  const hiringCount = startups.filter(s => s.is_hiring).length;
  const vcCount = startups.filter(s => s.open_to_vc).length;

  return (
    <div className="min-h-screen bg-[#0A0A09]">
      <Navbar />

      {/* Hero — dark, mission-control inspired */}
      <section className="relative border-b border-[#2A2A28] overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        {/* Radial glow from bottom-left */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-crimson/5 rounded-full blur-[120px] pointer-events-none" />
        {/* Crimson vertical accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-crimson/40 to-transparent" />

        <div className="container mx-auto px-6 py-24 relative">
          <div className="max-w-3xl">
            {/* System label */}
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse-crimson" />
              <p className="font-mono text-[12px] text-crimson uppercase tracking-[0.12em]">
                Harvard Startup Directory — Active
              </p>
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-[49px] text-[#F5F1E8] leading-[1.05] mb-5 max-w-[640px]">
              Discover Harvard<br />
              <span className="text-crimson italic">Student Startups</span>
            </h1>

            {/* Subhead */}
            <p className="font-body text-[18px] text-[#8A8B80] leading-relaxed max-w-[520px] mb-10">
              Browse ventures built by Harvard founders. Connect, invest, and build the next generation of companies.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-4 mb-12">
              {!user ? (
                <>
                  <Link to="/signup">
                    <button className="h-11 px-7 bg-crimson text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson-dim transition-colors duration-150">
                      Join the Network
                    </button>
                  </Link>
                  <Link to="/login" className="font-body text-[14px] text-[#8A8B80] hover:text-[#F5F1E8] transition-colors duration-150 underline underline-offset-4">
                    Sign in
                  </Link>
                </>
              ) : (
                <Link to="/submit">
                  <button className="inline-flex items-center gap-2 h-11 px-7 bg-crimson text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson-dim transition-colors duration-150">
                    <Plus className="w-4 h-4" />
                    Add Your Startup
                  </button>
                </Link>
              )}
            </div>

            {/* Stats row — data-rich, mission-control */}
            <div className="flex items-center gap-10 pt-8 border-t border-[#2A2A28]">
              <StatBlock value={loading ? "—" : String(startups.length)} label="Startups" />
              <div className="w-px h-10 bg-[#2A2A28]" />
              <StatBlock value={loading ? "—" : String(hiringCount)} label="Hiring" delay={80} />
              <div className="w-px h-10 bg-[#2A2A28]" />
              <StatBlock value={loading ? "—" : String(vcCount)} label="Seeking VC" delay={160} />
              <div className="w-px h-10 bg-[#2A2A28]" />
              <StatBlock value="40+" label="Institutions" delay={240} />
            </div>
          </div>
        </div>
      </section>

      {/* Ticker bar — mission-control feel */}
      <div className="ticker-border bg-[#0D0D0C] py-2 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
            {["AI/ML", "Fintech", "Biotech", "B2B SaaS", "Deep Tech", "Consumer", "Hardware", "Social Impact"].map((ind) => {
              const count = startups.filter(s => s.industry === ind).length;
              return count > 0 ? (
                <button
                  key={ind}
                  onClick={() => setFilterIndustry(ind as IndustryType)}
                  className={`flex-shrink-0 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors duration-150 ${filterIndustry === ind ? "text-crimson" : "text-[#5A5B53] hover:text-[#8A8B80]"}`}
                >
                  <span className={`w-1 h-1 rounded-full ${filterIndustry === ind ? "bg-crimson" : "bg-[#2A2A28]"}`} />
                  {ind} <span className="text-[#2A2A28]">({count})</span>
                </button>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Directory */}
      <div className="container mx-auto px-6 py-12 max-w-7xl">

        {/* Search + sort bar */}
        <div className="mb-8">
          <div className="flex max-w-[680px]">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A5B53] pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search startups…"
                className="w-full h-[52px] pl-11 pr-4 font-body text-[16px] text-[#F5F1E8] placeholder:text-[#5A5B53] bg-[#141413] border-[1.5px] border-[#2A2A28] rounded-l-sm rounded-r-none outline-none focus:border-crimson focus:shadow-glow transition-all duration-150"
              />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="appearance-none h-[52px] pl-4 pr-10 font-body text-[14px] font-medium text-white bg-crimson border-[1.5px] border-crimson rounded-l-none rounded-r-sm cursor-pointer outline-none hover:bg-crimson-dim transition-colors duration-150"
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
            <div className="relative">
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value as IndustryType | "")}
                className={`appearance-none h-8 pl-3 pr-8 font-body text-[13px] rounded-sm border cursor-pointer outline-none transition-colors duration-150 ${
                  filterIndustry
                    ? "bg-crimson/15 text-crimson border-crimson/40"
                    : "bg-[#141413] text-[#8A8B80] border-[#2A2A28] hover:border-[#5A5B53]"
                }`}
              >
                <option value="">Industry</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${filterIndustry ? "text-crimson" : "text-[#5A5B53]"}`} />
            </div>

            <div className="relative">
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value as StageType | "")}
                className={`appearance-none h-8 pl-3 pr-8 font-body text-[13px] rounded-sm border cursor-pointer outline-none transition-colors duration-150 ${
                  filterStage
                    ? "bg-crimson/15 text-crimson border-crimson/40"
                    : "bg-[#141413] text-[#8A8B80] border-[#2A2A28] hover:border-[#5A5B53]"
                }`}
              >
                <option value="">Stage</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${filterStage ? "text-crimson" : "text-[#5A5B53]"}`} />
            </div>

            {[
              { active: filterHiring, label: "Hiring", icon: Briefcase, onClick: () => setFilterHiring(!filterHiring) },
              { active: filterVC,     label: "Open to VCs", icon: TrendingUp, onClick: () => setFilterVC(!filterVC) },
            ].map(({ active, label, icon: Icon, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className={`inline-flex items-center gap-1.5 h-8 px-3 font-body text-[13px] rounded-sm border transition-colors duration-150 ${
                  active
                    ? "bg-crimson/15 text-crimson border-crimson/40"
                    : "bg-[#141413] text-[#8A8B80] border-[#2A2A28] hover:border-[#5A5B53]"
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}

            {(hasFilters || search) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 font-body text-[13px] text-[#5A5B53] border border-[#2A2A28] rounded-sm hover:border-[#5A5B53] hover:text-[#8A8B80] flex items-center gap-1 transition-colors duration-150"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Count + divider */}
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-[12px] text-[#5A5B53] uppercase tracking-[0.06em]">
            {loading ? "Loading…" : `${sorted.length} result${sorted.length !== 1 ? "s" : ""}`}
          </span>
          {sortBy !== "recent" && (
            <span className="font-mono text-[12px] text-crimson">
              · {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
            </span>
          )}
          <div className="flex-1 h-px bg-[#2A2A28]" />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#141413] border border-[#2A2A28] rounded-sm p-6 animate-pulse h-52">
                <div className="h-4 bg-[#1C1C1A] rounded-sm w-1/3 mb-4" />
                <div className="h-6 bg-[#1C1C1A] rounded-sm w-3/4 mb-3" />
                <div className="h-3 bg-[#1C1C1A] rounded-sm w-full mb-2" />
                <div className="h-3 bg-[#1C1C1A] rounded-sm w-5/6" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24 border border-[#2A2A28] rounded-sm bg-[#141413]">
            <p className="font-display text-[25px] text-[#F5F1E8] mb-3">No startups found</p>
            <p className="font-body text-[14px] text-[#8A8B80]">
              {hasFilters || search ? "Try adjusting your filters." : "Be the first to add a startup!"}
            </p>
            {!hasFilters && !search && user && (
              <Link to="/submit" className="mt-6 inline-block">
                <button className="inline-flex items-center gap-2 h-11 px-6 bg-crimson text-white font-body font-medium text-[14px] rounded-sm hover:bg-crimson-dim transition-colors duration-150">
                  <Plus className="w-4 h-4" /> Add Your Startup
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((s, i) => (
              <div key={s.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                <StartupCard
                  startup={s}
                  score={scores.get(s.id) ?? { total: 0, investorCount: 0 }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-[#2A2A28] bg-[#0D0D0C]">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-sm bg-crimson flex items-center justify-center">
                  <span className="text-white font-display font-bold text-sm">S</span>
                </div>
                <span className="font-display font-bold text-[#F5F1E8] text-[17px]">Source</span>
                <span className="font-body font-light text-[#5A5B53] text-[13px]">Harvard</span>
              </div>
              <p className="font-body text-[14px] text-[#5A5B53] leading-relaxed max-w-xs">
                The Harvard startup directory connecting founders, investors, and talent across the ecosystem.
              </p>
            </div>
            {/* Directory */}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#5A5B53] mb-4">Directory</p>
              <div className="space-y-2.5">
                {["Browse Startups", "Open Roles", "Investor Network", "Submit Startup"].map(l => (
                  <p key={l} className="font-body text-[14px] text-[#5A5B53] hover:text-[#8A8B80] cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
            </div>
            {/* Platform */}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#5A5B53] mb-4">Platform</p>
              <div className="space-y-2.5">
                {["About", "Sign In", "Join", "Admin"].map(l => (
                  <p key={l} className="font-body text-[14px] text-[#5A5B53] hover:text-[#8A8B80] cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="pt-8 border-t border-[#1E1E1C] flex items-center justify-between gap-4 flex-wrap">
            <p className="font-mono text-[11px] text-[#5A5B53] uppercase tracking-[0.06em]">
              © {new Date().getFullYear()} Source Harvard · All rights reserved
            </p>
            <p className="font-mono text-[11px] text-[#2A2A28] uppercase tracking-[0.06em]">
              Built for the Harvard ecosystem
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
