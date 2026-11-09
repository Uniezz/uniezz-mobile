import { Switch, SwitchProps } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

const ThemedSwitch = withUnistyles(Switch, (theme) => ({
  trackColor: { false: theme.colors.white20, true: theme.colors.blue },
  thumbColor: theme.colors.white,
}));

export const UISwitch = ({ style, ...props }: SwitchProps) => (
  <ThemedSwitch style={[styles.switch, style]} {...props} />
);

const styles = StyleSheet.create({
  // React Native's iOS Switch sets alignSelf: "flex-start", which pins it to the top of a row
  switch: {
    alignSelf: "center",
  },
});
