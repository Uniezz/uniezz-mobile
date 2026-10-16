import { exchangeLoginCode } from "@/api";
import { useSession } from "@/contexts";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import * as Linking from "expo-linking";
import { useRef } from "react";
import type { WebViewNavigation } from "react-native-webview";
import type { ExchangeLoginCodeBody } from "@/@types/auth";
import { getErrorMessage } from "@/utils";

const USOS_REDIRECT_URL = Linking.createURL("auth/callback");

export function useExchangeLoginCode() {
  const { saveSession } = useSession();

  return useMutation({
    mutationFn: (body: ExchangeLoginCodeBody) => exchangeLoginCode(body),
    onSuccess: async (session) => {
      router.dismissAll();
      await saveSession(session);
      router.replace("/feed");
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Couldn’t sign in with USOS.",
        text2: getErrorMessage(error),
      });
      router.dismissAll();
      router.replace("/(auth)");
    },
  });
}

export function useUsosLogin(): (navigation: WebViewNavigation) => boolean {
  const hasHandledRedirect = useRef(false);

  return (navigation: WebViewNavigation): boolean => {
    if (!navigation.url.startsWith(USOS_REDIRECT_URL)) {
      return true;
    }

    if (hasHandledRedirect.current) {
      return false;
    }
    hasHandledRedirect.current = true;

    const callbackUrl = new URL(navigation.url);
    router.replace({
      pathname: "/finish",
      params: {
        code: callbackUrl.searchParams.get("code") ?? "",
        error: callbackUrl.searchParams.get("error") ?? "",
      },
    });
    return false;
  };
}
