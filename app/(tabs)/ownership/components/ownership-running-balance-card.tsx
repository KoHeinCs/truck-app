import {
  getMyanmarLeadingClass,
  myanmarUITextStyle,
} from "@/constants/myanmar-font";
import type { AppLocale } from "@/stores/client/locale-store";
import type { OwnershipRunningBalanceItem } from "@/stores/server/ownership/typed";
import { formatAmount } from "@/utils/amountUtil";
import React, { useMemo } from "react";
import type { StyleProp, TextStyle } from "react-native";
import { Text, View } from "react-native";

type RunningBalanceLabels = {
  debit: string;
  credit: string;
  balance: string;
  currencySuffix: string;
};

type OwnershipRunningBalanceCardProps = {
  item: OwnershipRunningBalanceItem;
  locale: AppLocale;
  labels: RunningBalanceLabels;
  style?: StyleProp<TextStyle>;
};

function formatDateTime(value: string | undefined): string {
  if (!value) return "-";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return value;
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = String(parsed.getFullYear());
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function formatLocalizedAmount(
  value: number | null | undefined,
  suffix: string,
): string {
  return formatAmount(value ?? 0).replace(/\s*Ks$/, ` ${suffix}`);
}

export function OwnershipRunningBalanceCard({
  item,
  locale,
  labels,
  style,
}: OwnershipRunningBalanceCardProps) {
  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const textStyle = style ?? (locale === "mm" ? mmTextStyle : undefined);
  const mmLeading = getMyanmarLeadingClass(locale);
  const balance = item.balance ?? 0;
  const balanceClassName =
    balance < 0 ? "text-red-600" : "text-slate-900";

  return (
    <View className="rounded-2xl border border-slate-100 bg-[#fbfcfe] p-3">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text className={`text-sm font-bold text-primary ${mmLeading}`} style={textStyle}>
            {item.proposalNo || "-"}
          </Text>
          <Text className={`mt-0.5 text-xs text-slate-500 ${mmLeading}`} style={textStyle}>
            {formatDateTime(item.proposeDate)}
          </Text>
        </View>

        <View className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1">
          <Text
            className={`text-xs font-semibold uppercase text-sky-600 ${mmLeading}`}
            style={textStyle}
          >
            {item.serviceType || "-"}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row gap-2">
        <BalanceMetric
          label={labels.debit}
          value={formatLocalizedAmount(item.debit, labels.currencySuffix)}
          locale={locale}
          style={textStyle}
        />
        <BalanceMetric
          label={labels.credit}
          value={formatLocalizedAmount(item.credit, labels.currencySuffix)}
          locale={locale}
          style={textStyle}
        />
        <BalanceMetric
          label={labels.balance}
          value={formatLocalizedAmount(balance, labels.currencySuffix)}
          locale={locale}
          style={textStyle}
          valueClassName={balanceClassName}
        />
      </View>
    </View>
  );
}

type BalanceMetricProps = {
  label: string;
  value: string;
  locale: AppLocale;
  style?: StyleProp<TextStyle>;
  valueClassName?: string;
};

function BalanceMetric({
  label,
  value,
  locale,
  style,
  valueClassName = "text-slate-900",
}: BalanceMetricProps) {
  return (
    <View className="flex-1 rounded-xl border border-slate-100 bg-white p-2">
      <Text
        className={`text-[10px] text-slate-500 ${getMyanmarLeadingClass(locale)}`}
        style={style}
      >
        {label}
      </Text>
      <Text
        className={`mt-0.5 text-xs font-bold ${valueClassName} ${getMyanmarLeadingClass(locale)}`}
        style={style}
      >
        {value}
      </Text>
    </View>
  );
}
