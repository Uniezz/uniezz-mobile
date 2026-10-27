import { ImageSourcePropType } from "react-native";

// Bundled logos by university id; ids without one fall back to letters.
export const UNIVERSITY_LOGOS: Record<string, ImageSourcePropType> = {
  umcs: require("../../assets/images/universities/umcs.png"),
  umlub: require("../../assets/images/universities/umlub.png"),
  kul: require("../../assets/images/universities/kul.png"),
  up: require("../../assets/images/universities/up.png"),
  pollub: require("../../assets/images/universities/pollub.png"),
  wspa: require("../../assets/images/universities/wspa.png"),
  wsei: require("../../assets/images/universities/wsei.png"),
};
