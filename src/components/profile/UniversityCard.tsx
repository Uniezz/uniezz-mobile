import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useUniversities } from "@/hooks/useUniversities";
import { UIText, UIUniversityLogo } from "@/ui";

// university row inside the profile identity card
export const UniversityCard = ({ universityId }: { universityId: string }) => {
  const { t } = useTranslation();
  const { data: universities = [] } = useUniversities();
  const name =
    universities.find(({ id }) => id === universityId)?.name ??
    universityId.toUpperCase();
  return (
    <View style={styles.card}>
      <UIUniversityLogo id={universityId} size="xs" />
      <View style={styles.text}>
        <UIText size="xs" weight="medium" color="secondary">
          {t("app.university")}
        </UIText>
        <UIText size="body" weight="semibold">
          {name}
        </UIText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    paddingVertical: theme.vs(16),
    paddingHorizontal: theme.s(12),
    borderRadius: theme.vs(16),
    borderWidth: 1,
    borderColor: theme.colors.sky15,
    backgroundColor: theme.colors.sky5,
  },
  text: {
    flex: 1,
    gap: theme.vs(3),
  },
}));
