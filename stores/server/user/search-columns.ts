import type { Column } from "./query";

export type BoolFilter = boolean | null;

export type TeamListFilters = {
  quickQuery: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  email: string;
  isActive: BoolFilter;
  isNotLocked: BoolFilter;
};

export type TeamAdvancedFilters = Omit<TeamListFilters, "quickQuery">;

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

export function teamListFiltersKey(f: TeamListFilters): string {
  return JSON.stringify({
    quickQuery: f.quickQuery.trim(),
    fullName: f.fullName.trim(),
    phoneNumber: f.phoneNumber.trim(),
    role: f.role.trim(),
    email: f.email.trim(),
    isActive: f.isActive,
    isNotLocked: f.isNotLocked,
  });
}

export function buildUserSearchColumns(f: TeamListFilters): Column[] {
  const columns: Column[] = [];
  const quick = f.quickQuery.trim();
  const name = f.fullName.trim();

  if (name) {
    columns.push(column("fullName", name, "contains", false));
  } else if (quick) {
    columns.push(column("fullName", quick, "contains", false));
  } else {
    columns.push(column("fullName", "", "contains", false));
  }

  const phone = f.phoneNumber.trim();
  if (phone) columns.push(column("phoneNumber", phone, "contains", true));

  const role = f.role.trim();
  if (role) columns.push(column("role", role, "eq", false));

  const email = f.email.trim();
  if (email) columns.push(column("email", email, "eq", false));

  if (f.isActive !== null) {
    columns.push(column("isActive", f.isActive, "eq", true));
  }

  if (f.isNotLocked !== null) {
    columns.push(column("isNotLocked", f.isNotLocked, "eq", true));
  }

  return columns;
}

