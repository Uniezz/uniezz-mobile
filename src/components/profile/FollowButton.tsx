import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import type { PublicProfile } from "@/@types";
import { useFollowProfile } from "@/hooks";
import { StyleSheet } from "react-native-unistyles";
import { Icon, UIButton, UIText } from "@/ui";

export const FollowButton = ({ profile }: { profile: PublicProfile }) => {
  const { t } = useTranslation();
  const { mutate: follow, isPending } = useFollowProfile();
  const isFollowing = profile.followedByMe;
  const handlePress = () =>
    follow(
      { id: profile.id, follow: !isFollowing },
      {
        onSuccess: () =>
          toast.success(
            t(isFollowing ? "follows.unfollowed" : "follows.followed"),
          ),
        onError: () => toast.error(t("apiState.error")),
      },
    );

  return (
    <UIButton
      size="sm"
      type={isFollowing ? "ghost" : undefined}
      accessibilityRole="button"
      accessibilityState={{ selected: isFollowing }}
      disabled={isPending}
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
      <UIText
        size="sm"
        weight="semibold"
        color={isFollowing ? "white" : "black"}
      >
        {t(isFollowing ? "follows.unfollow" : "follows.follow")}
      </UIText>
    </UIButton>
  );
};

const styles = StyleSheet.create((theme) => ({
  // sized by its label, which is much longer in some languages
  button: (isFollowing: boolean) => ({
    width: "auto",
    flexDirection: "row",
    gap: theme.s(6),
    paddingHorizontal: theme.s(16),
    borderWidth: isFollowing ? 1 : 0,
    borderColor: theme.colors.white40,
  }),
}));
