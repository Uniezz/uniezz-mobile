import type { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIFadeScrollView } from "./UIFadeScrollView";
import { UIText } from "./UIText";

type UIFilterRowProps = {
  label: string;
  children: ReactNode;
};

// a labelled row of filter chips in a sheet's padded content; the chips bleed to the sheet edges and scroll under the fades
export const UIFilterRow = ({ label, children }: UIFilterRowProps) => (
  <View style={styles.row}>
    <UIText size="xs" weight="semibold" color="secondary">
      {label}
    </UIText>
    <UIFadeScrollView
      horizontal
      fadeColor="surface"
      showsHorizontalScrollIndicator={false}
      style={styles.bleed}
      contentContainerStyle={styles.chips}
    >
      {children}
    </UIFadeScrollView>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  row: {
    gap: theme.vs(6),
  },
  bleed: {
    marginHorizontal: -theme.s(16),
  },
  chips: {
    gap: theme.s(6),
    paddingHorizontal: theme.s(16),
  },
}));
