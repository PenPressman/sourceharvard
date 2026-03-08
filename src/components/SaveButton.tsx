import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SaveButtonProps {
  startupId: string;
}

export default function SaveButton({ startupId }: SaveButtonProps) {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only show for approved investors
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
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={`gap-1.5 transition-colors ${saved ? "border-accent/40 text-accent bg-accent/5 hover:bg-accent/10" : "text-muted-foreground hover:text-foreground"}`}
    >
      {saved
        ? <><BookmarkCheck className="w-3.5 h-3.5" />Saved</>
        : <><Bookmark className="w-3.5 h-3.5" />Save</>
      }
    </Button>
  );
}
