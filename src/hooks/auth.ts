import { $api } from "@/api";
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

export function useExchangeLoginCode() {
  const { saveSession } = useSession();

  return $api.useMutation("post", "/auth/exchange", {
    onSuccess: async (session) => {
      try {
        await saveSession(session);
      } catch {
        showLoginError("Couldn’t save your session. Please sign in again.");
        router.dismissAll();
        router.replace("/(auth)");
        return;
      }

      router.dismissAll();
      router.replace("/feed");
    },
    onError: (error) => {
      showLoginError(
        error instanceof Error
          ? error.message
          : error?.error || "Please try again.",
      );
      router.dismissAll();
      router.replace("/(auth)");
    },
  });
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
      router.dismissAll();
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
