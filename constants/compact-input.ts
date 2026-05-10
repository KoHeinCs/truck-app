import type { AppLocale } from "@/stores/client/locale-store";
import { Platform, type TextStyle } from "react-native";
import { myanmarUITextStyle } from "./myanmar-font";

/** Single-line list/search inputs (matches typical tall MY placeholder metrics without growing the field). */
export const COMPACT_LINE_INPUT_CLASSNAME =
  "h-10 max-h-10 rounded-xl px-3 py-0 text-sm";

/** Smaller single-line inputs (advanced filter rows). */
export const COMPACT_ADVANCED_INPUT_CLASSNAME =
  "h-10 max-h-10 rounded-xl px-2.5 py-0 text-xs";

const androidSingleLineAlign: TextStyle =
  Platform.OS === "android" ? { textAlignVertical: "center" } : {};

export function compactLineInputTextStyle(locale: AppLocale): TextStyle {
  const metrics: TextStyle = {
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
    ...androidSingleLineAlign,
  };
  if (locale === "mm") {
    return { ...myanmarUITextStyle(), ...metrics };
  }
  return metrics;
}

export function compactAdvancedInputTextStyle(locale: AppLocale): TextStyle {
  const metrics: TextStyle = {
    fontSize: 12,
    lineHeight: 18,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
    ...androidSingleLineAlign,
  };
  if (locale === "mm") {
    return { ...myanmarUITextStyle(), ...metrics };
  }
  return metrics;
}

export function compactMultilineInputTextStyle(locale: AppLocale): TextStyle {
  const metrics: TextStyle = {
    fontSize: 14,
    lineHeight: 22,
    paddingTop:
      locale === "mm" && Platform.OS === "ios"
        ? 12
        : Platform.OS === "ios"
          ? 10
          : 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
  };
  if (locale === "mm") {
    return { ...myanmarUITextStyle(), ...metrics };
  }
  return metrics;
}
