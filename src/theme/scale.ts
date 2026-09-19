import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const [shortDimension, longDimension] =
  width < height ? [width, height] : [height, width];

const guidelineBaseWidth = 393;
const guidelineBaseHeight = 852;

export const scale = (size: number) =>
  Math.round((shortDimension / guidelineBaseWidth) * size);
export const verticalScale = (size: number) =>
  Math.round((longDimension / guidelineBaseHeight) * size);
export const moderateScale = (size: number, factor = 0.5) =>
  Math.round(size + (scale(size) - size) * factor);
export const moderateVerticalScale = (size: number, factor = 0.5) =>
  Math.round(size + (verticalScale(size) - size) * factor);

export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;
export const mvs = moderateVerticalScale;
