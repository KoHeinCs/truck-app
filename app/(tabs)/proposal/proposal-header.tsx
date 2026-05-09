import type { AppLocale } from "@/stores/client/locale-store";
import React from "react";
import type { StyleProp, TextStyle } from "react-native";
import { Text, View } from "react-native";

type ProposalHeaderProps = {
  title: string;
  fullName: string;
  locale: AppLocale;
  style?: StyleProp<TextStyle>;
};

export function ProposalHeader({
  title,
  fullName,
  locale,
  style,
}: ProposalHeaderProps) {
  const label = locale === "mm" ? "မင်္ဂလာပါ" : "Welcome";

  return (
    <View className="mb-3 flex-row items-center justify-between">
      <View className="max-w-[72%]">
        <Text className="text-xs text-slate-500" style={style}>
          {label}
        </Text>
        <Text className="mt-1 text-[18px] font-semibold text-slate-900" style={style}>
          {fullName}
        </Text>
      </View>

      <Text className="text-[20px] font-bold text-[#3b4f6b]" style={style}>
        {title}
      </Text>
    </View>
  );
}
