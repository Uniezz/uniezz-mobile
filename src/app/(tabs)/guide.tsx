import { useLogout } from "@/hooks/auth";
import { UIButton, UIPage, UIText } from "@/ui";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";
import { ScreenHeader } from "@/components";

export default function GuideScreen() {
  const { t } = useTranslation();
  const handleLogout = useLogout();

  return (
    <UIPage backdrop="city" style={styles.page}>
      <ScreenHeader title={t("tabs.guide")} style={styles.header} />
      <UIButton onPress={handleLogout} type="danger">
        <UIText color="white" weight="semibold">
          {t("auth.logOut")}
        </UIText>
      </UIButton>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    paddingHorizontal: theme.s(20),
    gap: theme.vs(20),
  },
  header: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
}));
