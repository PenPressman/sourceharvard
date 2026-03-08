import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Briefcase, TrendingUp } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Startup = Database["public"]["Tables"]["startups"]["Row"];

interface StartupCardProps {
  startup: Startup;
}

const industryColors: Record<string, string> = {
  "Fintech": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Biotech": "bg-blue-50 text-blue-700 border-blue-200",
  "AI/ML": "bg-violet-50 text-violet-700 border-violet-200",
  "Consumer": "bg-orange-50 text-orange-700 border-orange-200",
  "B2B SaaS": "bg-sky-50 text-sky-700 border-sky-200",
  "Hardware": "bg-stone-50 text-stone-700 border-stone-200",
  "Social Impact": "bg-teal-50 text-teal-700 border-teal-200",
  "Other": "bg-muted text-muted-foreground border-border",
};

const stageColors: Record<string, string> = {
  "Idea": "bg-muted text-muted-foreground border-border",
  "Pre-seed": "bg-amber-50 text-amber-700 border-amber-200",
  "Seed": "bg-lime-50 text-lime-700 border-lime-200",
  "Series A+": "bg-primary/10 text-primary border-primary/20",
};

export default function StartupCard({ startup }: StartupCardProps) {
  return (
    <Link to={`/startup/${startup.id}`} className="block group">
      <div className="bg-card border border-border rounded-lg p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 h-full flex flex-col">
        {/* Header */}
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
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-crimson-muted text-accent-foreground font-medium border border-primary/15">
                <TrendingUp className="w-3 h-3" />
                VC Ready
              </span>
            )}
          </div>
        </div>

        {/* Name + Description */}
        <h3 className="font-display font-semibold text-foreground text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
          {startup.name}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
          {startup.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border font-medium ${industryColors[startup.industry] ?? industryColors["Other"]}`}>
            {startup.industry}
          </span>
          <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border font-medium ${stageColors[startup.stage] ?? stageColors["Idea"]}`}>
            {startup.stage}
          </span>
          <span className="inline-block text-xs px-2.5 py-0.5 rounded-full border border-border text-muted-foreground">
            {startup.founded_year}
          </span>
        </div>
      </div>
    </Link>
  );
}
