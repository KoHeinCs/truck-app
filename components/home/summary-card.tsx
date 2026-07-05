import { APP_COLORS } from "@/constants/colors";
import {
  getMyanmarLeadingClass,
  myanmarUITextStyle,
} from "@/constants/myanmar-font";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthStore } from "@/stores/auth-store";
import { useLocaleStore } from "@/stores/client/locale-store";
import { useProposalStats } from "@/stores/server/dashboard/proposal-stats-query";
import { useTruckStats } from "@/stores/server/dashboard/truck-stats-query";
import { toMyanmarDigits } from "@/utils/sales-performance-chart";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo } from "react";
import type { StyleProp, TextStyle } from "react-native";
import { ActivityIndicator, Text, View } from "react-native";

type SummaryCardTheme = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  decorColor: string;
};

type SummaryCardItemProps = {
  label: string;
  value: number;
  theme: SummaryCardTheme;
  textStyle?: StyleProp<TextStyle>;
  mmLeading: string;
  displayValue: string;
};

function SummaryCardItem({
  label,
  theme,
  textStyle,
  mmLeading,
  displayValue,
}: SummaryCardItemProps) {
  return (
    <View
      className="relative min-h-[108px] flex-1 overflow-hidden rounded-2xl p-3"
      style={{
        backgroundColor: APP_COLORS.card,
        borderColor: APP_COLORS.border,
        borderWidth: 1,
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full"
        style={{ backgroundColor: theme.decorColor }}
      />

      <View className="flex-row items-center gap-2">
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.iconBg }}
        >
          <Ionicons name={theme.icon} size={16} color={theme.iconColor} />
        </View>
        <Text
          className={`flex-1 text-xs font-semibold text-slate-600 ${mmLeading}`}
          style={textStyle}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>

      <Text
        className={`mt-3 text-2xl font-bold text-slate-900 ${mmLeading}`}
        style={textStyle}
      >
        {displayValue}
      </Text>
    </View>
  );
}

type SummaryCardProps = {
  selectedOwnerId?: string | null;
};

const SummaryCard = ({ selectedOwnerId }: SummaryCardProps) => {
  const role = useAuthStore((state) => state.role);
  const upperRole = (role || "").toUpperCase();
  const locale = useLocaleStore((state) => state.locale);
  const t = useTranslation("home");
  const {
    data: truckData,
    isPending: isTruckPending,
    isError: isTruckError,
  } = useTruckStats(selectedOwnerId);
  const {
    data: proposalData,
    isPending: isProposalPending,
    isError: isProposalError,
  } = useProposalStats(selectedOwnerId);

  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const textStyle = locale === "mm" ? mmTextStyle : undefined;
  const mmLeading = getMyanmarLeadingClass(locale);

  const showSection = upperRole === "ADMIN" || upperRole === "OWNER" || upperRole === "VIEWER";
  const isPending = isTruckPending || isProposalPending;
  const isError = isTruckError || isProposalError;

  const formatCount = (value: number) =>
    locale === "mm" ? toMyanmarDigits(value) : String(value);

  const cards = useMemo(
    () => [
      {
        key: "active",
        label: t.summary.activeTrucks,
        value: truckData?.data?.totalActiveTrucks ?? 0,
        theme: {
          icon: "bus-outline" as const,
          iconBg: APP_COLORS.primarySoft,
          iconColor: APP_COLORS.primary,
          decorColor: "rgba(90, 128, 171, 0.14)",
        },
      },
      {
        key: "sold",
        label: t.summary.soldTrucks,
        value: truckData?.data?.totalSoldTrucks ?? 0,
        theme: {
          icon: "checkmark-circle-outline" as const,
          iconBg: APP_COLORS.successSoft,
          iconColor: APP_COLORS.success,
          decorColor: "rgba(16, 163, 127, 0.14)",
        },
      },
      {
        key: "total",
        label: t.summary.totalTrucks,
        value: truckData?.data?.totalTrucks ?? 0,
        theme: {
          icon: "car-sport-outline" as const,
          iconBg: "#f3e8ff",
          iconColor: "#9333ea",
          decorColor: "rgba(147, 51, 234, 0.14)",
        },
      },
      {
        key: "inform",
        label: t.summary.informTasks,
        value: proposalData?.data?.totalInformTasks ?? 0,
        theme: {
          icon: "alert-circle-outline" as const,
          iconBg: APP_COLORS.warningSoft,
          iconColor: APP_COLORS.warning,
          decorColor: "rgba(223, 138, 20, 0.14)",
        },
      },
    ],
    [proposalData?.data?.totalInformTasks, truckData?.data, t.summary],
  );

  if (!showSection) {
    return null;
  }

  return (
    <View className="gap-3">
      {isPending ? (
        <View className="items-center py-8">
          <ActivityIndicator color={APP_COLORS.primary} size="small" />
        </View>
      ) : isError ? (
        <View
          className="rounded-2xl px-4 py-6"
          style={{
            backgroundColor: APP_COLORS.card,
            borderColor: APP_COLORS.border,
            borderWidth: 1,
          }}
        >
          <Text
            className={`text-center text-sm text-slate-500 ${mmLeading}`}
            style={textStyle}
          >
            {t.error}
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-row gap-3">
            {cards.slice(0, 2).map((card) => (
              <SummaryCardItem
                key={card.key}
                label={card.label}
                value={card.value}
                theme={card.theme}
                textStyle={textStyle}
                mmLeading={mmLeading}
                displayValue={formatCount(card.value)}
              />
            ))}
          </View>
          <View className="flex-row gap-3">
            {cards.slice(2, 4).map((card) => (
              <SummaryCardItem
                key={card.key}
                label={card.label}
                value={card.value}
                theme={card.theme}
                textStyle={textStyle}
                mmLeading={mmLeading}
                displayValue={formatCount(card.value)}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
};

export default SummaryCard;
