import { CompactTextInput } from "@/components/compact-text-input";
import { APP_COLORS } from "@/constants/colors";
import {
  COMPACT_SEARCH_BAR_INPUT_CLASSNAME,
  COMPACT_SEARCH_BAR_ROW_CLASSNAME,
} from "@/constants/compact-input";
import type { AppLocale } from "@/stores/client/locale-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, View } from "react-native";

type ServiceSearchToolbarProps = {
  locale: AppLocale;
  quickQuery: string;
  placeholder: string;
  advancedOpen: boolean;
  onChangeQuickQuery: (value: string) => void;
  onClearQuickQuery: () => void;
  onToggleAdvanced: () => void;
  onPressAdd: () => void;
};

export function ServiceSearchToolbar({
  locale,
  quickQuery,
  placeholder,
  advancedOpen,
  onChangeQuickQuery,
  onClearQuickQuery,
  onToggleAdvanced,
  onPressAdd,
}: ServiceSearchToolbarProps) {
  return (
    <View className="mb-4 flex-row items-center gap-2">
      <View className={COMPACT_SEARCH_BAR_ROW_CLASSNAME}>
        <CompactTextInput
          locale={locale}
          value={quickQuery}
          onChangeText={onChangeQuickQuery}
          placeholder={placeholder}
          className={COMPACT_SEARCH_BAR_INPUT_CLASSNAME}
        />

        {!!quickQuery && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={onClearQuickQuery}
            className="justify-center pl-0.5 pr-1"
            hitSlop={10}
          >
            <Ionicons name="close-circle" size={22} color="#94a3b8" />
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Advanced filters"
          onPress={onToggleAdvanced}
          className="justify-center px-2.5"
          hitSlop={8}
        >
          <Ionicons
            name={advancedOpen ? "funnel" : "funnel-outline"}
            size={20}
            color={APP_COLORS.primary}
          />
        </Pressable>
      </View>

      <Pressable
        onPress={onPressAdd}
        className="items-center justify-center rounded-full p-2.5"
        style={{ backgroundColor: APP_COLORS.primary }}
      >
        <Ionicons name="add" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}
