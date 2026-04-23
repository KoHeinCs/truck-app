import type { Column } from "../user/query";

export type TruckListFilters = {
  quickQuery: string;
  plateNo: string;
  model: string;
  modelYear: string;
  engineNo: string;
  chassisNo: string;
};

export type TruckAdvancedFilters = Omit<TruckListFilters, "quickQuery">;

const column = (data: string, value: string, type: string, matchCase: boolean): Column => ({
  data,
  search: { value, type, matchCase },
  searchable: true,
  orderable: false,
});

export function buildTruckSearchColumns(f: TruckListFilters): Column[] {
  const columns: Column[] = [];
  const quick = f.quickQuery.trim();
  const plateNo = f.plateNo.trim();

  if (plateNo) {
    columns.push(column("plateNo", plateNo, "eq", true));
  } else if (quick) {
    columns.push(column("plateNo", quick, "contains", false));
  } else {
    columns.push(column("plateNo", "", "contains", false));
  }

  const model = f.model.trim();
  if (model) {
    columns.push(column("model", model, "eq", false));
  }

  const modelYear = f.modelYear.trim();
  if (modelYear) {
    columns.push(column("modelYear", modelYear, "eq", false));
  }

  const engineNo = f.engineNo.trim();
  if (engineNo) {
    columns.push(column("engineNo", engineNo, "eq", false));
  }

  const chassisNo = f.chassisNo.trim();
  if (chassisNo) {
    columns.push(column("chassisNo", chassisNo, "eq", false));
  }

  return columns;
}
