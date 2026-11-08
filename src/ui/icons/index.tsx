import type { ComponentProps } from "react";
import { createNanoIconSet } from "react-native-nano-icons";
import { withUnistyles } from "react-native-unistyles";
import { vs } from "@/theme/scale";
import glyphMap from "./icons.glyphmap.json";

// Keep the default in the mapping so uniProps and explicit colors can override it.
const ThemedIcon = withUnistyles(createNanoIconSet(glyphMap), (theme) => ({
  color: theme.colors.white,
}));

// `size` is given in design points and scaled to the screen like every other size
export const Icon = ({ size, ...props }: ComponentProps<typeof ThemedIcon>) => (
  <ThemedIcon size={size === undefined ? undefined : vs(size)} {...props} />
);
