import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { axios } from "../api";
import type { Column } from "../user/query";
import type { TruckListResponse } from "./typed";

export interface TruckSearchPayload {
  page: number;
  pageSize: number;
  columns: Column[];
}

const searchTrucks = async (payload: TruckSearchPayload): Promise<TruckListResponse> => {
  const { data } = await axios.post("/truck/search", payload);
  return data;
};

const TRUCK_PAGE_SIZE = 10;

export function useTrucksInfinite(
  columns: Column[],
): UseInfiniteQueryResult<InfiniteData<TruckListResponse>, Error> {
  return useInfiniteQuery<
    TruckListResponse,
    Error,
    InfiniteData<TruckListResponse>,
    (string | number | Column[])[],
    number
  >({
    queryKey: ["trucks", "infinite", TRUCK_PAGE_SIZE, columns],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      searchTrucks({
        page: pageParam,
        pageSize: TRUCK_PAGE_SIZE,
        columns,
      }),
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const meta = lastPage.data;
      if (!meta) return undefined;
      const { totalPages, page } = meta;
      if (typeof totalPages === "number" && totalPages > 0) {
        if (page >= totalPages - 1) return undefined;
      } else if (meta.last) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export { TRUCK_PAGE_SIZE };
