import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ProfileSummary } from "@/@types/profile";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useUniversities } from "@/hooks/useUniversities";
import { Icon, UIAvatar, UIGlass, UIText, UIUniversityLogo } from "@/ui";
import { authorName, profileHref } from "@/utils";

// a student in the directory; opens their profile, or your own
export const StudentRow = ({ student }: { student: ProfileSummary }) => {
  const { t } = useTranslation();
  const { data: universities = [] } = useUniversities();
  const name = authorName(student) || t("apiState.student");
  const university =
    universities.find(({ id }) => id === student.universityId)?.name ??
    student.universityId.toUpperCase();
  const { data: me } = useMyProfile();
  const handlePress = () => router.push(profileHref(student.id, me?.id));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={handlePress}
    >
      <UIGlass radius={16} style={styles.row}>
        <UIAvatar imageSrc={student.avatarUrl} />
        <View style={styles.text}>
          <UIText weight="semibold" numberOfLines={1}>
            {name}
          </UIText>
          <View style={styles.university}>
            <UIUniversityLogo id={student.universityId} size="xxs" />
            <UIText
              size="sm"
              color="secondary"
              numberOfLines={1}
              style={styles.universityName}
            >
              {university}
            </UIText>
          </View>
        </View>
        <Icon
          name="chevron-right"
          size={16}
          uniProps={(theme) => ({ color: theme.colors.white40 })}
        />
      </UIGlass>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    padding: theme.s(12),
  },
  text: {
    flex: 1,
    gap: theme.vs(4),
  },
  university: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
  },
  universityName: {
    flexShrink: 1,
  },
}));
