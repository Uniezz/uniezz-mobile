import { createNanoIconSet } from "react-native-nano-icons";
import { withUnistyles } from "react-native-unistyles";
import glyphMap from "./icons.glyphmap.json";

// withUnistyles lets callers theme the color prop via uniProps without useUnistyles
export const Icon = withUnistyles(createNanoIconSet(glyphMap));
