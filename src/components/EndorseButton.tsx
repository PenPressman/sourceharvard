import { ThumbsUp, Building2 } from "lucide-react";
import { useEndorsements } from "@/hooks/useEndorsements";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface EndorseButtonProps {
  targetType: "startup" | "founder" | "student";
  targetId: string;
  ownerId?: string;
}

interface ScoreBadgesProps {
  total: number;
  investorCount: number;
  size?: "sm" | "md";
}

/** Read-only score badges — for startup cards */
export function ScoreBadges({ total, investorCount, size = "sm" }: ScoreBadgesProps) {
  if (total === 0 && investorCount === 0) return null;

  const textCls = size === "sm" ? "text-xs" : "text-sm";
  const iconCls = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <div className="flex items-center gap-2">
      {total > 0 && (
        <span className={`inline-flex items-center gap-1 ${textCls} text-muted-foreground font-medium`}>
          <ThumbsUp className={iconCls} />
          {total}
        </span>
      )}
      {investorCount > 0 && (
        <span className={`inline-flex items-center gap-1 ${textCls} px-1.5 py-0.5 rounded-md bg-blue-accent-muted text-accent border border-accent/20 font-medium`}>
          <Building2 className={iconCls} />
          {investorCount}
        </span>
      )}
    </div>
  );
}

/** Interactive endorse button — for profile pages */
export default function EndorseButton({ targetType, targetId, ownerId }: EndorseButtonProps) {
  const { user } = useAuth();
  const { total, investorCount, hasEndorsed, isSelf, toggle } = useEndorsements(
    targetType,
    targetId,
    ownerId
  );

  const canEndorse = !!user && !isSelf;

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Button */}
      {!user ? (
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:border-primary/60 hover:text-foreground transition-all"
        >
          <ThumbsUp className="w-4 h-4" />
          Sign in to endorse
        </Link>
      ) : isSelf ? (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground/40 cursor-default select-none">
          <ThumbsUp className="w-4 h-4" />
          Your profile
        </span>
      ) : (
        <button
          onClick={toggle}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-150 ${
            hasEndorsed
              ? "bg-primary border-primary text-primary-foreground shadow-glow"
              : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          {hasEndorsed ? "Endorsed ✓" : "Endorse"}
        </button>
      )}

      {/* Score display */}
      <div className="flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5 text-foreground font-semibold">
          <ThumbsUp className="w-3.5 h-3.5 text-muted-foreground" />
          {total}
          <span className="text-muted-foreground font-normal">
            {total === 1 ? "endorsement" : "endorsements"}
          </span>
        </span>

        {investorCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-accent-muted border border-accent/20 text-accent text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            {investorCount} investor{investorCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
