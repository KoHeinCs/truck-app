import { myanmarUITextStyle } from "@/constants/myanmar-font";
import type { AppLocale } from "@/stores/client/locale-store";
import type { OwnershipItem } from "@/stores/server/ownership/typed";
import { Card } from "heroui-native";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

type OwnershipCardLabels = {
  licenseStartDate: string;
  licenseEndDate: string;
  balance: string;
  licenseCity: string;
  profit: string;
  monthSuffix: string;
};

type OwnershipCardProps = {
  item: OwnershipItem;
  locale: AppLocale;
  labels: OwnershipCardLabels;
};

function valueText(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatDate(value: string | undefined): string {
  if (!value) return "-";
  const raw = value.includes("T") ? value.split("T")[0] : value.split(" ")[0];
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (!match) return value;
  const [, yyyy, mm, dd] = match;
  return `${dd}/${mm}/${yyyy}`;
}

function formatNumber(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function OwnershipCard({ item, locale, labels }: OwnershipCardProps) {
  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const style = locale === "mm" ? mmTextStyle : undefined;

  const truck = item.truck;
  const modelYear = valueText(item.modelYear ?? truck?.modelYear);
  const model = valueText(item.model ?? truck?.model);
  const title = [modelYear, model].filter((part) => part !== "-").join(" ") || "-";
  const plateNo = valueText(item.plateNo ?? truck?.plateNo);
  const balance = formatNumber(item.balance);
  const profit = formatNumber(item.profit);

  return (
    <Card className="mb-3">
      <Card.Body className="px-4 py-4">
        <View className="flex-row justify-between gap-3">
          <View className="flex-1">
            <Text className="text-[16px] font-bold text-slate-900" style={style}>
              {title}
            </Text>
            <Text className="mt-1 text-xs font-semibold text-blue-500">
              {plateNo}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-[10px] text-slate-500" style={style}>
              {item.truckStatus || "-"}
            </Text>
            <Text className="text-sm font-bold text-slate-900" style={style}>
              {balance} {labels.monthSuffix}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row">
          <InfoCell
            label={labels.licenseStartDate}
            value={formatDate(item.licenseStartDate)}
            style={style}
          />
          <InfoCell
            label={labels.licenseEndDate}
            value={formatDate(item.licenseEndDate)}
            style={style}
          />
          <InfoCell
            label={labels.balance}
            value={`${balance} ${labels.monthSuffix}`}
            valueClassName="text-emerald-500"
            style={style}
          />
        </View>

        <View className="mt-3 border-t border-slate-100 pt-3">
          <View className="flex-row">
            <InfoCell
              label={labels.licenseCity}
              value={valueText(item.licenseCity)}
              style={style}
            />
            <InfoCell
              label={labels.profit}
              value={profit}
              className="flex-[2]"
              style={style}
            />
          </View>
        </View>
      </Card.Body>
    </Card>
  );
}

type InfoCellProps = {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
  style?: ReturnType<typeof myanmarUITextStyle>;
};

function InfoCell({
  label,
  value,
  className = "flex-1",
  valueClassName = "text-slate-900",
  style,
}: InfoCellProps) {
  return (
    <View className={className}>
      <Text className="text-[10px] text-slate-500" style={style}>
        {label}
      </Text>
      <Text className={`mt-0.5 text-xs font-semibold ${valueClassName}`} style={style}>
        {value}
      </Text>
    </View>
  );
}
