import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { CoinGrant } from "@/@types";
import { UIText } from "@/ui";
import { COIN_GRANT_REASON_LABELS } from "@/utils";

type GrantRowProps = {
  grant: CoinGrant;
};

export const GrantRow = ({ grant }: GrantRowProps) => {
  const { t, i18n } = useTranslation();
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(grant.createdAt));

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <UIText weight="medium">
          {t(COIN_GRANT_REASON_LABELS[grant.reason] ?? "rewards.reasonOther")}
        </UIText>
        <UIText size="xs" color="secondary">
          {date}
        </UIText>
      </View>
      <UIText weight="semibold" style={styles.amount}>
        +{grant.amount}
      </UIText>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    paddingVertical: theme.vs(10),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.white8,
  },
  text: { flex: 1, gap: theme.vs(2) },
  amount: { color: theme.colors.amber },
}));
