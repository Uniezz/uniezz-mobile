import { ms, mvs, s, vs } from "./scale";

export const fonts = {
  PlusJakartaSans: "Plus Jakarta Sans",
};
const colors = {
  white: "rgb(255, 255, 255)",
  black: "rgb(0, 0, 0)",
  midnight: "rgb(5, 16, 46)",
  abyss: "rgb(11, 27, 69)",
  harbor: "rgb(22, 41, 107)",
  indigo: "rgb(36, 58, 140)",
  brand: "#2D4195",
  brandDeep: "rgb(45, 65, 149)",
  periwinkle: "rgb(109, 118, 181)",
  violet: "rgb(109, 91, 245)",
  violetDeep: "rgb(91, 73, 224)",
  ember: "rgb(240, 112, 58)",
  lagoon: "rgb(18, 165, 148)",
  green: "rgb(18, 135, 92)",
  amber: "rgb(181, 118, 10)",
  error: "rgb(198, 55, 77)",
  ink: "rgb(231, 240, 255)",
  mist: "rgb(242, 247, 255)",
  canvas: "rgb(244, 247, 253)",
  hairline: "rgb(225, 232, 247)",
  rule: "rgb(200, 212, 236)",
  brandLight: "rgb(231, 236, 251)",
  violetLight: "rgb(236, 233, 254)",
  emberLight: "rgb(255, 237, 227)",
  lagoonLight: "rgb(221, 244, 240)",
  greenLight: "rgb(223, 243, 234)",
  amberLight: "rgb(251, 239, 217)",
  errorLight: "rgb(251, 230, 234)",
  gray: "rgb(142, 153, 184)",
  grayLight: "rgba(246, 248, 254)",
  graySoft: "rgba(230, 236, 248)",
  textSecondary: "rgb(89, 100, 138)",
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
