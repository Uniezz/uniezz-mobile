import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback } from "react";
import { StyleSheet } from "react-native-unistyles";

type UIBottomSheetProps = {
  children: React.ReactNode;
  backdropPressBehavior?: "none" | "close" | "collapse";
} & Partial<BottomSheetModalProps>;

export const UIBottomSheet = forwardRef<BottomSheetModal, UIBottomSheetProps>(
  ({ children, backdropPressBehavior = "close", ...props }, ref) => {
    const renderBackdrop = useCallback(
      (backdropProps: any) => (
        <BottomSheetBackdrop
          {...backdropProps}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
          pressBehavior={backdropPressBehavior}
        />
      ),
      [backdropPressBehavior],
    );
    return (
      <BottomSheetModal
        ref={ref}
        index={1}
        snapPoints={["40%"]}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.contentContainer}
        handleIndicatorStyle={styles.handleIndicator}
        {...props}
      >
        <BottomSheetView style={styles.contentContainer}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

UIBottomSheet.displayName = "UIBottomSheet";

const styles = StyleSheet.create((theme) => ({
  contentContainer: {
    borderTopLeftRadius: theme.vs(40),
    borderTopRightRadius: theme.vs(40),
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.vs(20),
    paddingHorizontal: theme.vs(30),
  },
  handleIndicator: {
    backgroundColor: theme.colors.primary,
  },
}));
