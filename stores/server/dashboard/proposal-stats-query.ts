import { useAuthStore } from "@/stores/auth-store";
import { useQuery } from "@tanstack/react-query";
import { axios } from "../api";
import type { ProposalStatsResponse } from "./typed";

type FetchProposalStatsParams = {
  role: string;
  userId?: string | null;
  ownerId?: string | null;
};

const emptyProposalStats: ProposalStatsResponse = {
  data: {
    totalInformTasks: 0,
  },
  httpStatus: 200,
  message: "",
};

const fetchProposalStats = async ({
  role,
  userId,
  ownerId,
}: FetchProposalStatsParams): Promise<ProposalStatsResponse> => {
  const upperRole = (role || "").toUpperCase();

  if (upperRole === "ADMIN") {
    const trimmedOwnerId = ownerId?.trim();
    const url = trimmedOwnerId
      ? `/dashboard/proposal-stats/${trimmedOwnerId}`
      : "/dashboard/proposal-stats";
    const { data } = await axios.get<ProposalStatsResponse>(url);
    return data;
  }

  if (upperRole === "OWNER" && userId) {
    const { data } = await axios.get<ProposalStatsResponse>(
      "/dashboard/proposal-stats",
    );
    return data;
  }

  return emptyProposalStats;
};

export function useProposalStats(selectedOwnerId?: string | null) {
  const role = useAuthStore((state) => state.role);
  const userId = useAuthStore((state) => state.userId);
  const upperRole = (role || "").toUpperCase();
  const effectiveOwnerId =
    upperRole === "ADMIN" ? selectedOwnerId?.trim() || null : userId;
  const enabled =
    upperRole === "ADMIN" || (upperRole === "OWNER" && !!userId);

  return useQuery({
    queryKey: ["dashboard", "proposal-stats", upperRole, effectiveOwnerId],
    queryFn: () =>
      fetchProposalStats({
        role: upperRole,
        userId,
        ownerId: effectiveOwnerId,
      }),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
