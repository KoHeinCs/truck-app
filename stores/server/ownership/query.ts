import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { axios } from "../api";
import {
  buildOwnershipSearchColumns,
  ownershipFiltersKey,
  type OwnershipColumn,
  type OwnershipListFilters,
  type OwnershipTruckStatus,
} from "./search-columns";
import type {
  OwnershipItem,
  OwnershipListResponse,
  OwnershipRunningBalanceResponse,
} from "./typed";

const OWNERSHIP_PAGE_SIZE = 10;

type OwnershipSearchPayload = {
  page: number;
  pageSize: number;
  columns: OwnershipColumn[];
};

const searchOwnerships = async (
  payload: OwnershipSearchPayload,
): Promise<OwnershipListResponse> => {
  const { data } = await axios.post("/ownership/search", payload);
  return data;
};

export function useOwnershipsInfinite(
  status: OwnershipTruckStatus,
  filters: OwnershipListFilters,
  role: string | null,
): UseInfiniteQueryResult<InfiniteData<OwnershipListResponse>, Error> {
  const allowOwnerId = (role || "").toUpperCase() === "ADMIN";
  const filterKey = ownershipFiltersKey(status, filters, allowOwnerId);
  const columns = buildOwnershipSearchColumns(status, filters, allowOwnerId);

  return useInfiniteQuery<
    OwnershipListResponse,
    Error,
    InfiniteData<OwnershipListResponse>,
    (string | number)[],
    number
  >({
    queryKey: ["ownership", "infinite", status, OWNERSHIP_PAGE_SIZE, filterKey],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      searchOwnerships({
        page: pageParam,
        pageSize: OWNERSHIP_PAGE_SIZE,
        columns,
      }),
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data;
      if (!meta) return undefined;
      const { totalPages, page } = meta;
      if (typeof totalPages === "number" && totalPages > 0) {
        if (page >= totalPages - 1) return undefined;
      } else if (meta.last) {
        return undefined;
      }
      return page + 1;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
  });
}

const fetchOwnershipByPlateNo = async (
  plateNo: string,
  status: OwnershipTruckStatus,
): Promise<OwnershipItem | null> => {
  const filters: OwnershipListFilters = {
    quickQuery: "",
    plateNo,
    licenseCity: "",
    licenseEndDate: "",
    profit: "",
    ownerIdCsv: "",
  };
  const columns = buildOwnershipSearchColumns(status, filters, false);
  const response = await searchOwnerships({
    page: 1,
    pageSize: 1,
    columns,
  });
  return response.data?.data?.[0] ?? null;
};

const fetchOwnershipRunningBalance = async (
  ownershipId: string,
): Promise<OwnershipRunningBalanceResponse> => {
  const { data } = await axios.get(
    `/ownership/running-balance/${ownershipId}`,
  );
  return data;
};

export function useOwnershipByPlateNo(
  plateNo: string,
  status: OwnershipTruckStatus,
  enabled = true,
) {
  const normalizedPlateNo = plateNo.trim();
  const normalizedStatus = status || "ACTIVE";

  return useQuery({
    queryKey: ["ownership", "detail", normalizedPlateNo, normalizedStatus],
    queryFn: () => fetchOwnershipByPlateNo(normalizedPlateNo, normalizedStatus),
    enabled: enabled && !!normalizedPlateNo,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useOwnershipRunningBalance(
  ownershipId: string,
  enabled = true,
) {
  const normalizedId = ownershipId.trim();

  return useQuery({
    queryKey: ["ownership", "runningBalance", normalizedId],
    queryFn: () => fetchOwnershipRunningBalance(normalizedId),
    enabled: enabled && !!normalizedId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export { OWNERSHIP_PAGE_SIZE };
