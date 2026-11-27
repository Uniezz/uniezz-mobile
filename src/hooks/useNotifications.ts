import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AndroidImportance,
  getPermissionsAsync,
  IosAuthorizationStatus,
  requestPermissionsAsync,
  setNotificationChannelAsync,
} from "expo-notifications";
import { Platform } from "react-native";
import i18n from "@/internationalization";
import { useRegisterPushToken } from "./usePush";

// stale at once, so coming back from the system settings reads the switch again
export function useNotificationPermission() {
  const query = useQuery({
    staleTime: 0,
    gcTime: 5 * 60_000,
    queryKey: ["notifications", "permission"],
    queryFn: getPermissionsAsync,
  });
  const permission = query.data;
  return {
    ...query,
    isEnabled:
      permission?.granted === true ||
      permission?.ios?.status === IosAuthorizationStatus.PROVISIONAL,
    // the system shows its prompt only once; after that only the settings can change it
    canAsk: permission?.status === "undetermined" && permission.canAskAgain,
  };
}

// once allowed, the device's push token goes to the API right away
export function useRequestNotificationPermission() {
  const queryClient = useQueryClient();
  const { mutate: registerPushToken } = useRegisterPushToken();
  return useMutation({
    meta: { analyticsAction: "notifications_enable" },
    mutationFn: async () => {
      // Android 13+ shows the prompt only once the app has a channel
      if (Platform.OS === "android") {
        await setNotificationChannelAsync("default", {
          name: i18n.t("topbar.notifications"),
          importance: AndroidImportance.DEFAULT,
        });
      }
      return requestPermissionsAsync();
    },
    onSuccess: (permission) => {
      queryClient.setQueryData(["notifications", "permission"], permission);
      if (permission.granted) registerPushToken();
    },
  });
}
