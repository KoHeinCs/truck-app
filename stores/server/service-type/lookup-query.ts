import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { AppLocale } from "@/stores/client/locale-store";
import {
  getServiceTypeLabel,
  resolveServiceTypeLabel as resolveLabel,
} from "@/utils/service-type-label";
import { axios } from "../api";
import { buildServiceTypeSearchColumns } from "./search-columns";
import type { ServiceTypeItem, ServiceTypeListResponse } from "./typed";

const SERVICE_TYPE_LOOKUP_PAGE_SIZE = 100;
const SERVICE_TYPE_LOOKUP_STALE_TIME = 5 * 60 * 1000;

const lookupColumns = buildServiceTypeSearchColumns({
  quickQuery: "",
  active: true,
  langEng: "",
  langMy: "",
});

const fetchServiceTypeLookup = async (): Promise<ServiceTypeItem[]> => {
  const { data } = await axios.post<ServiceTypeListResponse>(
    "/service-type/search",
    {
      page: 1,
      pageSize: SERVICE_TYPE_LOOKUP_PAGE_SIZE,
      columns: lookupColumns,
    },
  );

  return data?.data?.data ?? [];
};

const toServiceTypeByCode = (
  items: ServiceTypeItem[],
): Map<string, ServiceTypeItem> => {
  const map = new Map<string, ServiceTypeItem>();
  for (const item of items) {
    const code = String(item.serviceType ?? "").trim();
    if (code && !map.has(code)) {
      map.set(code, item);
    }
  }
  return map;
};

export function useServiceTypeLookup() {
  const query = useQuery({
    queryKey: ["service-type-lookup"],
    queryFn: fetchServiceTypeLookup,
    staleTime: SERVICE_TYPE_LOOKUP_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const serviceTypes = query.data ?? [];

  const serviceTypeByCode = useMemo(
    () => toServiceTypeByCode(serviceTypes),
    [serviceTypes],
  );

  const resolveServiceTypeLabel = useCallback(
    (code: string, locale: AppLocale) =>
      resolveLabel(code, serviceTypeByCode, locale),
    [serviceTypeByCode],
  );

  return {
    ...query,
    serviceTypes,
    serviceTypeByCode,
    getServiceTypeLabel: (item: ServiceTypeItem, locale: AppLocale) =>
      getServiceTypeLabel(item, locale),
    resolveServiceTypeLabel,
  };
}
