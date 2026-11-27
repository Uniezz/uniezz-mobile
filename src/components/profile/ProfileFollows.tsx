import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { FollowList } from "@/@types";
import { UIPressable, UIText } from "@/ui";

type ProfileFollowsProps = {
  /** missing for the signed-in student */
  profileId?: string;
  name: string;
  followersCount: number;
  followingCount: number;
};

// follower and following counts; each opens its list
export const ProfileFollows = ({
  profileId,
  name,
  followersCount,
  followingCount,
}: ProfileFollowsProps) => {
  const { t } = useTranslation();
  const counts = { followers: followersCount, following: followingCount };
  const handlePress = (list: FollowList) =>
    router.push({
      pathname: "/follows",
      params: { list, name, ...(profileId ? { id: profileId } : {}) },
    });

  return (
    <View style={styles.row}>
      {(["followers", "following"] as const).map((list) => (
        <UIPressable
          key={list}
          accessibilityRole="button"
          accessibilityLabel={`${counts[list]} ${t(`follows.${list}`)}`}
          onPress={() => handlePress(list)}
        >
          <UIText size="md" weight="semibold">
            {counts[list]}
          </UIText>
          <UIText size="sm" color="secondary">
            {t(`follows.${list}`)}
          </UIText>
        </UIPressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    gap: theme.s(24),
  },
}));
