import { getMyanmarLeadingClass } from "@/constants/myanmar-font";
import type { AppLocale } from "@/stores/client/locale-store";
import React from "react";
import { Text, View } from "react-native";

type ProposalHeaderProps = {
  title: string;
  welcomeLabel: string;
  fullName: string;
  locale: AppLocale;
};

export function ProposalHeader({
  title,
  welcomeLabel,
  fullName,
  locale,
}: ProposalHeaderProps) {
  const mmLeading = getMyanmarLeadingClass(locale);

  return (
    <View className="mb-3 flex-row items-center justify-between">
      <View className="max-w-[72%]">
        <Text className={`text-xs text-slate-500 ${mmLeading}`}>
          {welcomeLabel}
        </Text>
        <Text className={`mt-1 text-[18px] font-semibold text-slate-900 ${mmLeading}`}>
          {fullName}
        </Text>
      </View>

      <Text className={`text-sm font-bold text-[#3b4f6b] ${mmLeading}`}>
        {title}
      </Text>
    </View>
  );
}
