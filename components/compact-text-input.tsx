import type { AppLocale } from "@/stores/client/locale-store";
import {
  compactAdvancedInputTextStyle,
  compactLineInputTextStyle,
} from "@/constants/compact-input";
import React, { forwardRef, useMemo } from "react";
import {
  TextInput,
  type TextInputProps,
  type TextStyle,
} from "react-native";

export type CompactTextInputProps = TextInputProps & {
  locale: AppLocale;
  /** Use `advanced` for 12px advanced-filter fields. */
  compactVariant?: "line" | "advanced";
};

/**
 * Plain RN TextInput with compact typography (avoids HeroUI Input's fixed `py-3.5`,
 * which fights `h-10` and makes Myanmar placeholders look tall / bottom-heavy).
 */
export const CompactTextInput = forwardRef<TextInput, CompactTextInputProps>(
  function CompactTextInput(
    { locale, compactVariant = "line", className, style, ...rest },
    ref,
  ) {
    const textStyle = useMemo((): TextStyle => {
      return compactVariant === "advanced"
        ? compactAdvancedInputTextStyle(locale)
        : compactLineInputTextStyle(locale);
    }, [locale, compactVariant]);

    return (
      <TextInput
        ref={ref}
        className={className}
        style={[textStyle, style]}
        placeholderTextColor="#94a3b8"
        {...rest}
      />
    );
  },
);
