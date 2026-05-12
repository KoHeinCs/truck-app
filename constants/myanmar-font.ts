import type { TextStyle } from "react-native";
import { Platform } from "react-native";

/**
 * Single Myanmar UI face per platform (no mixed font stacks).
 * Use the same `fontSize` / `lineHeight` as English; only `fontFamily` changes for `mm`.
 */
export function getMyanmarFontFamily(): string {
  if (Platform.OS === "web") {
    return "Noto Sans Myanmar";
  }
  return (
    Platform.select({
      ios: "Myanmar Sangam MN",
      android: "Noto Sans Myanmar",
      default: "sans-serif",
    }) ?? "sans-serif"
  );
}

/** Myanmar text: `fontFamily` only — match English sizing via className or shared metrics. */
export function myanmarUITextStyle(): TextStyle {
  return { fontFamily: getMyanmarFontFamily() };
}
