import { useTranslation } from "react-i18next";
import type { PublicProfile } from "@/@types";
import { useFollowProfile } from "@/hooks";
import { StyleSheet } from "react-native-unistyles";
import { Icon, UIButton } from "@/ui";

export const FollowButton = ({ profile }: { profile: PublicProfile }) => {
  const { t } = useTranslation();
  const { mutate: follow } = useFollowProfile(profile.id);
  const isFollowing = profile.followedByMe;
  const handlePress = () => follow(!isFollowing);

  return (
    <UIButton
      size="sm"
      type={isFollowing ? "ghost" : undefined}
      accessibilityRole="button"
      accessibilityLabel={t(
        isFollowing ? "follows.unfollow" : "follows.follow",
      )}
      accessibilityState={{ selected: isFollowing }}
      onPress={handlePress}
      style={styles.button(isFollowing)}
    >
      <Icon
        name={isFollowing ? "user-minus" : "user-plus"}
        size={16}
        uniProps={(theme) => ({
          color: isFollowing ? theme.colors.white : theme.colors.ink,
        })}
      />
    </UIButton>
  );
};

const styles = StyleSheet.create((theme) => ({
  // icon only: the label overflowed the row in longer languages, so it is the accessibility label now
  button: (isFollowing: boolean) => ({
    width: "auto",
    paddingHorizontal: theme.s(14),
    // the same 1px border either way, so following does not resize the button and shift the row
    borderWidth: 1,
    borderColor: isFollowing ? theme.colors.white40 : "transparent",
  }),
}));
