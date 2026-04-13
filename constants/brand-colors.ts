/**
 * App accent color — change `PRIMARY` only to re-theme primary UI.
 * `palette.primarySoft` / `primaryMuted` are derived from `PRIMARY`.
 */

/** App accent — keep in sync with Tailwind `theme.extend.colors.primary` / Gluestack `--color-primary-*`. */
export const PRIMARY = "#3b82f6";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mixHex(bg: string, fg: string, fgAmount: number): string {
  const A = hexToRgb(bg);
  const B = hexToRgb(fg);
  const t = fgAmount;
  const r = Math.round(A.r + (B.r - A.r) * t);
  const g = Math.round(A.g + (B.g - A.g) * t);
  const b = Math.round(A.b + (B.b - A.b) * t);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

const _rgb = hexToRgb(PRIMARY);

/** Semantic tokens (primary comes from `PRIMARY`; neutrals are fixed UI grays). */
export const palette = {
  primary: PRIMARY,
  /** Tab bar / avatar circles — white mixed with primary */
  primarySoft: mixHex("#ffffff", PRIMARY, 0.13),
  /** Inactive tab icons */
  primaryMuted: `rgba(${_rgb.r},${_rgb.g},${_rgb.b},0.45)`,
  screen: "#F2F3F5",
} as const;

export const neutral = {
  text: "#11181C",
  muted: "#687076",
  subtle: "#9BA1A6",
  border: "#E8EAED",
  iconBg: "#EEF1F4",
  chevron: "#C5C9D0",
} as const;

export const semantic = {
  destructive: "#E85D4A",
  destructiveBorder: "#F0E0DC",
  destructivePressed: "#fff8f6",
  rowPressed: "#f8f9fa",
  /** Settings list row — TouchableHighlight underlay (visible on white cards) */
  settingsRowPressed: `rgba(${_rgb.r},${_rgb.g},${_rgb.b},0.14)`,
} as const;
