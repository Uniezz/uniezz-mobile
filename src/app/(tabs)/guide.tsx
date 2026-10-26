import { useSession } from "@/contexts";
import { UIButton, UIPage, UIText } from "@/ui";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";

export default function GuideScreen() {
  const { clearSession } = useSession();

  const handleLogout = async () => {
    try {
      await clearSession();
    } catch {
      Toast.show({
        type: "error",
        text1: "Couldn’t log out. Please try again.",
      });
    }
  };

  return (
    <UIPage backdrop="city" style={styles.page}>
      <UIText>Guide Screen</UIText>
      <UIButton onPress={handleLogout} type="danger">
        <UIText color="white" weight="semibold">
          Log out
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
}));
