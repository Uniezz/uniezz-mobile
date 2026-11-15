import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Icon, UIText } from "@/ui";

type CoinBalanceProps = {
  coins: number;
};

// the student's own balance under their name; opens the rewards screen
export const CoinBalance = ({ coins }: CoinBalanceProps) => {
  const { t } = useTranslation();
  const handlePress = () => router.push("/rewards");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t("rewards.balance")}: ${coins}`}
      onPress={handlePress}
      style={styles.pill}
    >
      <Icon
        name="star"
        size={14}
        uniProps={(theme) => ({ color: theme.colors.amber })}
      />
      <UIText size="sm" weight="semibold">
        {coins}
      </UIText>
      <Icon name="chevron-right" size={14} />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
    paddingVertical: theme.vs(6),
    paddingHorizontal: theme.s(12),
    borderRadius: theme.vs(999),
    borderWidth: 1,
    borderColor: theme.colors.amber30,
    backgroundColor: theme.colors.amber10,
  },
}));
