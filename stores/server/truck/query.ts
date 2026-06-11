import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { axios } from "../api";
import type { Column } from "../user/query";
import { buildTruckSearchColumns } from "./search-columns";
import type {
  TruckDetailResponse,
  TruckItem,
  TruckListResponse,
  TruckSearchResponse,
} from "./typed";

export interface TruckSearchPayload {
  page: number;
  pageSize: number;
  columns: Column[];
}

const searchTrucks = async (payload: TruckSearchPayload): Promise<TruckListResponse> => {
  const { data } = await axios.post("/truck/search", payload);
  return data;
};

const fetchTruckSearchOptions = async (): Promise<TruckSearchResponse> => {
  const { data } = await axios.get("/truck/search");
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
    refetchOnWindowFocus: false,
  });
}

export function useTruckSearchOptions() {
  return useQuery({
    queryKey: ["trucks", "search-options"],
    queryFn: fetchTruckSearchOptions,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export { TRUCK_PAGE_SIZE };

const fetchTruckById = async (id: string): Promise<TruckDetailResponse> => {
  const { data } = await axios.get(`/truck/find/${id}`);
  return data;
};

export function useTruckDetail(id: string) {
  return useQuery({
    queryKey: ["truck", "detail", id],
    queryFn: () => fetchTruckById(id),
    enabled: !!id,
  });
}

const fetchTruckByPlateNo = async (
  plateNo: string,
): Promise<TruckItem | null> => {
  const columns = buildTruckSearchColumns({
    quickQuery: "",
    plateNo,
    model: "",
    modelYear: "",
    engineNo: "",
    chassisNo: "",
  });
  const response = await searchTrucks({
    page: 1,
    pageSize: 1,
    columns,
  });
  return response.data?.data?.[0] ?? null;
};

export function useTruckByPlateNo(plateNo: string, enabled = false) {
  const normalizedPlateNo = plateNo.trim();

  return useQuery({
    queryKey: ["truck", "by-plate", normalizedPlateNo],
    queryFn: () => fetchTruckByPlateNo(normalizedPlateNo),
    enabled: enabled && !!normalizedPlateNo,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
