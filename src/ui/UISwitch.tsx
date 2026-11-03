import { Switch } from "react-native";
import { withUnistyles } from "react-native-unistyles";

export const UISwitch = withUnistyles(Switch, (theme) => ({
  trackColor: { false: theme.colors.white20, true: theme.colors.blue },
  thumbColor: theme.colors.white,
}));
