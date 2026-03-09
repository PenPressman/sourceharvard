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
  "Fintech":       "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30",
  "Biotech":       "bg-sky-950/60 text-sky-400 border-sky-800/60",
  "AI/ML":         "bg-violet-950/60 text-violet-400 border-violet-800/60",
  "Consumer":      "bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/30",
  "B2B SaaS":      "bg-[#FF4D8D]/10 text-[#FF4D8D] border-[#FF4D8D]/30",
  "Hardware":      "bg-[#1C1C1A] text-[#A8A9A0] border-[#2A2A28]",
  "Social Impact": "bg-teal-950/60 text-teal-400 border-teal-800/60",
  "Deep Tech":     "bg-indigo-950/60 text-indigo-400 border-indigo-800/60",
  "Other":         "bg-[#1C1C1A] text-[#A8A9A0] border-[#2A2A28]",
};

export default function StartupCard({ startup, score }: StartupCardProps) {
  return (
    <Link to={`/startup/${startup.id}`} className="block group">
      <div className="bg-[#141413] border border-[#2A2A28] rounded-sm p-6 transition-all duration-150 group-hover:border-[#A51C30]/60 group-hover:shadow-crimson flex flex-col h-full relative overflow-hidden">

        {/* Subtle corner accent */}
        <div className="absolute top-0 left-0 w-8 h-px bg-crimson opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        <div className="absolute top-0 left-0 h-8 w-px bg-crimson opacity-0 group-hover:opacity-100 transition-opacity duration-150" />

        {/* Badge row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`inline-block font-mono text-[11px] uppercase tracking-[0.06em] px-2 py-0.5 border rounded-sm ${industryColors[startup.industry] ?? industryColors["Other"]}`}>
            {startup.industry}
          </span>
          <div className="flex items-center gap-1.5">
            {startup.is_hiring && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 bg-crimson text-white rounded-sm">
                <Briefcase className="w-2.5 h-2.5" />Hiring
              </span>
            )}
            {startup.open_to_vc && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 bg-[#1C1C1A] text-[#8A8B80] border border-[#2A2A28] rounded-sm">
                <TrendingUp className="w-2.5 h-2.5" />VC
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-body font-bold text-[20px] text-white mb-2 leading-[1.3] group-hover:text-crimson transition-colors duration-150 line-clamp-1">
          {startup.name}
        </h3>

        {/* Description */}
        <p className="font-body text-[14px] text-[#A8A9A0] leading-relaxed line-clamp-2 flex-1 mb-4">
          {startup.description}
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 pt-4 border-t border-[#2A2A28]">
          <span className="inline-block font-mono text-[11px] uppercase tracking-[0.06em] px-2 py-0.5 bg-[#1C1C1A] text-[#8A8B80] border border-[#2A2A28] rounded-sm">
            {startup.stage}
          </span>
          {score && <ScoreBadges total={score.total} investorCount={score.investorCount} />}
        </div>
      </div>
    </Link>
  );
}
