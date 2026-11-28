import * as InAppUpdates from "expo-in-app-updates";
import { Alert, Platform } from "react-native";
import { createMMKV } from "react-native-mmkv";
import i18n from "@/internationalization";

const storage = createMMKV({ id: "app-update" });

// on launch, offers a newer store build with each platform's own UI. Android shows Google Play's in-app
// update (flexible, or immediate for Play Console priority 4+) and installs it once downloaded; iOS has no
// in-app update, so an alert opens the App Store sheet, asked once per store version
export async function promptAppUpdate() {
  if (__DEV__) return;
  try {
    if (Platform.OS === "android") {
      await InAppUpdates.checkAndStartUpdate();
      return;
    }
    const { updateAvailable, storeVersion } =
      await InAppUpdates.checkForUpdate();
    if (!updateAvailable || !storeVersion) return;
    if (storage.getString("asked-version") === storeVersion) return;
    storage.set("asked-version", storeVersion);
    Alert.alert(i18n.t("app.updateTitle"), i18n.t("app.updateMessage"), [
      { text: i18n.t("app.notNow"), style: "cancel" },
      {
        text: i18n.t("app.update"),
        isPreferred: true,
        onPress: () => void InAppUpdates.startUpdate().catch(() => undefined),
      },
    ]);
  } catch {
    // the store check is optional; offline or a store lookup error must never get in the way
  }
}
