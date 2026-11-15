import ExpoQuickLook from "@magrinj/expo-quick-look";
import { Platform } from "react-native";
import { toast } from "sonner-native";
import i18n from "@/internationalization";

// iOS swipes through every image from `index`; previewFiles is iOS-only, so Android opens just that one
export const previewImages = async (urls: string[], index = 0) => {
  try {
    await (Platform.OS === "ios"
      ? ExpoQuickLook.previewFiles({
          uris: urls,
          initialIndex: index,
          editingMode: "disabled",
        })
      : ExpoQuickLook.previewFile({
          uri: urls[index] ?? "",
          editingMode: "disabled",
        }));
  } catch {
    toast.error(i18n.t("apiState.error"));
  }
};
