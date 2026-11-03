import Slider from "@react-native-community/slider";
import { withUnistyles } from "react-native-unistyles";

export const UISlider = withUnistyles(Slider, (theme) => ({
  minimumTrackTintColor: theme.colors.blue,
  maximumTrackTintColor: theme.colors.white20,
  thumbTintColor: theme.colors.sky,
}));
