import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import type { ReactNode, Ref } from "react";
import { View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { UIBottomSheet } from "./UIBottomSheet";
import { UIButton } from "./UIButton";
import { SHEET_FOOTER_FADE } from "@/utils";
import { UIText } from "./UIText";

// the device inset, not the screen's: inside a tab, useSafeAreaInsets() also counts the tab bar the sheet covers
const ThemedFooter = withUnistyles(BottomSheetFooter, (_theme, rt) => ({
  bottomInset: rt.insets.bottom,
}));

type UIFormSheetProps = {
  ref: Ref<BottomSheetModal>;
  title: string;
  actionLabel: string;
  isActionDisabled: boolean;
  onActionPress: () => void;
  /** optional red button left of the action, e.g. delete */
  destructiveLabel?: string;
  onDestructivePress?: () => void;
  /** back chevron left of the title, e.g. to leave a nested step */
  onBackPress?: () => void;
  backLabel?: string;
  /** e.g. reset the form, so a closed sheet drops unsaved edits */
  onDismiss?: () => void;
  /** e.g. confirm discarding a dirty form; while set the sheet does not close on its own */
  onDismissAttempt?: () => void;
  children: ReactNode;
};

// a bottom sheet holding a form: the fields scroll, the action button is the sheet footer, so it stays above the keyboard
export const UIFormSheet = ({
  ref,
  title,
  actionLabel,
  isActionDisabled,
  onActionPress,
  destructiveLabel,
  onDestructivePress,
  onBackPress,
  backLabel,
  onDismiss,
  onDismissAttempt,
  children,
}: UIFormSheetProps) => {
  const renderFooter = (props: BottomSheetFooterProps) => (
    <ThemedFooter {...props}>
      <View style={styles.footer}>
        {destructiveLabel ? (
          <UIButton
            size="rg"
            type="danger"
            onPress={onDestructivePress}
            style={styles.destructive}
          >
            <UIText size="md" weight="semibold">
              {destructiveLabel}
            </UIText>
          </UIButton>
        ) : null}
        <UIButton
          size="rg"
          disabled={isActionDisabled}
          onPress={onActionPress}
          style={styles.action}
        >
          <UIText size="md" color="black" weight="semibold">
            {actionLabel}
          </UIText>
        </UIButton>
      </View>
    </ThemedFooter>
  );

  return (
    <UIBottomSheet
      ref={ref}
      title={title}
      onBackPress={onBackPress}
      backLabel={backLabel}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      footerComponent={renderFooter}
      onDismiss={onDismiss}
      onDismissAttempt={onDismissAttempt}
    >
      <BottomSheetScrollView
        enableFooterMarginAdjustment
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {children}
      </BottomSheetScrollView>
    </UIBottomSheet>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  content: {
    gap: theme.vs(14),
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
    paddingBottom: rt.insets.bottom,
  },
  // fades the scrolled form out behind the button
  footer: {
    flexDirection: "row",
    gap: theme.s(10),
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(SHEET_FOOTER_FADE),
    // the fill runs on under the home indicator inset, so fields scrolled below the button stay hidden
    paddingBottom: theme.vs(12) + rt.insets.bottom,
    marginBottom: -rt.insets.bottom,
    experimental_backgroundImage: `linear-gradient(to bottom, ${theme.colors.surface0}, ${theme.colors.surface} 40%)`,
  },
  destructive: {
    width: "auto",
    paddingHorizontal: theme.s(24),
  },
  action: {
    flex: 1,
    width: "auto",
  },
}));
