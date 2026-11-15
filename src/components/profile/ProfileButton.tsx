import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useFeatureFlag } from "posthog-react-native";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useMyProfile } from "@/hooks";
import { UIAvatar, UICoin, UIText } from "@/ui";
import { formatCompactCount } from "@/utils";

// the avatar in every tab's header: opens the profile, with the coin balance pinned under it
export const ProfileButton = () => {
  const { t, i18n } = useTranslation();
  const { data: profile } = useMyProfile();
  const coinsEnabled = useFeatureFlag("coins") !== false;
  const handlePress = () => router.push("/profile");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        profile && coinsEnabled
          ? `${t("app.profile")}, ${t("rewards.balance")}: ${profile.coins}`
          : t("app.profile")
      }
      onPress={handlePress}
    >
      <UIAvatar imageSrc={profile?.avatarUrl} />
      {profile && coinsEnabled ? (
        // overlaps the avatar's bottom edge, so the header keeps its height
        <View style={styles.coins}>
          <UICoin size="xs" />
          <UIText size="xs" weight="semibold" style={styles.count}>
            {formatCompactCount(
              profile.coins,
              i18n.resolvedLanguage ?? i18n.language,
            )}
          </UIText>
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  coins: {
    position: "absolute",
    bottom: -theme.vs(6),
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(2),
    paddingHorizontal: theme.s(5),
    paddingVertical: theme.vs(1),
    borderRadius: theme.vs(999),
    borderWidth: 1,
    borderColor: theme.colors.amber30,
    backgroundColor: theme.colors.ink,
  },
  count: {
    fontSize: theme.vs(10),
    lineHeight: theme.vs(13),
  },
}));
