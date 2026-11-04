import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Icon, UIText } from "@/ui";

type ComposerHeaderProps = {
  title: string;
  actionLabel: string;
  disabled: boolean;
  onAction: () => void;
};

export const ComposerHeader = ({
  title,
  actionLabel,
  disabled,
  onAction,
}: ComposerHeaderProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("app.close")}
        onPress={() => router.back()}
        style={styles.close}
      >
        <Icon name="x" size={18} />
      </Pressable>
      <UIText size="md" weight="semibold" style={styles.title}>
        {title}
      </UIText>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onAction}
        style={styles.action(disabled)}
      >
        <UIText weight="semibold" color="black">
          {actionLabel}
        </UIText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
    height: theme.vs(44),
  },
  close: {
    width: theme.vs(44),
    height: theme.vs(44),
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
  },
  action: (disabled: boolean) => ({
    height: theme.vs(36),
    paddingHorizontal: theme.s(16),
    borderRadius: theme.vs(999),
    justifyContent: "center",
    backgroundColor: disabled ? theme.colors.white40 : theme.colors.white,
  }),
}));
