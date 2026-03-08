import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import StartupCard from "@/components/StartupCard";
import type { Database } from "@/integrations/supabase/types";

type Startup = Database["public"]["Tables"]["startups"]["Row"];
type IndustryType = Database["public"]["Enums"]["industry_type"];
type StageType = Database["public"]["Enums"]["stage_type"];

const INDUSTRIES: IndustryType[] = ["Fintech", "Biotech", "AI/ML", "Consumer", "B2B SaaS", "Hardware", "Social Impact", "Other"];
const STAGES: StageType[] = ["Idea", "Pre-seed", "Seed", "Series A+"];

export default function BrowsePage() {
  const { user } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterIndustry, setFilterIndustry] = useState<IndustryType | "">("");
  const [filterStage, setFilterStage] = useState<StageType | "">("");
  const [filterHiring, setFilterHiring] = useState(false);
  const [filterVC, setFilterVC] = useState(false);

  useEffect(() => {
    supabase
      .from("startups")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setStartups(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return startups.filter(s => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterIndustry && s.industry !== filterIndustry) return false;
      if (filterStage && s.stage !== filterStage) return false;
      if (filterHiring && !s.is_hiring) return false;
      if (filterVC && !s.open_to_vc) return false;
      return true;
    });
  }, [startups, search, filterIndustry, filterStage, filterHiring, filterVC]);

  const hasFilters = filterIndustry || filterStage || filterHiring || filterVC;

  const clearFilters = () => {
    setFilterIndustry("");
    setFilterStage("");
    setFilterHiring(false);
    setFilterVC(false);
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-14 text-center max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-crimson-muted text-accent-foreground text-xs font-medium px-3 py-1 rounded-full border border-primary/15 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
            Harvard Startup Community
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-4 leading-tight">
            Discover Harvard<br />
            <span className="text-primary">Student Startups</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Browse ventures built by Harvard founders. Find co-founders, explore careers, or connect with the next generation of builders.
          </p>
          {!user && (
            <div className="flex gap-3 justify-center">
              <Link to="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6">
                  Join as Founder
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="h-11 px-6">Sign in</Button>
              </Link>
            </div>
          )}
          {user && (
            <Link to="/submit">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 gap-2">
                <Plus className="w-4 h-4" />
                Add Your Startup
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Directory */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search + Filters */}
        <div className="space-y-3 mb-7">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search startups…"
              className="pl-10 h-10"
            />
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Industry filter */}
            <div className="relative">
              <select
                value={filterIndustry}
                onChange={e => setFilterIndustry(e.target.value as IndustryType | "")}
                className={`appearance-none h-8 pl-3 pr-8 text-sm rounded-full border cursor-pointer outline-none transition-colors ${filterIndustry ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-foreground/30"}`}
              >
                <option value="">Industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <ChevronDown className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 ${filterIndustry ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>

            {/* Stage filter */}
            <div className="relative">
              <select
                value={filterStage}
                onChange={e => setFilterStage(e.target.value as StageType | "")}
                className={`appearance-none h-8 pl-3 pr-8 text-sm rounded-full border cursor-pointer outline-none transition-colors ${filterStage ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-foreground/30"}`}
              >
                <option value="">Stage</option>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 ${filterStage ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>

            {/* Hiring toggle */}
            <button
              onClick={() => setFilterHiring(!filterHiring)}
              className={`h-8 px-3.5 text-sm rounded-full border transition-colors ${filterHiring ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-foreground/30"}`}
            >
              Hiring
            </button>

            {/* VC toggle */}
            <button
              onClick={() => setFilterVC(!filterVC)}
              className={`h-8 px-3.5 text-sm rounded-full border transition-colors ${filterVC ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-foreground/30"}`}
            >
              Open to VCs
            </button>

            {hasFilters && (
              <button onClick={clearFilters} className="h-8 px-3 text-sm rounded-full border border-border text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${filtered.length} startup${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-5 shadow-card animate-pulse h-44">
                <div className="w-10 h-10 bg-muted rounded-lg mb-3"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-1.5"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-2">No startups found</p>
            <p className="text-sm text-muted-foreground">
              {hasFilters || search ? "Try adjusting your filters." : "Be the first to add a startup!"}
            </p>
            {!hasFilters && !search && user && (
              <Link to="/submit" className="mt-4 inline-block">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mt-4">
                  <Plus className="w-4 h-4" />
                  Add Your Startup
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(s => <StartupCard key={s.id} startup={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
