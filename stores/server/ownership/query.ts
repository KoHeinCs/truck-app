import {
  useInfiniteQuery,
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
import type { OwnershipListResponse } from "./typed";

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

export { OWNERSHIP_PAGE_SIZE };
