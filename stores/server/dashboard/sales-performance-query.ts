import {useAuthStore} from "@/stores/auth-store";
import {useQuery} from "@tanstack/react-query";
import {axios} from "../api";
import type {SalesPerformanceResponse} from "./typed";

type FetchSalesPerformanceParams = {
    year: number;
    role: string;
    ownerId?: string | null;
};

const fetchSalesPerformance = async ({
                                         year,
                                         role,
                                         ownerId,
                                     }: FetchSalesPerformanceParams): Promise<SalesPerformanceResponse> => {

    const trimmedOwnerId = ownerId?.trim();

    if (role === "ADMIN"){
        const url = trimmedOwnerId ? `/dashboard/sales-performance/${trimmedOwnerId}` : `/dashboard/sales-performance`;
        const {data} = await axios.get<SalesPerformanceResponse>(url, {params: {year}},);
        return data;
    }

    if (role === "OWNER" || role === 'VIEWER') {
        const url =  `/dashboard/sales-performance/${trimmedOwnerId}`;
        const {data} = await axios.get<SalesPerformanceResponse>(url,{params: {year}},);
        return data;
    }
    return {data: [], httpStatus: 200, message: ""};
};

export function useSalesPerformance(
    year: number,
    selectedOwnerId?: string | null,
) {

    const role = useAuthStore((state) => state.role);
    const userId = useAuthStore((state) => state.userId);
    const parentOwnerId = useAuthStore((state) => state.parentOwnerId);

    const upperRole = (role || "").toUpperCase();
    let effectiveOwnerId = null;

    if (upperRole === "ADMIN") {
        effectiveOwnerId = selectedOwnerId?.trim() || null;
    } else if (upperRole === "OWNER") {
        effectiveOwnerId = userId;
    } else if (upperRole === "VIEWER") {
        effectiveOwnerId = parentOwnerId;
    }

    const enabled = (upperRole === "ADMIN") || (upperRole === "OWNER" && !!effectiveOwnerId) || (upperRole === "VIEWER" && !!effectiveOwnerId)

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
                ownerId: effectiveOwnerId,
            }),
        enabled,
        staleTime: 0,
        refetchOnWindowFocus: false,
    });
}
