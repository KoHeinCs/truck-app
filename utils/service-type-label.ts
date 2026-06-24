import type { AppLocale } from "@/stores/client/locale-store";
import type { ServiceTypeItem } from "@/stores/server/service-type/typed";

export function getServiceTypeLabel(
  item: ServiceTypeItem,
  locale: AppLocale,
): string {
  return locale === "mm" ? item.langMy || item.langEng : item.langEng;
}

export function resolveServiceTypeLabel(
  code: string,
  lookup: Map<string, ServiceTypeItem>,
  locale: AppLocale,
): string {
  const item = lookup.get(code);
  if (!item) return code || "-";
  return getServiceTypeLabel(item, locale);
}

export function getSelectedServiceType(
  value: string,
  options: ServiceTypeItem[],
  locale: AppLocale,
) {
  const option = options.find((item) => item.serviceType === value);
  if (!option) return undefined;
  return {
    value: option.serviceType,
    label: getServiceTypeLabel(option, locale),
  };
}
