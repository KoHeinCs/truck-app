import { APP_COLORS } from "@/constants/colors";
import type { AppLocale } from "@/stores/client/locale-store";
import type { ProposalAdvancedFilters as ProposalAdvancedFilterValues } from "@/stores/server/proposal/search-columns";
import { Card, Input } from "heroui-native";
import React from "react";
import type { StyleProp, TextStyle } from "react-native";
import { Pressable, Text, View } from "react-native";

type ProposalAdvancedFiltersProps = {
  filters: ProposalAdvancedFilterValues;
  locale: AppLocale;
  style?: StyleProp<TextStyle>;
  showOwnerId: boolean;
  showCreatedBy: boolean;
  onChange: (next: Partial<ProposalAdvancedFilterValues>) => void;
  onReset: () => void;
  onApply: () => void;
};

const labels = {
  en: {
    title: "Advanced Filters",
    proposalNo: "Proposal No",
    ownerId: "Owner ID",
    plateNo: "Plate No",
    proposalDateFrom: "Proposal Date From",
    proposalDateTo: "Proposal Date To",
    serviceTypeCsv: "Service Type",
    serviceDateFrom: "Service Date From",
    serviceDateTo: "Service Date To",
    createdByCsv: "Created By",
    reset: "Reset",
    apply: "Apply",
  },
  mm: {
    title: "အသေးစိတ်ရှာဖွေမှု",
    proposalNo: "အဆိုပြုချက်အမှတ်",
    ownerId: "Owner ID",
    plateNo: "ကားနံပါတ်",
    proposalDateFrom: "အဆိုပြုရက် မှ",
    proposalDateTo: "အဆိုပြုရက် ထိ",
    serviceTypeCsv: "ဝန်ဆောင်မှုအမျိုးအစား",
    serviceDateFrom: "ဝန်ဆောင်မှုရက် မှ",
    serviceDateTo: "ဝန်ဆောင်မှုရက် ထိ",
    createdByCsv: "Created By",
    reset: "ရှင်းမည်",
    apply: "ရှာမည်",
  },
};

export function ProposalAdvancedFilters({
  filters,
  locale,
  style,
  showOwnerId,
  showCreatedBy,
  onChange,
  onReset,
  onApply,
}: ProposalAdvancedFiltersProps) {
  const t = labels[locale];

  return (
    <Card className="mb-4 p-5">
      <Card.Body className="gap-3">
        <Text className="text-sm font-semibold text-slate-900" style={style}>
          {t.title}
        </Text>

        <View className="flex-row gap-2">
          <FilterInput
            label={t.proposalNo}
            value={filters.proposalNo}
            placeholder={t.proposalNo}
            style={style}
            onChangeText={(proposalNo) => onChange({ proposalNo })}
          />
          <FilterInput
            label={t.plateNo}
            value={filters.plateNo}
            placeholder={t.plateNo}
            style={style}
            onChangeText={(plateNo) => onChange({ plateNo })}
          />
        </View>

        <View className="flex-row gap-2">
          <FilterInput
            label={t.proposalDateFrom}
            value={filters.proposalDateFrom}
            placeholder="DD/MM/YYYY"
            style={style}
            onChangeText={(proposalDateFrom) => onChange({ proposalDateFrom })}
          />
          <FilterInput
            label={t.proposalDateTo}
            value={filters.proposalDateTo}
            placeholder="DD/MM/YYYY"
            style={style}
            onChangeText={(proposalDateTo) => onChange({ proposalDateTo })}
          />
        </View>

        <View className="flex-row gap-2">
          <FilterInput
            label={t.serviceTypeCsv}
            value={filters.serviceTypeCsv}
            placeholder={t.serviceTypeCsv}
            style={style}
            onChangeText={(serviceTypeCsv) => onChange({ serviceTypeCsv })}
          />
          <FilterInput
            label={t.serviceDateFrom}
            value={filters.serviceDateFrom}
            placeholder="DD/MM/YYYY"
            style={style}
            onChangeText={(serviceDateFrom) => onChange({ serviceDateFrom })}
          />
        </View>

        <View className="flex-row gap-2">
          <FilterInput
            label={t.serviceDateTo}
            value={filters.serviceDateTo}
            placeholder="DD/MM/YYYY"
            style={style}
            onChangeText={(serviceDateTo) => onChange({ serviceDateTo })}
          />
          {showOwnerId ? (
            <FilterInput
              label={t.ownerId}
              value={filters.ownerId}
              placeholder={t.ownerId}
              style={style}
              onChangeText={(ownerId) => onChange({ ownerId })}
            />
          ) : (
            <View className="flex-1" />
          )}
        </View>

        {showCreatedBy ? (
          <View className="gap-1">
            <Text className="text-[10px] text-slate-500" style={style}>
              {t.createdByCsv}
            </Text>
            <Input
              value={filters.createdByCsv}
              onChangeText={(createdByCsv) => onChange({ createdByCsv })}
              placeholder={t.createdByCsv}
              className="rounded-xl border border-slate-200 bg-white px-2.5 text-xs"
            />
          </View>
        ) : null}

        <View className="flex-row gap-2 pt-0.5">
          <Pressable
            onPress={onReset}
            className="flex-1 items-center justify-center rounded-xl bg-slate-100 py-3"
          >
            <Text className="text-xs font-semibold text-slate-700" style={style}>
              {t.reset}
            </Text>
          </Pressable>

          <Pressable
            className="flex-1 items-center justify-center rounded-xl py-3"
            style={{ backgroundColor: APP_COLORS.primary }}
            onPress={onApply}
          >
            <Text className="text-xs font-semibold text-white" style={style}>
              {t.apply}
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
  style?: StyleProp<TextStyle>;
  onChangeText: (next: string) => void;
};

function FilterInput({
  label,
  value,
  placeholder,
  style,
  onChangeText,
}: FilterInputProps) {
  return (
    <View className="flex-1 gap-1">
      <Text className="text-[10px] text-slate-500" style={style}>
        {label}
      </Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className="rounded-xl border border-slate-200 bg-white px-2.5 text-xs"
      />
    </View>
  );
}
