import { $api, requestOtpCode, verifyOtpCode } from "@/api";
import { useMutation } from "@tanstack/react-query";
import type { IssuedSession } from "@/@types/auth";
import { useSession } from "@/contexts";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useRef } from "react";
import type { WebViewNavigation } from "react-native-webview";

const USOS_REDIRECT_URL = new URL(Linking.createURL("auth/callback"));

function showLoginError(message: string): void {
  Toast.show({
    type: "error",
    text1: "Couldn’t sign in with USOS.",
    text2: message,
  });
}

function useStartSession() {
  const { saveSession } = useSession();

  return async (session: IssuedSession) => {
    try {
      await saveSession(session);
    } catch {
      Toast.show({
        type: "error",
        text1: "Couldn’t sign in.",
        text2: "Couldn’t save your session. Please sign in again.",
      });
      router.replace("/(auth)");
      return;
    }

    router.replace("/feed");
  };
}

export function useExchangeLoginCode() {
  const startSession = useStartSession();

  return $api.useMutation("post", "/auth/exchange", {
    onSuccess: startSession,
    onError: (error) => {
      showLoginError(
        error instanceof Error
          ? error.message
          : error?.error || "Please try again.",
      );
      router.replace("/(auth)");
    },
  });
}

export function useRequestOtpCode() {
  return useMutation({ mutationFn: requestOtpCode });
}

export function useVerifyOtpCode() {
  const startSession = useStartSession();

  return useMutation({ mutationFn: verifyOtpCode, onSuccess: startSession });
}

export function useFinishLogin(code?: string, error?: string): void {
  const { mutate: exchangeLoginCode } = useExchangeLoginCode();
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    if (hasHandledCallback.current) {
      return;
    }
    hasHandledCallback.current = true;

    if (error || !code) {
      showLoginError(error || "The sign-in redirect did not include a code.");
      router.replace("/(auth)");
      return;
    }

    exchangeLoginCode({ body: { code } });
  }, [code, error, exchangeLoginCode]);
}

export function useUsosLogin(): (navigation: WebViewNavigation) => boolean {
  const hasHandledRedirect = useRef(false);

  return useCallback((navigation: WebViewNavigation): boolean => {
    let callbackUrl: URL;
    try {
      callbackUrl = new URL(navigation.url);
    } catch {
      return true;
    }

    if (
      callbackUrl.protocol !== USOS_REDIRECT_URL.protocol ||
      callbackUrl.host !== USOS_REDIRECT_URL.host ||
      callbackUrl.pathname !== USOS_REDIRECT_URL.pathname
    ) {
      return true;
    }

    if (hasHandledRedirect.current) {
      return false;
    }
    hasHandledRedirect.current = true;

    router.replace({
      pathname: "/finish",
      params: {
        code: callbackUrl.searchParams.get("code") ?? "",
        error: callbackUrl.searchParams.get("error") ?? "",
      },
    });
    return false;
  }, []);
}
