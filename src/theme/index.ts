import { ms, mvs, s, vs } from "./scale";

export const fonts = {
  Geist: "Geist",
};

// v2 palette from docs/design/uniezz-web-app.pen: name + opacity step (white10 = white at 10%)
const colors = {
  white: "rgb(255, 255, 255)",
  white80: "rgba(255, 255, 255, 0.8)",
  white60: "rgba(255, 255, 255, 0.6)",
  white40: "rgba(255, 255, 255, 0.4)",
  white20: "rgba(255, 255, 255, 0.2)",
  white10: "rgba(255, 255, 255, 0.1)",
  white5: "rgba(255, 255, 255, 0.05)",
  white0: "rgba(255, 255, 255, 0)",
  ink: "rgb(12, 13, 20)",
  ink90: "rgba(12, 13, 20, 0.9)",
  ink70: "rgba(12, 13, 20, 0.7)",
  ink40: "rgba(12, 13, 20, 0.4)",
  ink0: "rgba(12, 13, 20, 0)",
  surface: "rgb(22, 24, 34)",
  surface60: "rgba(22, 24, 34, 0.6)",
  black50: "rgba(0, 0, 0, 0.5)",
  blue: "rgb(91, 124, 255)",
  blue40: "rgba(91, 124, 255, 0.4)",
  blue20: "rgba(91, 124, 255, 0.2)",
  blue0: "rgba(91, 124, 255, 0)",
  sky: "rgb(169, 186, 255)",
  violet20: "rgba(139, 92, 246, 0.2)",
  violet0: "rgba(139, 92, 246, 0)",
  amber: "rgb(255, 194, 77)",
  amber30: "rgba(255, 194, 77, 0.3)",
  amber10: "rgba(255, 194, 77, 0.1)",
  green: "rgb(61, 214, 140)",
  green15: "rgba(61, 214, 140, 0.15)",
  red: "rgb(229, 72, 77)",
};

export const darkTheme = {
  themeName: "dark",
  fonts,
  colors,
  s,
  vs,
  ms,
  mvs,
};

// the v2 design is dark-only; light stays registered so the stored theme name keeps resolving
export const lightTheme = {
  ...darkTheme,
  themeName: "light",
};
