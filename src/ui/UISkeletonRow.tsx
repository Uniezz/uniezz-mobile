import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIGlass } from "./UIGlass";
import { UISkeleton } from "./UISkeleton";

// UIAvatar's sizes, in design points
const AVATAR_SIZES = { sm: 32, default: 40, lg: 48 } as const;

type UISkeletonRowProps = {
  /** the avatar size of the row it stands in for, as UIAvatar's `size` */
  avatarSize?: keyof typeof AVATAR_SIZES;
  /** a glass card, as student and member rows; plain for chat rows and comments */
  isGlass?: boolean;
  /** stacked copies, e.g. a screenful while the list loads */
  count?: number;
};

// a placeholder list row: an avatar and a name over a shorter detail line
export function UISkeletonRow({
  avatarSize = "default",
  isGlass = false,
  count = 1,
}: UISkeletonRowProps) {
  const size = AVATAR_SIZES[avatarSize];
  const content = (
    <>
      <UISkeleton width={size} height={size} borderRadius={size / 2} />
      <View style={styles.text}>
        <UISkeleton height={12} borderRadius={6} width="45%" />
        <UISkeleton height={10} borderRadius={5} width="70%" />
      </View>
    </>
  );

  return (
    <View style={styles.list(isGlass)}>
      {Array.from({ length: count }, (_, index) =>
        isGlass ? (
          <UIGlass key={index} radius={12} style={styles.row(isGlass)}>
            {content}
          </UIGlass>
        ) : (
          <View key={index} style={styles.row(isGlass)}>
            {content}
          </View>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: (isGlass: boolean) => ({ gap: isGlass ? theme.vs(8) : 0 }),
  row: (isGlass: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    ...(isGlass ? { padding: theme.s(12) } : { paddingVertical: theme.vs(10) }),
  }),
  text: { flex: 1, gap: theme.vs(8) },
}));
