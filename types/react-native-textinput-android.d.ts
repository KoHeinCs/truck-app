import "react-native";

declare module "react-native" {
  /** @platform android — supported at runtime; omitted from RN’s published TextInput props in this toolchain */
  interface TextInputProps {
    includeFontPadding?: boolean | undefined;
  }
}
