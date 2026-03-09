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

export function ScoreBadges({ total, investorCount, size = "sm" }: ScoreBadgesProps) {
  if (total === 0 && investorCount === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {total > 0 && (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#5A5B53]">
          <ThumbsUp className="w-3 h-3" />
          {total}
        </span>
      )}
      {investorCount > 0 && (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded-sm bg-[#1C1C1A] text-[#8A8B80] border border-[#2A2A28]">
          <Building2 className="w-3 h-3" />
          {investorCount}
        </span>
      )}
    </div>
  );
}

export default function EndorseButton({ targetType, targetId, ownerId }: EndorseButtonProps) {
  const { user } = useAuth();
  const { total, investorCount, hasEndorsed, isSelf, toggle } = useEndorsements(targetType, targetId, ownerId);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {!user ? (
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-4 py-2 font-body text-[14px] font-medium border border-[#2A2A28] text-[#8A8B80] rounded-sm hover:border-[#5A5B53] hover:text-[#F5F1E8] transition-colors duration-150"
        >
          <ThumbsUp className="w-4 h-4" />
          Sign in to endorse
        </Link>
      ) : isSelf ? (
        <span className="inline-flex items-center gap-2 px-4 py-2 font-body text-[14px] border border-[#2A2A28] text-[#5A5B53] rounded-sm cursor-default select-none">
          <ThumbsUp className="w-4 h-4" />
          Your profile
        </span>
      ) : (
        <button
          onClick={toggle}
          className={`inline-flex items-center gap-2 px-4 py-2 font-body text-[14px] font-medium border rounded-sm transition-all duration-150 ${
            hasEndorsed
              ? "bg-crimson border-crimson text-white"
              : "border-[#2A2A28] text-[#8A8B80] hover:border-[#5A5B53] hover:text-[#F5F1E8]"
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          {hasEndorsed ? "Endorsed ✓" : "Endorse"}
        </button>
      )}

      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 font-body text-[15px] text-[#F5F1E8] font-medium">
          <ThumbsUp className="w-3.5 h-3.5 text-[#5A5B53]" />
          {total}
          <span className="text-[#5A5B53] font-normal">
            {total === 1 ? "endorsement" : "endorsements"}
          </span>
        </span>
        {investorCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#1C1C1A] border border-[#2A2A28] text-[#8A8B80] font-mono text-[12px]">
            <Building2 className="w-3.5 h-3.5" />
            {investorCount} investor{investorCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
