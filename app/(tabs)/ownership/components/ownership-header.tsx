import React from "react";
import type { StyleProp, TextStyle } from "react-native";
import { Text, View } from "react-native";

type OwnershipHeaderProps = {
  title: string;
  welcomeLabel: string;
  fullName: string;
  style?: StyleProp<TextStyle>;
};

export function OwnershipHeader({
  title,
  welcomeLabel,
  fullName,
  style,
}: OwnershipHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <View className="max-w-[72%]">
        <Text className="text-xs text-slate-500" style={style}>
          {welcomeLabel}
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
