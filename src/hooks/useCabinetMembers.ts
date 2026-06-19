import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CabinetMember {
  id: string;
  cabinet_id: string;
  user_id: string;
  role: string;
  status: "active" | "invited" | "suspended" | "removed";
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UseCabinetMembersReturn {
  members: CabinetMember[];        // active only
  allMembers: CabinetMember[];     // all statuses
  memberUserIds: string[];         // active user_ids
  getRecipientsExcept: (excludeUserId: string | null | undefined) => string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCabinetMembers = (cabinetId: string | null | undefined): UseCabinetMembersReturn => {
  const [allMembers, setAllMembers] = useState<CabinetMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!cabinetId) {
      setAllMembers([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("cabinet_members")
      .select("*")
      .eq("cabinet_id", cabinetId);

    if (err) {
      console.error("[useCabinetMembers] fetch error", err);
      setError(err.message);
      setAllMembers([]);
    } else {
      setAllMembers((data ?? []) as CabinetMember[]);
    }
    setIsLoading(false);
  }, [cabinetId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Realtime: refetch on any change for this cabinet
  useEffect(() => {
    if (!cabinetId) return;
    const channel = supabase
      .channel(`cabinet_members:${cabinetId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cabinet_members",
          filter: `cabinet_id=eq.${cabinetId}`,
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cabinetId, fetchMembers]);

  const members = useMemo(
    () => allMembers.filter((m) => m.status === "active"),
    [allMembers]
  );

  const memberUserIds = useMemo(
    () => members.map((m) => m.user_id),
    [members]
  );

  const getRecipientsExcept = useCallback(
    (excludeUserId: string | null | undefined): string[] => {
      if (!excludeUserId) return memberUserIds;
      return memberUserIds.filter((id) => id !== excludeUserId);
    },
    [memberUserIds]
  );

  return {
    members,
    allMembers,
    memberUserIds,
    getRecipientsExcept,
    isLoading,
    error,
    refetch: fetchMembers,
  };
};
