import { usePostHog } from "posthog-react-native";
import { captureAction, getUsosStartUrl } from "@/utils";
import { $api, requestOtpCode, verifyOtpCode } from "@/api";
import { useMutation } from "@tanstack/react-query";
import type { IssuedSession } from "@/@types";
import { useSession } from "@/contexts";
import { router } from "expo-router";
import { toast } from "sonner-native";
import * as Linking from "expo-linking";
import { useEffect, useRef } from "react";
import { openAuthSessionAsync } from "expo-web-browser";
import { Platform } from "react-native";
import i18n from "@/internationalization";
import { useRegisterPushToken } from "./usePush";

const USOS_REDIRECT_URL = new URL(Linking.createURL("auth/callback"));

function showLoginError(messageKey: string): void {
  toast.error(i18n.t("auth.usosSignInError"), {
    description: i18n.t(messageKey),
  });
}

function useStartSession() {
  const { saveSession } = useSession();
  const { mutate: registerPushToken } = useRegisterPushToken();

  return async (session: IssuedSession) => {
    try {
      await saveSession(session);
    } catch {
      toast.error(i18n.t("auth.signInError"), {
        description: i18n.t("auth.sessionSaveError"),
      });
      router.replace("/(auth)");
      return;
    }
    registerPushToken();

    // onboarding sends a complete profile straight on to the feed
    router.replace("/onboarding");
  };
}

export function useExchangeLoginCode() {
  const startSession = useStartSession();

  return $api.useMutation("post", "/auth/exchange", {
    meta: { analyticsAction: "login_exchange" },
    onSuccess: startSession,
    onError: () => {
      showLoginError("common.tryAgain");
      router.replace("/(auth)");
    },
  });
}

export function useRequestOtpCode() {
  return useMutation({
    meta: { analyticsAction: "otp_request" },
    mutationFn: requestOtpCode,
  });
}

export function useVerifyOtpCode() {
  const startSession = useStartSession();

  return useMutation({
    meta: { analyticsAction: "otp_verify" },
    mutationFn: verifyOtpCode,
    onSuccess: startSession,
  });
}

export function useFinishLogin(code?: string, error?: string): void {
  const posthog = usePostHog();
  const { mutate: exchangeLoginCode } = useExchangeLoginCode();
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    if (hasHandledCallback.current) {
      return;
    }
    hasHandledCallback.current = true;

    if (error || !code) {
      captureAction(posthog, "login_callback", "failed");
      showLoginError(error ? "auth.usosSignInError" : "auth.missingLoginCode");
      router.replace("/(auth)");
      return;
    }

    exchangeLoginCode({ body: { code } });
  }, [code, error, exchangeLoginCode, posthog]);
}

// USOS sign-in in the system browser: ASWebAuthenticationSession on iOS, a Chrome Custom Tab on
// Android, where saved passwords work and the university's own page shows. iOS keeps the session
// ephemeral, so each sign-in starts clean; on Android it shares Chrome's cookies, which is fine as a
// USOS account belongs to one student. The backend sends the browser back to uniezz://auth/callback
export function useUsosSignIn() {
  return async (params: { university: string; referralCode?: string }) => {
    try {
      const result = await openAuthSessionAsync(
        getUsosStartUrl(params),
        USOS_REDIRECT_URL.href,
        { preferEphemeralSession: true },
      );
      // Android has no native auth session: the redirect reaches the app as a deep link, which
      // +native-intent already routes to /finish, so routing here too would spend the one-time code
      // twice. iOS hands the redirect only to this promise
      if (Platform.OS !== "ios" || result.type !== "success") return;
      const callback = new URL(result.url);
      router.push({
        pathname: "/finish",
        params: {
          code: callback.searchParams.get("code") ?? "",
          error: callback.searchParams.get("error") ?? "",
        },
      });
    } catch {
      showLoginError("common.tryAgain");
    }
  };
}
