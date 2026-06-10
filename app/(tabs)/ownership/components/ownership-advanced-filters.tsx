import { CompactTextInput } from "@/components/compact-text-input";
import { APP_COLORS } from "@/constants/colors";
import { COMPACT_ADVANCED_INPUT_CLASSNAME } from "@/constants/compact-input";
import type { AppLocale } from "@/stores/client/locale-store";
import type { OwnershipAdvancedFilters as OwnershipAdvancedFilterValues } from "@/stores/server/ownership/search-columns";
import { Card } from "heroui-native";
import React from "react";
import type { StyleProp, TextStyle } from "react-native";
import { Pressable, Text, View } from "react-native";

type OwnershipAdvancedLabels = {
  title: string;
  plateNo: string;
  licenseCity: string;
  licenseEndDate: string;
  profit: string;
  ownerIdCsv: string;
  datePlaceholder: string;
  reset: string;
  apply: string;
};

type OwnershipAdvancedFiltersProps = {
  filters: OwnershipAdvancedFilterValues;
  labels: OwnershipAdvancedLabels;
  locale: AppLocale;
  style?: StyleProp<TextStyle>;
  showOwnerId: boolean;
  onChange: (next: Partial<OwnershipAdvancedFilterValues>) => void;
  onReset: () => void;
  onApply: () => void;
};

export function OwnershipAdvancedFilters({
  filters,
  labels,
  locale,
  style,
  showOwnerId,
  onChange,
  onReset,
  onApply,
}: OwnershipAdvancedFiltersProps) {
  return (
    <Card className="mb-4 p-5">
      <Card.Body className="gap-3">
        <Text className="text-sm font-semibold text-slate-900" style={style}>
          {labels.title}
        </Text>

        <View className="flex-row gap-2">
          <FilterInput
            label={labels.plateNo}
            value={filters.plateNo}
            placeholder="2L-2222"
            locale={locale}
            style={style}
            onChangeText={(plateNo) => onChange({ plateNo })}
          />
          <FilterInput
            label={labels.licenseCity}
            value={filters.licenseCity}
            placeholder="Yangon"
            locale={locale}
            style={style}
            onChangeText={(licenseCity) => onChange({ licenseCity })}
          />
        </View>

        <View className="flex-row gap-2">
          <FilterInput
            label={labels.licenseEndDate}
            value={filters.licenseEndDate}
            placeholder={labels.datePlaceholder}
            locale={locale}
            style={style}
            onChangeText={(licenseEndDate) => onChange({ licenseEndDate })}
          />
          <FilterInput
            label={labels.profit}
            value={filters.profit}
            placeholder="5000000"
            keyboardType="number-pad"
            locale={locale}
            style={style}
            onChangeText={(profit) => onChange({ profit })}
          />
        </View>

        {showOwnerId ? (
          <View className="gap-1">
            <Text className="text-[10px] text-slate-500" style={style}>
              {labels.ownerIdCsv}
            </Text>
            <CompactTextInput
              locale={locale}
              compactVariant="advanced"
              value={filters.ownerIdCsv}
              onChangeText={(ownerIdCsv) => onChange({ ownerIdCsv })}
              placeholder="owner-id, null"
              className={`border border-slate-200 bg-white ${COMPACT_ADVANCED_INPUT_CLASSNAME}`}
            />
          </View>
        ) : null}

        <View className="flex-row gap-2 pt-0.5">
          <Pressable
            onPress={onReset}
            className="flex-1 items-center justify-center rounded-xl bg-slate-100 py-3"
          >
            <Text className="text-xs font-semibold text-slate-700" style={style}>
              {labels.reset}
            </Text>
          </Pressable>

          <Pressable
            className="flex-1 items-center justify-center rounded-xl py-3"
            style={{ backgroundColor: APP_COLORS.primary }}
            onPress={onApply}
          >
            <Text className="text-xs font-semibold text-white" style={style}>
              {labels.apply}
            </Text>
          </Pressable>
        </View>
      </Card.Body>
    </Card>
  );
}

type FilterInputProps = {
  label: string;
  value: string;
  placeholder: string;
  keyboardType?: "default" | "number-pad";
  locale: AppLocale;
  style?: StyleProp<TextStyle>;
  onChangeText: (next: string) => void;
};

function FilterInput({
  label,
  value,
  placeholder,
  keyboardType = "default",
  locale,
  style,
  onChangeText,
}: FilterInputProps) {
  return (
    <View className="flex-1 gap-1">
      <Text className="text-[10px] text-slate-500" style={style}>
        {label}
      </Text>
      <CompactTextInput
        locale={locale}
        compactVariant="advanced"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        className={`border border-slate-200 bg-white ${COMPACT_ADVANCED_INPUT_CLASSNAME}`}
      />
    </View>
  );
}
