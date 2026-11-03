import type { ComponentProps } from "react";
import { createNanoIconSet } from "react-native-nano-icons";
import { withUnistyles } from "react-native-unistyles";
import glyphMap from "./icons.glyphmap.json";

// withUnistyles lets callers theme the color prop via uniProps without useUnistyles
const NanoIcon = withUnistyles(createNanoIconSet(glyphMap));

type IconProps = ComponentProps<typeof NanoIcon>;

const defaultColor: IconProps["uniProps"] = (theme) => ({
  color: theme.colors.white,
});

// Lucide glyphs use currentColor, which the icon font renders black unless a color is set
export const Icon = ({ color, uniProps, ...props }: IconProps) => (
  <NanoIcon
    {...props}
    color={color}
    uniProps={uniProps ?? (color ? undefined : defaultColor)}
  />
);
