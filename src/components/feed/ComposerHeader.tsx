import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { LayoutChangeEvent, Pressable, View } from "react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet } from "react-native-unistyles";
import { Icon, UIIconButton, UIText } from "@/ui";
import { HEADER_TRANSITION } from "@/utils";

type ComposerHeaderProps = {
  title: string;
  actionLabel: string;
  disabled: boolean;
  onAction: () => void;
  /** form scrolled: blurred backdrop behind the header */
  isScrolled: boolean;
  onLayout: (event: LayoutChangeEvent) => void;
};

// pinned over the form, with the same blurred backdrop as the profile header

export const ComposerHeader = ({
  title,
  actionLabel,
  disabled,
  onAction,
  isScrolled,
  onLayout,
}: ComposerHeaderProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.header} onLayout={onLayout}>
      <EaseView
        animate={{ opacity: isScrolled ? 1 : 0 }}
        transition={HEADER_TRANSITION}
        style={styles.backdrop}
      >
        <BlurView intensity={50} tint="dark" style={styles.blur} />
      </EaseView>
      <View style={styles.row}>
        <UIIconButton
          size="lg"
          accessibilityRole="button"
          accessibilityLabel={t("app.close")}
          onPress={() => router.back()}
        >
          <Icon
            name="x"
            size={18}
            uniProps={(theme) => ({ color: theme.colors.white80 })}
          />
        </UIIconButton>
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
    </View>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    pointerEvents: "box-none",
    paddingTop: rt.insets.top + theme.vs(8),
    paddingHorizontal: theme.s(20),
    paddingBottom: theme.vs(12),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.white5,
  },
  // shortcut: Android shows only the ink tint (no BlurTargetView behind the form), add one if Android needs real blur
  blur: {
    flex: 1,
    backgroundColor: theme.colors.ink40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
    height: theme.vs(44),
  },
  title: {
    flex: 1,
  },
  action: (disabled: boolean) => ({
    height: theme.vs(44),
    paddingHorizontal: theme.s(16),
    borderRadius: theme.vs(12),
    borderWidth: 1,
    borderColor: theme.colors.white20,
    justifyContent: "center",
    backgroundColor: disabled ? theme.colors.white40 : theme.colors.white,
  }),
}));
