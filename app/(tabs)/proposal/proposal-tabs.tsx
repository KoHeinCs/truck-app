import { APP_COLORS } from "@/constants/colors";
import type { AppLocale } from "@/stores/client/locale-store";
import type { ProposalTabStatus } from "@/stores/server/proposal/search-columns";
import React from "react";
import type { StyleProp, TextStyle } from "react-native";
import { Pressable, Text, View } from "react-native";

type ProposalTabsProps = {
  value: ProposalTabStatus;
  onChange: (next: ProposalTabStatus) => void;
  tabs: ProposalTabStatus[];
  locale: AppLocale;
  style?: StyleProp<TextStyle>;
};

const MM_LABELS: Record<ProposalTabStatus, string> = {
  INFORM: "စောင့်ဆိုင်းဆဲ",
  APPROVED: "အတည်ပြု",
  TERMINATED: "ပယ်ဖျက်",
};

const EN_LABELS: Record<ProposalTabStatus, string> = {
  INFORM: "Pending",
  APPROVED: "Approved",
  TERMINATED: "Cancelled",
};

export function ProposalTabs({
  value,
  onChange,
  tabs,
  locale,
  style,
}: ProposalTabsProps) {
  const labels = locale === "mm" ? MM_LABELS : EN_LABELS;

  return (
    <View className="mb-3 flex-row rounded-2xl border border-slate-200 bg-white p-1">
      {tabs.map((tab) => {
        const active = tab === value;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            className="flex-1 items-center rounded-xl px-1 py-2.5"
            style={active ? { backgroundColor: APP_COLORS.primary } : undefined}
          >
            <Text
              className={`text-sm font-semibold ${active ? "text-white" : "text-slate-500"}`}
              style={style}
              numberOfLines={1}
            >
              {labels[tab]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
