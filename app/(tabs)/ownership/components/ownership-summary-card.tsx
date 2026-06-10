import { APP_COLORS } from "@/constants/colors";
import {
  getMyanmarLeadingClass,
  myanmarUITextStyle,
} from "@/constants/myanmar-font";
import type { AppLocale } from "@/stores/client/locale-store";
import type { OwnershipItem } from "@/stores/server/ownership/typed";
import { formatAmount } from "@/utils/amountUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo } from "react";
import type { StyleProp, TextStyle } from "react-native";
import { Text, View } from "react-native";

type OwnershipSummaryLabels = {
  profitLoss: string;
  totalCost: string;
  totalIncome: string;
  notes: string;
  currencySuffix: string;
};

type OwnershipSummaryCardProps = {
  item: OwnershipItem | null | undefined;
  locale: AppLocale;
  labels: OwnershipSummaryLabels;
  style?: StyleProp<TextStyle>;
};

function formatLocalizedAmount(
  value: number | null | undefined,
  suffix: string,
): string {
  return formatAmount(value ?? 0).replace(/\s*Ks$/, ` ${suffix}`);
}

function valueText(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export function OwnershipSummaryCard({
  item,
  locale,
  labels,
  style,
}: OwnershipSummaryCardProps) {
  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const textStyle = style ?? (locale === "mm" ? mmTextStyle : undefined);
  const mmLeading = getMyanmarLeadingClass(locale);

  const title = valueText(item?.equipmentName);
  const licenseCity = valueText(item?.licenseCity);
  const plateNo = valueText(item?.truckPlateNo);
  const profit = item?.profit ?? 0;
  const profitClassName =
    profit < 0 ? "text-red-600" : "text-slate-900";

  return (
    <View
      className="mt-1 rounded-2xl p-4"
      style={{
        backgroundColor: APP_COLORS.card,
        borderColor: APP_COLORS.border,
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text
            className={`text-xl font-bold text-slate-900 ${mmLeading}`}
            style={textStyle}
          >
            {title}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="location-outline" size={14} color="#64748b" />
            <Text className={`text-sm text-slate-500 ${mmLeading}`} style={textStyle}>
              {licenseCity} • {plateNo}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className={`text-[10px] text-slate-500 ${mmLeading}`} style={textStyle}>
            {labels.profitLoss}
          </Text>
          <Text
            className={`mt-0.5 text-base font-bold ${profitClassName} ${mmLeading}`}
            style={textStyle}
          >
            {formatLocalizedAmount(profit, labels.currencySuffix)}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row gap-3 border-t border-slate-100 pt-3">
        <SummaryMetric
          label={labels.totalCost}
          value={formatLocalizedAmount(item?.totalCost, labels.currencySuffix)}
          locale={locale}
          style={textStyle}
        />
        <SummaryMetric
          label={labels.totalIncome}
          value={formatLocalizedAmount(item?.totalIncome, labels.currencySuffix)}
          locale={locale}
          style={textStyle}
        />
      </View>

      <View className="mt-3 rounded-xl border border-slate-100 bg-[#f8fafc] p-3">
        <Text className={`text-[10px] text-slate-500 ${mmLeading}`} style={textStyle}>
          {labels.notes}
        </Text>
        <Text
          className={`mt-1 text-sm text-slate-700 ${mmLeading}`}
          style={textStyle}
        >
          {valueText(item?.notes)}
        </Text>
      </View>
    </View>
  );
}

type SummaryMetricProps = {
  label: string;
  value: string;
  locale: AppLocale;
  style?: StyleProp<TextStyle>;
};

function SummaryMetric({ label, value, locale, style }: SummaryMetricProps) {
  return (
    <View className="flex-1">
      <Text className={`text-[10px] text-slate-500 ${getMyanmarLeadingClass(locale)}`} style={style}>
        {label}
      </Text>
      <Text
        className={`mt-0.5 text-sm font-bold text-slate-900 ${getMyanmarLeadingClass(locale)}`}
        style={style}
      >
        {value}
      </Text>
    </View>
  );
}
