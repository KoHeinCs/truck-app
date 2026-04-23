import { myanmarUITextStyle } from "@/constants/myanmar-font";
import type { ServiceTypeItem } from "@/stores/server/service-type/typed";
import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  item: ServiceTypeItem;
  locale: "en" | "mm";
  labels: {
    english: string;
    myanmar: string;
  };
  onPress?: () => void;
};

export function ServiceTypeCardItem({ item, locale, labels, onPress }: Props) {
  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const style = locale === "mm" ? [mmTextStyle, { lineHeight: 0 }] : undefined;
  const code = (item.serviceType ?? "").trim() || "—";
  const eng = (item.langEng ?? "").trim() || "—";
  const my = (item.langMy ?? "").trim() || "—";

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View className="mb-3 rounded-2xl bg-white px-4 py-3.5">
        <Text
          className="text-[18px] font-bold uppercase text-slate-900"
          style={style}
        >
          {code}
        </Text>
        <Text className="mt-1.5 text-sm leading-0 text-slate-600" style={style}>
          {labels.english}: {eng}
        </Text>
        <Text className="mt-1 text-sm leading-0 text-slate-600" style={style}>
          {labels.myanmar}: {my}
        </Text>
      </View>
    </Pressable>
  );
}
