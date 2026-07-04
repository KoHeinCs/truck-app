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

  if ((upperRole === "ADMIN" || upperRole === "OWNER") && userId) {
    const { data } = await axios.get<SalesPerformanceResponse>(
      `/dashboard/sales-performance/${userId}`,
      { params: { year } },
    );
    return data;
  }

  return { data: [], httpStatus: 200, message: "" };
};

export function useSalesPerformance(
  year: number,
  selectedOwnerId?: string | null,
) {
  const role = useAuthStore((state) => state.role);
  const userId = useAuthStore((state) => state.userId);
  const upperRole = (role || "").toUpperCase();
  const effectiveOwnerId =
    upperRole === "ADMIN" ? selectedOwnerId?.trim() || null : userId;
  const enabled =
    (upperRole === "ADMIN" && !!effectiveOwnerId) ||
    (upperRole === "OWNER" && !!userId);

  return useQuery({
    queryKey: [
      "dashboard",
      "sales-performance",
      year,
      upperRole,
      effectiveOwnerId,
    ],
    queryFn: () =>
      fetchSalesPerformance({
        year,
        role: upperRole,
        userId: effectiveOwnerId,
      }),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
