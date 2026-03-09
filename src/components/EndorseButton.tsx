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

  return (
    <div className="flex items-center gap-2">
      {total > 0 && (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate">
          <ThumbsUp className="w-3 h-3" />
          {total}
        </span>
      )}
      {investorCount > 0 && (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded-sm bg-[#EDE9DE] text-slate border border-[#D6D0C4]">
          <Building2 className="w-3 h-3" />
          {investorCount}
        </span>
      )}
    </div>
  );
}

/** Interactive endorse button — for profile pages */
export default function EndorseButton({ targetType, targetId, ownerId }: EndorseButtonProps) {
  const { user } = useAuth();
  const { total, investorCount, hasEndorsed, isSelf, toggle } = useEndorsements(targetType, targetId, ownerId);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Button */}
      {!user ? (
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-4 py-2 font-body text-[14px] font-medium border border-[#D6D0C4] text-slate rounded-sm hover:border-ink hover:text-ink transition-colors duration-150"
        >
          <ThumbsUp className="w-4 h-4" />
          Sign in to endorse
        </Link>
      ) : isSelf ? (
        <span className="inline-flex items-center gap-2 px-4 py-2 font-body text-[14px] border border-[#D6D0C4] text-slate/40 rounded-sm cursor-default select-none">
          <ThumbsUp className="w-4 h-4" />
          Your profile
        </span>
      ) : (
        <button
          onClick={toggle}
          className={`inline-flex items-center gap-2 px-4 py-2 font-body text-[14px] font-medium border rounded-sm transition-all duration-150 ${
            hasEndorsed
              ? "bg-crimson border-crimson text-white"
              : "border-[#D6D0C4] text-slate hover:border-ink hover:text-ink"
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          {hasEndorsed ? "Endorsed ✓" : "Endorse"}
        </button>
      )}

      {/* Score display */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 font-body text-[15px] text-ink font-medium">
          <ThumbsUp className="w-3.5 h-3.5 text-slate" />
          {total}
          <span className="text-slate font-normal">
            {total === 1 ? "endorsement" : "endorsements"}
          </span>
        </span>
        {investorCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#EDE9DE] border border-[#D6D0C4] text-slate font-mono text-[12px]">
            <Building2 className="w-3.5 h-3.5" />
            {investorCount} investor{investorCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
