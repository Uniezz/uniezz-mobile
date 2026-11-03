import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { ScreenHeader } from "@/components/ScreenHeader";
import { UIGlass, UIPage, UIText } from "@/ui";

export default function FaqScreen() {
  const { t } = useTranslation();

  return (
    <UIPage>
      <ScreenHeader title={t("tabs.faq")} />
      <UIGlass style={styles.empty}>
        <UIText color="secondary">{t("faq.empty")}</UIText>
      </UIGlass>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  empty: {
    margin: theme.s(16),
    padding: theme.s(24),
  },
}));
