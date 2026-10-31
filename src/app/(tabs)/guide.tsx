import { useSession } from "@/contexts";
import { clearMyProfileCache } from "@/hooks/profile";
import { UIButton, UIPage, UIText } from "@/ui";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";
import { ScreenHeader } from "@/components";

export default function GuideScreen() {
  const { t } = useTranslation();
  const { clearSession } = useSession();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await clearSession();
    } catch {
      Toast.show({
        type: "error",
        text1: t("auth.logoutError"),
      });
    } finally {
      await clearMyProfileCache(queryClient);
    }
  };

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
