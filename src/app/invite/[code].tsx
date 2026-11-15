import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { useSession } from "@/contexts";
import { useRedeemInvite } from "@/hooks";
import { UIPage } from "@/ui";
import { apiErrorKey } from "@/utils";

// an invite link: a guest signs up with the code, a signed-in student applies it to their account
export default function InviteScreen() {
  const { t } = useTranslation();
  const { code = "" } = useLocalSearchParams<{ code?: string }>();
  const { session, isLoading } = useSession();
  const { mutate: redeem } = useRedeemInvite();
  // a link opens this screen once, but effects can run twice
  const hasRedeemed = useRef(false);

  useEffect(() => {
    if (isLoading || !session || hasRedeemed.current) return;
    hasRedeemed.current = true;
    redeem(
      { code },
      {
        // a paid redeem already shows the coin toast; 0 means this code was applied before
        onSuccess: ({ coinsEarned }) => {
          if (!coinsEarned) toast.success(t("rewards.redeemApplied"));
        },
        onError: (error) => toast.error(t(apiErrorKey(error))),
        onSettled: () => router.replace("/feed"),
      },
    );
  }, [code, isLoading, redeem, session, t]);

  if (!isLoading && !session) {
    return (
      <Redirect
        href={{ pathname: "/(auth)", params: { referralCode: code } }}
      />
    );
  }
  return (
    <UIPage style={styles.page}>
      <ActivityIndicator color="white" />
    </UIPage>
  );
}

const styles = StyleSheet.create({
  page: {
    alignItems: "center",
    justifyContent: "center",
  },
});
