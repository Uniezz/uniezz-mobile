import { Switch, View } from "react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { UIText } from "@/ui";

export function ProfileUnavailableSections() {
  const { t } = useTranslation();

  return (
    <>
      <View style={[styles.section, styles.panel]}>
        <UIText size="md" weight="bold">
          {t("profile.privacy")}
        </UIText>
        <View style={styles.visibilityList}>
          {[
            t("profile.showEmail"),
            t("profile.showFaculty"),
            t("profile.showYear"),
          ].map((label) => (
            <View key={label} style={styles.visibilityRow}>
              <UIText>{label}</UIText>
              <Switch accessibilityLabel={label} value={false} disabled />
            </View>
          ))}
        </View>
        <View style={styles.notice}>
          <UIText color="soft">{t("profile.privacyUnavailable")}</UIText>
        </View>
      </View>

      <View style={[styles.section, styles.panel]}>
        <UIText size="md" weight="bold">
          {t("profile.about")}
        </UIText>
        <View style={styles.disabledField}>
          <UIText color="soft">{t("profile.unavailableField")}</UIText>
        </View>
        <UIText size="md" weight="bold">
          {t("profile.interests")}
        </UIText>
        <View style={styles.disabledField}>
          <UIText color="soft">{t("profile.unavailableField")}</UIText>
        </View>
        <View style={styles.notice}>
          <UIText color="soft">{t("profile.fieldsUnavailable")}</UIText>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.vs(12),
  },
  panel: {
    gap: theme.vs(12),
    padding: theme.s(16),
    borderRadius: theme.vs(18),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
  },
  visibilityList: {
    gap: theme.vs(8),
  },
  visibilityRow: {
    minHeight: theme.vs(42),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.s(12),
  },
  disabledField: {
    minHeight: theme.vs(68),
    justifyContent: "center",
    paddingHorizontal: theme.s(12),
    borderRadius: theme.vs(12),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
  },
  notice: {
    padding: theme.s(14),
    borderRadius: theme.vs(14),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
  },
}));
