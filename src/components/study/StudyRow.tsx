import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Icon, UIGlass, UIText } from "@/ui";

type StudyRowProps = {
  icon: ComponentProps<typeof Icon>["name"];
  title: string;
  subtitle: string;
  /** average from 1 to 5; 0 means nobody rated yet */
  rating?: number;
  onPress: () => void;
};

// one glass card per file, course or professor, 8pt apart, as in the design
export function StudyRow({
  icon,
  title,
  subtitle,
  rating,
  onPress,
}: StudyRowProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.cell}>
      <UIGlass radius={16} style={styles.row}>
        <View style={styles.tile}>
          <Icon
            name={icon}
            size={18}
            uniProps={(theme) => ({ color: theme.colors.white80 })}
          />
        </View>
        <View style={styles.text}>
          <UIText weight="semibold" numberOfLines={1}>
            {title}
          </UIText>
          <UIText size="xs" color="secondary" numberOfLines={1}>
            {subtitle}
          </UIText>
        </View>
        {rating === undefined ? null : (
          <View style={styles.rating}>
            <Icon
              name="star"
              size={13}
              uniProps={(theme) => ({ color: theme.colors.amber })}
            />
            <UIText size="body" weight="semibold">
              {rating > 0 ? rating.toFixed(1) : "—"}
            </UIText>
          </View>
        )}
      </UIGlass>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  cell: { paddingBottom: theme.vs(8) },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    padding: theme.s(12),
  },
  tile: {
    width: theme.vs(40),
    height: theme.vs(40),
    borderRadius: theme.vs(12),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: theme.vs(3) },
  rating: {
    width: theme.s(48),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.s(5),
  },
}));
