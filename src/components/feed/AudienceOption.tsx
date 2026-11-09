import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIText } from "@/ui";

type AudienceOptionProps = {
  selected: boolean;
  onPress: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
};

export const AudienceOption = ({
  selected,
  onPress,
  icon,
  title,
  subtitle,
}: AudienceOptionProps) => (
  <Pressable
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    onPress={onPress}
    style={styles.option(selected)}
  >
    {icon}
    <View style={styles.optionText}>
      <UIText weight="semibold">{title}</UIText>
      <UIText size="sm" color="secondary">
        {subtitle}
      </UIText>
    </View>
    <View style={styles.radio(selected)}>
      {selected ? <View style={styles.radioDot} /> : null}
    </View>
  </Pressable>
);

const styles = StyleSheet.create((theme) => ({
  option: (selected: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(14),
    padding: theme.s(12),
    borderRadius: theme.vs(12),
    borderWidth: 1,
    borderColor: selected ? theme.colors.white20 : "transparent",
    backgroundColor: selected ? theme.colors.white5 : "transparent",
  }),
  optionText: {
    flex: 1,
    gap: theme.vs(2),
  },
  radio: (selected: boolean) => ({
    width: theme.vs(22),
    height: theme.vs(22),
    borderRadius: theme.vs(11),
    borderWidth: 1.5,
    borderColor: selected ? theme.colors.sky : theme.colors.white40,
    alignItems: "center",
    justifyContent: "center",
  }),
  radioDot: {
    width: theme.vs(10),
    height: theme.vs(10),
    borderRadius: theme.vs(5),
    backgroundColor: theme.colors.sky,
  },
}));
