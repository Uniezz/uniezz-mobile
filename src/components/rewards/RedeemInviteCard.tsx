import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { RedeemInviteFormValues } from "@/@types";
import { useRedeemInvite } from "@/hooks";
import { redeemInviteSchema } from "@/schemas";
import { UIButton, UIGlass, UIInput, UIText } from "@/ui";
import { apiErrorKey } from "@/utils";

// a friend's invitation code, for a new account that didn't sign up through the link
export const RedeemInviteCard = () => {
  const { t } = useTranslation();
  const { mutateAsync: redeem, isPending } = useRedeemInvite();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<RedeemInviteFormValues>({
    resolver: zodResolver(redeemInviteSchema),
    defaultValues: { code: "" },
    mode: "onChange",
  });

  const handleApplyPress = handleSubmit(async ({ code }) => {
    try {
      const { coinsEarned } = await redeem({ code });
      reset();
      // a paid redeem already shows the coin toast; 0 means this code was applied before
      if (!coinsEarned) toast.success(t("rewards.redeemApplied"));
    } catch (error) {
      toast.error(t(apiErrorKey(error)));
    }
  });

  return (
    <UIGlass radius={16} style={styles.card}>
      <View style={styles.text}>
        <UIText weight="semibold">{t("rewards.redeemTitle")}</UIText>
        <UIText size="sm" color="secondary">
          {t("rewards.redeemHint")}
        </UIText>
      </View>
      <View style={styles.form}>
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <UIInput
              accessibilityLabel={t("rewards.redeemTitle")}
              placeholder="A1B2C3D"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              onSubmitEditing={handleApplyPress}
              maxLength={7}
              returnKeyType="done"
              style={styles.input}
            />
          )}
        />
        <UIButton
          type="secondary"
          radius="sm"
          disabled={!isValid || isPending}
          onPress={handleApplyPress}
        >
          <UIText weight="semibold">{t("rewards.redeemSubmit")}</UIText>
        </UIButton>
      </View>
    </UIGlass>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.vs(12),
    padding: theme.s(16),
  },
  text: {
    gap: theme.vs(4),
  },
  form: {
    gap: theme.vs(8),
  },
  input: {
    letterSpacing: 2,
  },
}));
