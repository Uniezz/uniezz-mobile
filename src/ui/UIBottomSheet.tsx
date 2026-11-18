import {
  BottomSheetBackdrop,
  BottomSheetHandle,
  BottomSheetModal,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
  type BottomSheetHandleProps,
  type BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import type { ReactNode, Ref } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { Icon } from "./icons";
import { SHEET_MAX_HEIGHT_RATIO } from "@/utils";
import { UIPressable } from "./UIPressable";
import { UIText } from "./UIText";

export type UIBottomSheetProps = {
  ref: Ref<BottomSheetModal>;
  title?: string;
  /** shows a back chevron left of the title, e.g. to leave a nested step */
  onBackPress?: () => void;
  backLabel?: string;
  /** when set, swiping down is off and a backdrop tap calls this instead of closing, e.g. to confirm discarding a form */
  onDismissAttempt?: () => void;
  children: ReactNode;
} & Omit<BottomSheetModalProps, "children">;

// shortcut: Android shows only the translucent fill (no BlurTargetView behind the sheet), add one if Android needs real blur
const renderBackground = ({ style }: BottomSheetBackgroundProps) => (
  <BlurView intensity={80} tint="dark" style={[style, styles.background]} />
);

export const UIBottomSheet = ({
  ref,
  title,
  onBackPress,
  backLabel,
  onDismissAttempt,
  children,
  ...props
}: UIBottomSheetProps) => {
  const { height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const renderBackdrop = (backdropProps: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...backdropProps}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.5}
      // "none" drops the tap gesture and onPress with it; snapping to the open index 0 is a no-op that keeps both
      pressBehavior={onDismissAttempt ? 0 : "close"}
      onPress={onDismissAttempt}
    />
  );
  // the title lives in the handle so dynamic sizing measures it
  const renderHandle = (handleProps: BottomSheetHandleProps) => (
    <BottomSheetHandle {...handleProps} indicatorStyle={styles.indicator}>
      {title ? (
        <View style={styles.titleRow}>
          {onBackPress ? (
            <UIPressable
              accessibilityRole="button"
              accessibilityLabel={backLabel}
              onPress={onBackPress}
              hitSlop={12}
            >
              <Icon name="chevron-left" size={22} />
            </UIPressable>
          ) : null}
          <UIText size="lg" weight="semibold">
            {title}
          </UIText>
        </View>
      ) : null}
    </BottomSheetHandle>
  );

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={!onDismissAttempt}
      // a sideways swipe fails the sheet's pan, so horizontal rows inside (filter chips, photos) scroll on Android
      activeOffsetY={[-1, 1]}
      failOffsetX={[-5, 5]}
      handleComponent={renderHandle}
      backgroundComponent={renderBackground}
      maxDynamicContentSize={height * SHEET_MAX_HEIGHT_RATIO}
      // a keyboard can push the sheet up; it stops below the status bar
      topInset={top}
      {...props}
    >
      {children}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create((theme) => ({
  // strong blur of the screen behind, tinted so the sheet still reads as a surface
  background: {
    overflow: "hidden",
    // iOS blurs what's behind for real, which read too see-through; Android shows only this fill
    backgroundColor:
      Platform.OS === "ios" ? theme.colors.surface85 : theme.colors.surface,
    borderTopLeftRadius: theme.vs(28),
    borderTopRightRadius: theme.vs(28),
  },
  indicator: {
    backgroundColor: theme.colors.white40,
    width: theme.s(36),
  },
  titleRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
    paddingHorizontal: theme.s(8),
    paddingTop: theme.vs(12),
  },
}));
