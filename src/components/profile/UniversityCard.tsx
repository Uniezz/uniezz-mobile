import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useUniversities } from "@/hooks/useUniversities";
import { Icon, UIGlass, UIText } from "@/ui";

export const UniversityCard = ({ universityId }: { universityId: string }) => {
  const { t } = useTranslation();
  const { data: universities = [] } = useUniversities();
  const name =
    universities.find(({ id }) => id === universityId)?.name ??
    universityId.toUpperCase();
  return (
    <UIGlass radius={24} style={styles.card}>
      <Icon
        name="graduation-cap"
        size={20}
        uniProps={(theme) => ({ color: theme.colors.white60 })}
      />
      <View style={styles.text}>
        <UIText size="xs" weight="medium" color="secondary">
          {t("app.university")}
        </UIText>
        <UIText size="body" weight="semibold">
          {name}
        </UIText>
      </View>
    </UIGlass>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    paddingVertical: theme.vs(14),
    paddingHorizontal: theme.s(16),
  },
  text: {
    flex: 1,
    gap: theme.vs(3),
  },
}));
