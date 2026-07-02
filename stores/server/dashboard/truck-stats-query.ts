import { useAuthStore } from "@/stores/auth-store";
import { useQuery } from "@tanstack/react-query";
import { axios } from "../api";
import type { TruckStatsResponse } from "./typed";

const fetchTruckStats = async (): Promise<TruckStatsResponse> => {
  const { data } = await axios.get<TruckStatsResponse>("/dashboard/truck-stats");
  return data;
};

export function useTruckStats() {
  const role = useAuthStore((state) => state.role);
  const userId = useAuthStore((state) => state.userId);
  const upperRole = (role || "").toUpperCase();
  const enabled =
    upperRole === "ADMIN" || (upperRole === "OWNER" && !!userId);

  return useQuery({
    queryKey: ["dashboard", "truck-stats", upperRole, userId],
    queryFn: fetchTruckStats,
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
