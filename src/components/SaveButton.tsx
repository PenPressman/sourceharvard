import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SaveButtonProps {
  startupId: string;
}

export default function SaveButton({ startupId }: SaveButtonProps) {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const isInvestor = role === "investor" || role === "admin";

  useEffect(() => {
    if (!user || !isInvestor) return;
    supabase
      .from("saved_startups" as any)
      .select("id")
      .eq("user_id", user.id)
      .eq("startup_id", startupId)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [user, startupId, isInvestor]);

  if (!user || !isInvestor) return null;

  const toggle = async () => {
    if (!user) return;
    setLoading(true);
    if (saved) {
      await supabase
        .from("saved_startups" as any)
        .delete()
        .eq("user_id", user.id)
        .eq("startup_id", startupId);
      setSaved(false);
      toast({ description: "Removed from saved startups." });
    } else {
      await supabase
        .from("saved_startups" as any)
        .insert({ user_id: user.id, startup_id: startupId });
      setSaved(true);
      toast({ description: "Startup saved to your favorites!" });
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 h-8 px-3 font-body text-[13px] border rounded-sm transition-colors duration-150 ${
        saved
          ? "bg-crimson/10 border-crimson/30 text-crimson hover:bg-crimson/15"
          : "border-[#D6D0C4] text-slate hover:border-ink hover:text-ink"
      }`}
    >
      {saved
        ? <><BookmarkCheck className="w-3.5 h-3.5" />Saved</>
        : <><Bookmark className="w-3.5 h-3.5" />Save</>
      }
    </button>
  );
}
