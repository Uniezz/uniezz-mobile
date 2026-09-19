import { ms, mvs, s, vs } from "./scale";

const colors = {
  white: "#FFFFFF",
  black: "#000000",
};

export const lightTheme = {
  themeName: "light",
  colors: {
    primary: "#e5f6ea",
    darkGreen: "#2E7D32",
    lightGreen: "#E8F5E9",
    background: "#FFFFFF",
    surface: "#F9FAFB",
    textPrimary: "#1F2937",
    textSecondary: "#6B7280",
    lightGray: "#E5E7EB",

    backdrop: "rgba(0, 0, 0, 0.5)",
    ...colors,
  },
  s,
  vs,
  ms,
  mvs,
};

export const darkTheme = {
  themeName: "dark",
  colors: {
    primary: "#81C784",
    darkGreen: "#4CAF50",
    lightGreen: "#1B5E20",
    background: "#111827",
    surface: "#1F2937",
    textPrimary: "#F9FAFB",
    textSecondary: "#9CA3AF",
    lightGray: "#374151",
    backdrop: "rgba(0, 0, 0, 0.7)",
    ...colors,
  },
  s,
  vs,
  ms,
  mvs,
};

export const goldTheme = {
  themeName: "gold",
  colors: {
    primary: "#D4AF37", // Gold
    darkGreen: "#B8860B", // Dark Goldenrod
    lightGreen: "#FFF8E1", // Light Gold tint
    background: "#0C0C0C", // Deep Black/Gold
    surface: "#1A1A1A",
    textPrimary: "#F9FAFB",
    textSecondary: "#D4AF37",
    lightGray: "#333333",
    backdrop: "rgba(0, 0, 0, 0.8)",
    ...colors,
  },
  s,
  vs,
  ms,
  mvs,
};
