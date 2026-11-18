import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { StyleSheet } from "react-native-unistyles";
import { UIPressable, UICoin, UIGlass, UIText } from "@/ui";
import { formatCompactCount } from "@/utils";

type CoinBalanceProps = {
  coins: number;
};

// the student's balance in the profile header, styled like the glass menu button beside it; opens the rewards screen
export const CoinBalance = ({ coins }: CoinBalanceProps) => {
  const { t, i18n } = useTranslation();
  const handlePress = () => router.push("/rewards");

  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={`${t("rewards.balance")}: ${coins}`}
      onPress={handlePress}
    >
      <UIGlass radius={12} style={styles.button}>
        <UICoin size="sm" />
        <UIText weight="semibold">
          {formatCompactCount(coins, i18n.resolvedLanguage ?? i18n.language)}
        </UIText>
      </UIGlass>
    </UIPressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  // the same height as the 44pt menu button next to it
  button: {
    height: theme.vs(44),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
    paddingHorizontal: theme.s(12),
  },
}));
