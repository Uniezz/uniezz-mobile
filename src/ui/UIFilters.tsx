import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { ReactNode, RefObject } from "react";
import { StyleSheet } from "react-native-unistyles";
import { UIBottomSheet } from "./UIBottomSheet";
import { UIFormSheet } from "./UIFormSheet";
import { UIIconButton } from "./UIIconButton";
import { Icon } from "./icons";

type UIFiltersProps = {
  /** also opens the sheet from elsewhere, e.g. an empty state's button */
  ref: RefObject<BottomSheetModal | null>;
  title: string;
  /** e.g. resets the sheet's form to the applied filters */
  onOpen?: () => void;
  /** e.g. applies the sheet's form */
  onClose?: () => void;
  /** a button pinned above the keyboard, for sheets that also hold inputs */
  action?: { label: string; isDisabled: boolean; onPress: () => void };
  /** the filter rows, usually UIFilterRow */
  children: ReactNode;
};

// the filters button and the sheet it opens; each screen passes its own filters as children
export const UIFilters = ({
  ref,
  title,
  onOpen,
  onClose,
  action,
  children,
}: UIFiltersProps) => {
  const handlePress = () => {
    onOpen?.();
    ref.current?.present();
  };

  return (
    <>
      <UIIconButton
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={handlePress}
      >
        <Icon name="sliders-horizontal" size={18} />
      </UIIconButton>
      {action ? (
        <UIFormSheet
          ref={ref}
          title={title}
          actionLabel={action.label}
          isActionDisabled={action.isDisabled}
          onActionPress={action.onPress}
          onDismiss={onClose}
        >
          {children}
        </UIFormSheet>
      ) : (
        <UIBottomSheet ref={ref} title={title} onDismiss={onClose}>
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {children}
          </BottomSheetScrollView>
        </UIBottomSheet>
      )}
    </>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  // the same insets as UIFormSheet, so rows look alike in both
  content: {
    gap: theme.vs(12),
    paddingHorizontal: theme.s(16),
    paddingBottom: rt.insets.bottom + theme.vs(16),
  },
}));
