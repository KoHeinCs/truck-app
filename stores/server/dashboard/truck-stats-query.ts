import { useAuthStore } from "@/stores/auth-store";
import { useQuery } from "@tanstack/react-query";
import { axios } from "../api";
import type { TruckStatsResponse } from "./typed";

type FetchTruckStatsParams = {
  role: string;
  ownerId?: string | null;
};

const emptyTruckStats: TruckStatsResponse = {
  data: {
    topProfitTrucks: [],
    totalActiveTrucks: 0,
    totalSoldTrucks: 0,
    totalTrucks: 0,
  },
  httpStatus: 200,
  message: "",
};

const fetchTruckStats = async ({
  role,
  ownerId,
}: FetchTruckStatsParams): Promise<TruckStatsResponse> => {

  const trimmedOwnerId = ownerId?.trim();

  if (role === "ADMIN") {
    const url = trimmedOwnerId ? `/dashboard/truck-stats/${trimmedOwnerId}`: "/dashboard/truck-stats";
    const { data } = await axios.get<TruckStatsResponse>(url);
    return data;
  }

  if (role === "OWNER" || role === 'VIEWER') {
    const { data } = await axios.get<TruckStatsResponse>(
      `/dashboard/truck-stats/${trimmedOwnerId}`,
    );
    return data;
  }

  return emptyTruckStats;
};

export function useTruckStats(selectedOwnerId?: string | null) {
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
    queryKey: ["dashboard", "truck-stats", upperRole, effectiveOwnerId],
    queryFn: () =>
      fetchTruckStats({
        role: upperRole,
        ownerId: effectiveOwnerId,
      }),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

}
