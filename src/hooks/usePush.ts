import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import {
  clearLastNotificationResponse,
  DEFAULT_ACTION_IDENTIFIER,
  getExpoPushTokenAsync,
  getPermissionsAsync,
  useLastNotificationResponse,
} from "expo-notifications";
import { router, useSegments } from "expo-router";
import { useEffect } from "react";
import { $api, registerMyPushToken } from "@/api";

const projectId: string | undefined =
  Constants.expoConfig?.extra?.eas?.projectId;

// the server switch for every push to the student's devices, apart from the system permission
export const useMyPushSettings = () =>
  $api.useQuery("get", "/push/settings/me", undefined, {
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

export function useUpdateMyPushSettings() {
  const queryClient = useQueryClient();
  return $api.useMutation("patch", "/push/settings/me", {
    meta: { analyticsAction: "push_settings_update" },
    onSuccess: (settings) =>
      queryClient.setQueryData(
        $api.queryOptions("get", "/push/settings/me").queryKey,
        settings,
      ),
  });
}

// before signing out, so the device stops getting the account's pushes; already gone succeeds
export const useDeleteMyPushToken = () =>
  $api.useMutation("delete", "/push/tokens/me", {
    meta: { analyticsAction: "push_token_delete" },
  });

// the device's Expo token reaches the API after sign-in, on every start with a stored session and
// once notifications are allowed; registering on each start also covers a token Expo replaced.
// Without permission (or on a simulator, which has no token) it does nothing
export function useRegisterPushToken() {
  return useMutation({
    meta: { analyticsAction: "push_token_register" },
    mutationFn: async () => {
      const { granted } = await getPermissionsAsync();
      if (!granted || !projectId) return;
      const { data: token } = await getExpoPushTokenAsync({ projectId });
      await registerMyPushToken(token);
    },
  });
}

// a tap on a push opens the chat, or the profile of a new match, also when it started the app.
// With no notification handler set, pushes show only outside the app, where the open app already
// gets everything through the chat stream
export function useNotificationTaps(sessionToken: string | undefined) {
  const response = useLastNotificationResponse();
  // no segments: the splash route, which replaces itself with the feed when its intro ends and
  // would replace a chat opened before that; the tap waits for it and opens on top of the feed
  const isPastSplash = useSegments().length > 0;

  useEffect(() => {
    if (
      !sessionToken ||
      !isPastSplash ||
      !response ||
      response.actionIdentifier !== DEFAULT_ACTION_IDENTIFIER
    )
      return;
    clearLastNotificationResponse();
    const { conversationId, userId } =
      response.notification.request.content.data ?? {};
    if (typeof conversationId === "string") {
      router.push({ pathname: "/chat/[id]", params: { id: conversationId } });
    } else if (typeof userId === "string") {
      router.push({ pathname: "/student/[id]", params: { id: userId } });
    }
  }, [sessionToken, isPastSplash, response]);
}
