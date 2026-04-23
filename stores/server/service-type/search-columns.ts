import type { BoolFilter } from "../user/search-columns";
import type { Column } from "../user/query";

export type ServiceTypeListFilters = {
  quickQuery: string;
  active: BoolFilter;
  langEng: string;
  langMy: string;
};

export type ServiceTypeAdvancedFilters = Omit<ServiceTypeListFilters, "quickQuery">;

const column = (
  data: string,
  value: string | boolean,
  type: string,
  matchCase: boolean,
): Column => ({
  data,
  search: { value, type, matchCase },
  searchable: true,
  orderable: false,
});

export function buildServiceTypeSearchColumns(
  f: ServiceTypeListFilters,
): Column[] {
  const columns: Column[] = [];

  if (f.active !== null) {
    columns.push(column("active", f.active, "eq", false));
  }

  const engAdv = f.langEng.trim();
  const quick = f.quickQuery.trim();
  if (engAdv) {
    columns.push(column("langEng", engAdv, "contains", false));
  } else if (quick) {
    columns.push(column("langEng", quick, "contains", false));
  }

  const my = f.langMy.trim();
  if (my) {
    columns.push(column("langMy", my, "contains", false));
  }

  if (columns.length === 0) {
    columns.push(column("langEng", "", "contains", false));
  }

  return columns;
}
