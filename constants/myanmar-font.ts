import { Platform } from "react-native";
import type { TextStyle } from "react-native";

export const MYANMAR_UI_FONT_STACK =
  'system-ui, -apple-system, "Segoe UI", "Noto Sans Myanmar", "Pyidaungsu", "Myanmar MN", "Myanmar Text", Roboto, Arial, sans-serif';

export function myanmarUITextStyle(): TextStyle {
  if (Platform.OS === "web") {
    return { fontFamily: MYANMAR_UI_FONT_STACK, lineHeight: 0 };
  }

  // Native: do not force lineHeight — `lineHeight: 0` breaks Myanmar metrics and
  // makes glyphs look pinned to the top of rows, tabs, and inputs.
  return {
    fontFamily: Platform.select({
      ios: "Myanmar Sangam MN",
      android: "Noto Sans Myanmar",
      default: "sans-serif",
    }),
  };
}
