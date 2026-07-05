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
  ownerId,
}: FetchProposalStatsParams): Promise<ProposalStatsResponse> => {

  const trimmedOwnerId = ownerId?.trim();

  if (role === "ADMIN") {
    const url = trimmedOwnerId? `/dashboard/proposal-stats/${trimmedOwnerId}`: "/dashboard/proposal-stats";
    const { data } = await axios.get<ProposalStatsResponse>(url);
    return data;
  }

  if (role === "OWNER" || role === 'VIEWER') {
    const { data } = await axios.get<ProposalStatsResponse>(
      `/dashboard/proposal-stats/${trimmedOwnerId}`,
    );
    return data;
  }

  return emptyProposalStats;
};

export function useProposalStats(selectedOwnerId?: string | null) {

  const role = useAuthStore((state) => state.role);
  const userId = useAuthStore((state) => state.userId);
  const parentOwnerId = useAuthStore((state) => state.parentOwnerId);

  const upperRole = (role || "").toUpperCase();
  let effectiveOwnerId = null  ;

  if (upperRole === "ADMIN"){
    effectiveOwnerId =  selectedOwnerId?.trim() || null ;
  }else if (upperRole === "OWNER"){
    effectiveOwnerId = userId;
  }else if (upperRole === "VIEWER"){
    effectiveOwnerId = parentOwnerId;
  }

  const enabled = (upperRole === "ADMIN") || (upperRole === "OWNER" && !!effectiveOwnerId) || (upperRole === "VIEWER" && !!effectiveOwnerId)

  return useQuery({
    queryKey: ["dashboard", "proposal-stats", upperRole, effectiveOwnerId],
    queryFn: () =>
      fetchProposalStats({
        role: upperRole,
        ownerId: effectiveOwnerId,
      }),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
