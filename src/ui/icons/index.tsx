import { createNanoIconSet } from "react-native-nano-icons";
import { withUnistyles } from "react-native-unistyles";
import glyphMap from "./icons.glyphmap.json";

// Keep the default in the mapping so uniProps and explicit colors can override it.
export const Icon = withUnistyles(createNanoIconSet(glyphMap), (theme) => ({
  color: theme.colors.white,
}));
