import type { SalesPerformanceItem } from "@/stores/server/dashboard/typed";

const MYANMAR_DIGITS = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];

export type ChartPoint = {
  value: number;
  label: string;
  monthlyProfit: number;
  salesMonth: string;
  totalSold: number;
};

export function toMyanmarDigits(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => MYANMAR_DIGITS[Number(digit)]);
}

export function formatProfitAxisLabel(value: number): string {
  if (value === 0) return "0k";
  const thousands = value / 1000;
  return Number.isInteger(thousands)
    ? `${thousands}k`
    : `${thousands.toFixed(1)}k`;
}

export function computeYAxisMax(maxProfit: number): number {
  if (maxProfit <= 0) return 120000;
  const step = 30000;
  return Math.ceil(maxProfit / step) * step;
}

export function buildYearOptions(
  currentYear: number,
  range = 6,
): number[] {
  return Array.from({ length: range }, (_, index) => currentYear - index);
}

export function buildMonthlyChartPoints(
  items: SalesPerformanceItem[] | undefined,
  monthLabels: string[],
  year: number,
): ChartPoint[] {
  const dataByMonth = new Map<
    number,
    Pick<ChartPoint, "monthlyProfit" | "salesMonth" | "totalSold">
  >();

  for (const item of items ?? []) {
    const match = /^(\d{4})-(\d{2})$/.exec(item.salesMonth?.trim() ?? "");
    if (!match) continue;

    const itemYear = Number(match[1]);
    const month = Number(match[2]);
    if (itemYear !== year || month < 1 || month > 12) continue;

    dataByMonth.set(month, {
      monthlyProfit: item.monthlyProfit ?? 0,
      salesMonth: item.salesMonth?.trim() ?? "",
      totalSold: item.totalSold ?? 0,
    });
  }

  return monthLabels.map((label, index) => {
    const month = index + 1;
    const monthData = dataByMonth.get(month);
    const salesMonth =
      monthData?.salesMonth ?? `${year}-${String(month).padStart(2, "0")}`;
    const monthlyProfit = monthData?.monthlyProfit ?? 0;
    const totalSold = monthData?.totalSold ?? 0;

    return {
      label,
      value: monthlyProfit,
      monthlyProfit,
      salesMonth,
      totalSold,
    };
  });
}
