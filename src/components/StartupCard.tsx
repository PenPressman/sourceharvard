import { Link } from "react-router-dom";
import { ScoreBadges } from "@/components/EndorseButton";
import { Briefcase, TrendingUp } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Startup = Database["public"]["Tables"]["startups"]["Row"];

interface EndorsementScore {
  total: number;
  investorCount: number;
}

interface StartupCardProps {
  startup: Startup;
  score?: EndorsementScore;
}

const industryColors: Record<string, string> = {
  "Fintech":       "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Biotech":       "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "AI/ML":         "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Consumer":      "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "B2B SaaS":      "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Hardware":      "bg-stone-500/10 text-stone-400 border-stone-500/20",
  "Social Impact": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Deep Tech":     "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Other":         "bg-muted text-muted-foreground border-border",
};

const stageColors: Record<string, string> = {
  "Pre-idea":  "bg-muted text-muted-foreground border-border",
  "Idea":      "bg-muted text-muted-foreground border-border",
  "Pre-seed":  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Seed":      "bg-lime-500/10 text-lime-400 border-lime-500/20",
  "Series A+": "bg-primary/10 text-primary border-primary/20",
};

export default function StartupCard({ startup, score }: StartupCardProps) {
  return (
    <Link to={`/startup/${startup.id}`} className="block group">
      <div className="bg-card border border-border rounded-lg p-5 shadow-card transition-all duration-200 group-hover:shadow-card-hover group-hover:scale-[1.01] group-hover:border-primary/40 h-full flex flex-col">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-primary text-base">
              {startup.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {startup.is_hiring && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
                <Briefcase className="w-3 h-3" />
                Hiring
              </span>
            )}
            {startup.open_to_vc && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-accent-muted text-accent border border-accent/20 font-medium">
                <TrendingUp className="w-3 h-3" />
                VC
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className="font-display font-semibold text-foreground text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
          {startup.name}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
          {startup.description}
        </p>

        {/* Tags + scores */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-wrap gap-1.5">
            <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border font-medium ${industryColors[startup.industry] ?? industryColors["Other"]}`}>
              {startup.industry}
            </span>
            <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border font-medium ${stageColors[startup.stage] ?? stageColors["Idea"]}`}>
              {startup.stage}
            </span>
          </div>

          {/* Endorsement score badges */}
          {score && <ScoreBadges total={score.total} investorCount={score.investorCount} />}
        </div>
      </div>
    </Link>
  );
}
