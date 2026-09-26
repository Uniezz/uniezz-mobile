import { ms, mvs, s, vs } from "./scale";

export const fonts = {
  PlusJakartaSans: "Plus Jakarta Sans",
};
const colors = {
  white: "#FFFFFF",
  black: "#000000",
  midnight: "#05102E",
  abyss: "#0B1B45",
  harbor: "#16296B",
  indigo: "#243A8C",
  brand: "#2D4195",
  brandDeep: "#233473",
  periwinkle: "#6D76B5",
  violet: "#6D5BF5",
  violetDeep: "#5B49E0",
  ember: "#F0703A",
  lagoon: "#12A594",
  green: "#12875C",
  amber: "#B5760A",
  error: "#C6374D",
  ink: "#E7F0FF",
  mist: "#F2F7FF",
  canvas: "#F4F7FD",
  hairline: "#E1E8F7",
  rule: "#C8D4EC",
  brandLight: "#E7ECFB",
  violetLight: "#ECE9FE",
  emberLight: "#FFEDE3",
  lagoonLight: "#DDF4F0",
  greenLight: "#DFF3EA",
  amberLight: "#FBEFD9",
  errorLight: "#FBE6EA",
  gray: "#8E99B8",
  grayLight: "rgba(246, 248, 254)",
  graySoft: "rgba(230, 236, 248)",
  textSecondary: "#59648A",
};

export const lightTheme = {
  themeName: "light",
  fonts,
  colors: {
    ...colors,
  },
  s,
  vs,
  ms,
  mvs,
};
//Not needed now
export const darkTheme = {
  themeName: "dark",
  fonts,

  colors: {
    ...colors,
  },
  s,
  vs,
  ms,
  mvs,
};
