import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Icon, UIText } from "@/ui";
import { formatTag } from "@/utils";

type PostTagProps = {
  tag: string;
  /** shows a ✕ and makes the chip remove the tag */
  onRemove?: () => void;
  removeLabel?: string;
};

// a post hashtag chip, matching uniezz-web's .app-hashtag
export const PostTag = ({ tag, onRemove, removeLabel }: PostTagProps) => {
  const label = (
    <UIText size="sm" weight="medium" color="soft">
      <UIText size="sm" weight="semibold" color="gray">
        #
      </UIText>
      {formatTag(tag).slice(1)}
    </UIText>
  );

  if (!onRemove) return <View style={styles.tag(false)}>{label}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={removeLabel}
      onPress={onRemove}
      style={styles.tag(true)}
    >
      {label}
      <Icon
        name="x"
        size={14}
        uniProps={(theme) => ({ color: theme.colors.white60 })}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  tag: (removable: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
    paddingVertical: theme.vs(4),
    paddingLeft: theme.s(8),
    paddingRight: theme.s(removable ? 6 : 8),
    borderRadius: theme.vs(8),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
  }),
}));
