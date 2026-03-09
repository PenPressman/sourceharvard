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

// Stage badge — use DM Mono, muted-bg
const stageBadge = (stage: string) =>
  `inline-block font-mono text-[11px] uppercase tracking-[0.06em] px-2 py-0.5 bg-[#EDE9DE] text-[#4A4E5A] border border-[#D6D0C4] rounded-sm`;

// Industry badge
const industryBadge = (industry: string) =>
  `inline-block font-mono text-[11px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-sm border font-normal`;

const industryColors: Record<string, string> = {
  "Fintech":       "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Biotech":       "bg-sky-50 text-sky-700 border-sky-200",
  "AI/ML":         "bg-violet-50 text-violet-700 border-violet-200",
  "Consumer":      "bg-orange-50 text-orange-700 border-orange-200",
  "B2B SaaS":      "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Hardware":      "bg-stone-50 text-stone-600 border-stone-200",
  "Social Impact": "bg-teal-50 text-teal-700 border-teal-200",
  "Deep Tech":     "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Other":         "bg-[#EDE9DE] text-[#4A4E5A] border-[#D6D0C4]",
};

export default function StartupCard({ startup, score }: StartupCardProps) {
  return (
    <Link to={`/startup/${startup.id}`} className="block group">
      <div className="bg-white border border-[#D6D0C4] rounded-sm p-6 shadow-card transition-all duration-150 group-hover:border-[#1A1A18] flex flex-col h-full">

        {/* Source type badge row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`${industryBadge(startup.industry)} ${industryColors[startup.industry] ?? industryColors["Other"]}`}>
            {startup.industry}
          </span>
          <div className="flex items-center gap-1.5">
            {startup.is_hiring && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 bg-crimson text-white rounded-sm">
                <Briefcase className="w-2.5 h-2.5" />Hiring
              </span>
            )}
            {startup.open_to_vc && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 bg-[#EDE9DE] text-[#4A4E5A] border border-[#D6D0C4] rounded-sm">
                <TrendingUp className="w-2.5 h-2.5" />VC
              </span>
            )}
          </div>
        </div>

        {/* Title — Playfair Display */}
        <h3 className="font-display font-bold text-[20px] text-[#1A1A18] mb-2 leading-[1.3] group-hover:text-crimson transition-colors duration-150 line-clamp-1">
          {startup.name}
        </h3>

        {/* Description — DM Sans */}
        <p className="font-body text-[14px] text-[#4A4E5A] leading-relaxed line-clamp-2 flex-1 mb-4">
          {startup.description}
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 pt-4 border-t border-[#D6D0C4]">
          <span className={stageBadge(startup.stage)}>{startup.stage}</span>
          {score && <ScoreBadges total={score.total} investorCount={score.investorCount} />}
        </div>
      </div>
    </Link>
  );
}
