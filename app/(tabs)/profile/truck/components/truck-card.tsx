import { myanmarUITextStyle } from "@/constants/myanmar-font";
import type { TruckItem } from "@/stores/server/truck/typed";
import { Card } from "heroui-native";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

type TruckCardProps = {
  item: TruckItem;
  locale: "en" | "mm";
  labels: {
    fuelType: string;
    frontTire: string;
  };
};

function getTitle(model: string, year: string | number): string {
  const modelText = String(model ?? "").trim();
  const yearText = String(year ?? "").trim();
  if (modelText && yearText) return `${modelText} (${yearText})`;
  return modelText || yearText || "-";
}

export function TruckCardItem({ item, locale, labels }: TruckCardProps) {
  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const style = locale === "mm" ? mmTextStyle : undefined;

  const title = getTitle(item.model, item.modelYear);
  const plate = String(item.plateNo ?? "").trim() || "-";
  const fuel = String(item.fuelType ?? "").trim() || "-";
  const tire = String(item.frontTireSize ?? "").trim() || "-";

  return (
    <Card className="mb-3">
      <Card.Body className="px-4 py-4">
        <Text className="text-[18px] font-bold text-slate-900" style={style}>
          {title}
        </Text>
        <Text className="mt-1 text-sm text-slate-500" style={style}>
          {plate}
        </Text>

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-xs text-slate-500" style={style}>
            {labels.fuelType}: <Text className="text-slate-800">{fuel}</Text>
          </Text>
          <Text className="text-xs text-slate-500" style={style}>
            {labels.frontTire}: <Text className="text-slate-800">{tire}</Text>
          </Text>
        </View>
      </Card.Body>
    </Card>
  );
}
