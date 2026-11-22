import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { FaqEntry } from "@/@types";
import { UIPressable, Icon, UIGlass, UIText } from "@/ui";
import { FAQ_STATUS_LABELS } from "@/utils";

type FaqItemProps = {
  entry: FaqEntry;
  /** for the student's own proposals: pending, published or rejected */
  hasStatus?: boolean;
};

export function FaqItem({ entry, hasStatus }: FaqItemProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handlePress = () => setIsOpen((open) => !open);

  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen }}
      onPress={handlePress}
    >
      <UIGlass radius={16} style={styles.card}>
        <View style={styles.question}>
          <UIText weight="semibold" style={styles.text}>
            {entry.question}
          </UIText>
          {hasStatus ? (
            <UIText
              size="xs"
              weight="semibold"
              color="secondary"
              style={styles.status}
            >
              {t(FAQ_STATUS_LABELS[entry.status])}
            </UIText>
          ) : null}
          <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={16} />
        </View>
        {isOpen ? <UIText color="secondary">{entry.answer}</UIText> : null}
      </UIGlass>
    </UIPressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.vs(8),
    padding: theme.s(14),
  },
  question: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
  },
  text: { flex: 1 },
  status: {
    paddingHorizontal: theme.s(8),
    paddingVertical: theme.vs(3),
    borderRadius: theme.vs(12),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
    overflow: "hidden",
  },
}));
