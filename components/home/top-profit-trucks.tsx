import { APP_COLORS } from "@/constants/colors";
import {
  getMyanmarLeadingClass,
  myanmarUITextStyle,
} from "@/constants/myanmar-font";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthStore } from "@/stores/auth-store";
import { useLocaleStore } from "@/stores/client/locale-store";
import { useTruckStats } from "@/stores/server/dashboard/truck-stats-query";
import type { TopProfitTruck } from "@/stores/server/dashboard/typed";
import { formatAmount } from "@/utils/amountUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";

function formatProfitAmount(value: number): string {
  return formatAmount(value).replace(/\s*Ks$/, "");
}

type TopProfitTruckRowProps = {
  truck: TopProfitTruck;
  rank: number;
  profitLabel: string;
  textStyle: ReturnType<typeof myanmarUITextStyle> | undefined;
  mmLeading: string;
};

function TopProfitTruckRow({
  truck,
  rank,
  profitLabel,
  textStyle,
  mmLeading,
}: TopProfitTruckRowProps) {
  const equipmentName = truck.equipmentName?.trim() || "-";
  const plateNo = truck.truckPlateNo?.trim() || "-";

  return (
    <View
      className="flex-row items-center gap-3 rounded-xl px-3 py-3"
      style={{
        borderColor: APP_COLORS.border,
        borderWidth: 1,
        backgroundColor: APP_COLORS.card,
      }}
    >
      <View
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: APP_COLORS.inputBackground }}
      >
        <Text
          className={`text-sm font-bold text-slate-600 ${mmLeading}`}
          style={textStyle}
        >
          {rank}
        </Text>
      </View>

      <View className="flex-1">
        <Text
          className={`text-sm font-bold text-slate-900 ${mmLeading}`}
          style={textStyle}
        >
          {equipmentName}
        </Text>
        <Text
          className={`mt-0.5 text-xs text-slate-500 ${mmLeading}`}
          style={textStyle}
        >
          {plateNo}
        </Text>
      </View>

      <View className="items-end">
        <Text
          className="text-sm font-bold"
          style={[textStyle, { color: APP_COLORS.success }]}
        >
          {formatProfitAmount(truck.profit)}
        </Text>
        <Text
          className={`mt-0.5 text-[10px] text-slate-500 ${mmLeading}`}
          style={textStyle}
        >
          {profitLabel}
        </Text>
      </View>
    </View>
  );
}

type TopProfitTrucksProps = {
  selectedOwnerId?: string | null;
};

const TopProfitTrucks = ({ selectedOwnerId }: TopProfitTrucksProps) => {
  const role = useAuthStore((state) => state.role);
  const upperRole = (role || "").toUpperCase();
  const locale = useLocaleStore((state) => state.locale);
  const t = useTranslation("home");
  const { data, isPending, isError } = useTruckStats(selectedOwnerId);

  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const textStyle = locale === "mm" ? mmTextStyle : undefined;
  const mmLeading = getMyanmarLeadingClass(locale);

  const showSection = upperRole === "ADMIN" || upperRole === "OWNER" || upperRole === "VIEWER";
  const trucks = data?.data?.topProfitTrucks ?? [];

  if (!showSection) {
    return null;
  }

  return (
    <View
      className="rounded-2xl p-4"
      style={{
        backgroundColor: APP_COLORS.card,
        borderColor: APP_COLORS.border,
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-center gap-2">
        <Ionicons name="trending-up" size={18} color={APP_COLORS.success} />
        <Text
          className={`flex-1 text-base font-bold text-slate-900 ${mmLeading}`}
          style={textStyle}
        >
          {t.topProfitTrucksTitle}
        </Text>
      </View>

      <View className="mt-4 gap-3">
        {isPending ? (
          <View className="items-center py-6">
            <ActivityIndicator color={APP_COLORS.primary} size="small" />
          </View>
        ) : isError ? (
          <Text
            className={`text-center text-sm text-slate-500 ${mmLeading}`}
            style={textStyle}
          >
            {t.error}
          </Text>
        ) : trucks.length === 0 ? (
          <Text
            className={`text-center text-sm text-slate-500 ${mmLeading}`}
            style={textStyle}
          >
            {t.empty}
          </Text>
        ) : (
          trucks.map((truck, index) => (
            <TopProfitTruckRow
              key={truck.id}
              truck={truck}
              rank={index + 1}
              profitLabel={t.profitLabel}
              textStyle={textStyle}
              mmLeading={mmLeading}
            />
          ))
        )}
      </View>
    </View>
  );
};

export default TopProfitTrucks;
