import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EndorsementCounts {
  total: number;
  investorCount: number;
}

interface UseEndorsementsReturn extends EndorsementCounts {
  hasEndorsed: boolean;
  isSelf: boolean;
  loading: boolean;
  toggle: () => Promise<void>;
}

export function useEndorsements(
  targetType: "startup" | "founder" | "student",
  targetId: string,
  ownerId?: string
): UseEndorsementsReturn {
  const { user, role } = useAuth();
  const [total, setTotal] = useState(0);
  const [investorCount, setInvestorCount] = useState(0);
  const [hasEndorsed, setHasEndorsed] = useState(false);
  const [isApprovedInvestor, setIsApprovedInvestor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetId) return;

    const load = async () => {
      setLoading(true);

      // Fetch counts via RPC
      const { data: counts } = await supabase.rpc("get_endorsement_counts", {
        p_target_type: targetType,
        p_target_id: targetId,
      });
      if (counts?.[0]) {
        setTotal(Number(counts[0].total));
        setInvestorCount(Number(counts[0].investor_count));
      }

      // Check if current user has endorsed
      if (user) {
        const { data: existing } = await supabase
          .from("endorsements")
          .select("id")
          .eq("user_id", user.id)
          .eq("target_type", targetType)
          .eq("target_id", targetId)
          .maybeSingle();
        setHasEndorsed(!!existing);

        // Check if this user is an approved investor
        if (role === "investor") {
          const { data: inv } = await supabase
            .from("investor_profiles")
            .select("status")
            .eq("user_id", user.id)
            .maybeSingle();
          setIsApprovedInvestor(inv?.status === "approved");
        }
      }

      setLoading(false);
    };

    load();
  }, [targetType, targetId, user, role]);

  const toggle = useCallback(async () => {
    if (!user || user.id === ownerId) return;

    if (hasEndorsed) {
      const { error } = await supabase
        .from("endorsements")
        .delete()
        .eq("user_id", user.id)
        .eq("target_type", targetType)
        .eq("target_id", targetId);

      if (!error) {
        setHasEndorsed(false);
        setTotal((p) => Math.max(0, p - 1));
        if (isApprovedInvestor) setInvestorCount((p) => Math.max(0, p - 1));
      }
    } else {
      const { error } = await supabase.from("endorsements").insert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
      });

      if (!error) {
        setHasEndorsed(true);
        setTotal((p) => p + 1);
        if (isApprovedInvestor) setInvestorCount((p) => p + 1);
      }
    }
  }, [user, ownerId, hasEndorsed, targetType, targetId, isApprovedInvestor]);

  return {
    total,
    investorCount,
    hasEndorsed,
    isSelf: !!user && user.id === ownerId,
    loading,
    toggle,
  };
}
