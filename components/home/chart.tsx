import { APP_COLORS } from "@/constants/colors";
import {
  getMyanmarLeadingClass,
  myanmarUITextStyle,
} from "@/constants/myanmar-font";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthStore } from "@/stores/auth-store";
import { useLocaleStore } from "@/stores/client/locale-store";
import { useSalesPerformance } from "@/stores/server/dashboard/sales-performance-query";
import {
  buildMonthlyChartPoints,
  buildYearOptions,
  computeYAxisMax,
  formatProfitAxisLabel,
  toMyanmarDigits,
  type ChartPoint,
} from "@/utils/sales-performance-chart";
import { formatAmount } from "@/utils/amountUtil";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

type ChartComponentProps = {
  selectedOwnerId?: string | null;
};

type ChartFocusTooltipProps = {
  item: ChartPoint;
  locale: "en" | "mm";
  labels: {
    month: string;
    profit: string;
    totalSold: string;
  };
  textStyle: ReturnType<typeof myanmarUITextStyle> | undefined;
  mmLeading: string;
};

function ChartFocusTooltip({
  item,
  locale,
  labels,
  textStyle,
  mmLeading,
}: ChartFocusTooltipProps) {
  const formatDisplay = (value: number | string) =>
    locale === "mm" ? toMyanmarDigits(value) : String(value);

  const rows = [
    {
      key: "month",
      label: labels.month,
      value: formatDisplay(item.salesMonth),
      color: APP_COLORS.textMuted,
    },
    {
      key: "profit",
      label: labels.profit,
      value: formatDisplay(formatAmount(item.monthlyProfit)),
      color: APP_COLORS.primary,
    },
    {
      key: "totalSold",
      label: labels.totalSold,
      value: formatDisplay(item.totalSold),
      color: APP_COLORS.success,
    },
  ];

  return (
    <View
      className="rounded-lg px-3 py-2"
      style={{
        backgroundColor: "#1e293b",
        minWidth: 168,
        marginBottom: 8,
        marginLeft: -48,
      }}
    >
      {rows.map((row, index) => (
        <View
          key={row.key}
          className={`flex-row items-center justify-between gap-3 ${
            index > 0 ? "mt-1.5" : ""
          }`}
        >
          <View className="flex-row items-center gap-2">
            <View
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: row.color }}
            />
            <Text
              className={`text-[11px] text-slate-300 ${mmLeading}`}
              style={textStyle}
            >
              {row.label}
            </Text>
          </View>
          <Text
            className={`text-[11px] font-semibold text-white ${mmLeading}`}
            style={textStyle}
          >
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const ChartComponent = ({ selectedOwnerId }: ChartComponentProps) => {
  const role = useAuthStore((state) => state.role);
  const upperRole = (role || "").toUpperCase();
  const locale = useLocaleStore((state) => state.locale);
  const t = useTranslation("home");
  const { width: screenWidth } = useWindowDimensions();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

  const showChart = upperRole === "ADMIN" || upperRole === "OWNER" || upperRole === "VIEWER";
  const { data, isPending, isError } = useSalesPerformance(selectedYear, selectedOwnerId);

  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const textStyle = locale === "mm" ? mmTextStyle : undefined;
  const mmLeading = getMyanmarLeadingClass(locale);

  const monthLabels = useMemo(
    () => [
      t.months.jan,
      t.months.feb,
      t.months.mar,
      t.months.apr,
      t.months.may,
      t.months.jun,
      t.months.jul,
      t.months.aug,
      t.months.sep,
      t.months.oct,
      t.months.nov,
      t.months.dec,
    ],
    [t],
  );

  const chartPoints = useMemo(
    () => buildMonthlyChartPoints(data?.data, monthLabels, selectedYear),
    [data?.data, monthLabels, selectedYear],
  );

  const maxProfit = useMemo(
    () => Math.max(...chartPoints.map((point) => point.value), 0),
    [chartPoints],
  );

  const yAxisMax = useMemo(() => computeYAxisMax(maxProfit), [maxProfit]);
  const chartWidth = screenWidth - 64;
  const yearOptions = useMemo(() => buildYearOptions(currentYear), [currentYear]);
  const displayYear = locale === "mm" ? toMyanmarDigits(selectedYear) : String(selectedYear);

  const tooltipLabels = useMemo(
    () => ({
      month: t.chartMonthLabel,
      profit: t.chartProfitLabel,
      totalSold: t.chartTotalSoldLabel,
    }),
    [t.chartMonthLabel, t.chartProfitLabel, t.chartTotalSoldLabel],
  );

  const renderFocusTooltip = useCallback(
    (item: ChartPoint) => (
      <ChartFocusTooltip
        item={item}
        locale={locale}
        labels={tooltipLabels}
        textStyle={textStyle}
        mmLeading={mmLeading}
      />
    ),
    [locale, mmLeading, textStyle, tooltipLabels],
  );

  if (!showChart) {
    return null;
  }

  const hasData = (data?.data?.length ?? 0) > 0;

  return (
    <View
      className="rounded-2xl p-4"
      style={{
        backgroundColor: APP_COLORS.card,
        borderColor: APP_COLORS.border,
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className={`flex-1 text-base font-bold text-slate-900 ${mmLeading}`}
          style={textStyle}
        >
          {t.monthlyProfitTitle}
        </Text>
        <Pressable
          onPress={() => setYearPickerVisible(true)}
          className="rounded-full px-3 py-1"
          style={{ backgroundColor: APP_COLORS.inputBackground }}
        >
          <Text
            className={`text-xs font-semibold text-slate-600 ${mmLeading}`}
            style={textStyle}
          >
            {displayYear}
          </Text>
        </Pressable>
      </View>

      <View className="mt-4 items-center justify-center" style={{ minHeight: 200 }}>
        {isPending ? (
          <ActivityIndicator color={APP_COLORS.primary} size="large" />
        ) : isError ? (
          <Text
            className={`text-sm text-slate-500 ${mmLeading}`}
            style={textStyle}
          >
            {t.error}
          </Text>
        ) : !hasData ? (
          <Text
            className={`text-sm text-slate-500 ${mmLeading}`}
            style={textStyle}
          >
            {t.empty}
          </Text>
        ) : (
          <LineChart
            data={chartPoints}
            areaChart
            curved
            hideDataPoints
            focusEnabled
            showDataPointOnFocus
            showStripOnFocus
            showDataPointLabelOnFocus
            stripColor={APP_COLORS.primary}
            stripWidth={1}
            focusedDataPointColor={APP_COLORS.primary}
            focusedDataPointRadius={5}
            focusedDataPointLabelComponent={renderFocusTooltip}
            maxValue={yAxisMax}
            noOfSections={4}
            width={chartWidth}
            height={180}
            color={APP_COLORS.primary}
            thickness={2.5}
            startFillColor={APP_COLORS.primary}
            endFillColor={APP_COLORS.card}
            startOpacity={0.25}
            endOpacity={0.02}
            rulesColor="#E8EAED"
            rulesType="dashed"
            yAxisColor="transparent"
            xAxisColor="transparent"
            yAxisTextStyle={{ color: APP_COLORS.textMuted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: APP_COLORS.textMuted, fontSize: 10 }}
            formatYLabel={(label) => formatProfitAxisLabel(Number(label))}
            spacing={Math.max((chartWidth - 50) / 11, 18)}
            initialSpacing={8}
            endSpacing={8}
            disableScroll
          />
        )}
      </View>

      <Modal
        visible={yearPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setYearPickerVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
          onPress={() => setYearPickerVisible(false)}
        >
          <Pressable
            className="w-full max-w-[280px] rounded-2xl p-4"
            style={{
              backgroundColor: APP_COLORS.card,
              borderColor: APP_COLORS.border,
              borderWidth: 1,
            }}
            onPress={(event) => event.stopPropagation()}
          >
            <Text
              className={`text-sm font-bold text-slate-900 ${mmLeading}`}
              style={textStyle}
            >
              {t.selectYear}
            </Text>
            <ScrollView className="mt-3 max-h-56">
              {yearOptions.map((year) => {
                const isSelected = year === selectedYear;
                const label =locale === "mm" ? toMyanmarDigits(year) : String(year);

                return (
                  <Pressable
                    key={year}
                    onPress={() => {
                      setSelectedYear(year);
                      setYearPickerVisible(false);
                    }}
                    className="rounded-xl px-3 py-3"
                    style={{
                      backgroundColor: isSelected
                        ? APP_COLORS.primarySoft
                        : "transparent",
                    }}
                  >
                    <Text
                      className={`text-sm font-semibold ${mmLeading} ${
                        isSelected ? "text-primary" : "text-slate-700"
                      }`}
                      style={textStyle}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ChartComponent;
