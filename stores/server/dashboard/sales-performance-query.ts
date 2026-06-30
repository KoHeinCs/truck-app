import { useAuthStore } from "@/stores/auth-store";
import { useQuery } from "@tanstack/react-query";
import { axios } from "../api";
import type { SalesPerformanceResponse } from "./typed";

type FetchSalesPerformanceParams = {
  year: number;
  role: string;
  userId?: string | null;
};

const fetchSalesPerformance = async ({
  year,
  role,
  userId,
}: FetchSalesPerformanceParams): Promise<SalesPerformanceResponse> => {
  const upperRole = (role || "").toUpperCase();

  if (upperRole === "ADMIN") {
    const { data } = await axios.get<SalesPerformanceResponse>(
      "/dashboard/sales-performance",
      { params: { year } },
    );
    return data;
  }

  if (upperRole === "OWNER" && userId) {
    const { data } = await axios.get<SalesPerformanceResponse>(
      `/dashboard/sales-performance/${userId}`,
      { params: { year } },
    );
    return data;
  }

  return { data: [], httpStatus: 200, message: "" };
};

export function useSalesPerformance(year: number) {
  const role = useAuthStore((state) => state.role);
  const userId = useAuthStore((state) => state.userId);
  const upperRole = (role || "").toUpperCase();
  const enabled =
    upperRole === "ADMIN" || (upperRole === "OWNER" && !!userId);

  return useQuery({
    queryKey: ["dashboard", "sales-performance", year, upperRole, userId],
    queryFn: () => fetchSalesPerformance({ year, role: upperRole, userId }),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
