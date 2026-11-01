import { LanguagePicker } from "@/components/LanguagePicker";
import { UIText } from "@/ui";
import { View } from "react-native";
import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type ScreenHeaderProps = {
  title: string;
  style?: ViewStyle;
};

export const ScreenHeader = ({ title, style }: ScreenHeaderProps) => (
  <View style={[styles.container, style]}>
    <UIText weight="bold" size="xl">
      {title}
    </UIText>
    <LanguagePicker />
  </View>
);

const styles = StyleSheet.create((theme) => ({
  container: {
    minHeight: theme.vs(42),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.s(12),
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
  },
}));
