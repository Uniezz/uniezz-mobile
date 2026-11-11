import { useState } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { FaqEntry } from "@/@types/faq";
import { Icon, UIGlass, UIText } from "@/ui";

export function FaqItem({ entry }: { entry: FaqEntry }) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePress = () => setIsOpen((open) => !open);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen }}
      onPress={handlePress}
    >
      <UIGlass radius={16} style={styles.card}>
        <View style={styles.question}>
          <UIText weight="semibold" style={styles.text}>
            {entry.question}
          </UIText>
          <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={16} />
        </View>
        {isOpen ? <UIText color="secondary">{entry.answer}</UIText> : null}
      </UIGlass>
    </Pressable>
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
}));
