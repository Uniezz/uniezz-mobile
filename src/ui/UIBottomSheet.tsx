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
import { Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { Icon } from "./icons";
import { SHEET_MAX_HEIGHT_RATIO } from "@/utils";
import { UIText } from "./UIText";

export type UIBottomSheetProps = {
  ref: Ref<BottomSheetModal>;
  title?: string;
  /** shows a back chevron left of the title, e.g. to leave a nested step */
  onBackPress?: () => void;
  backLabel?: string;
  children: ReactNode;
} & Omit<BottomSheetModalProps, "children">;

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.5}
    pressBehavior="close"
  />
);

// shortcut: Android shows only the translucent fill (no BlurTargetView behind the sheet), add one if Android needs real blur
const renderBackground = ({ style }: BottomSheetBackgroundProps) => (
  <BlurView intensity={80} tint="dark" style={[style, styles.background]} />
);

export const UIBottomSheet = ({
  ref,
  title,
  onBackPress,
  backLabel,
  children,
  ...props
}: UIBottomSheetProps) => {
  const { height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  // the title lives in the handle so dynamic sizing measures it
  const renderHandle = (handleProps: BottomSheetHandleProps) => (
    <BottomSheetHandle {...handleProps} indicatorStyle={styles.indicator}>
      {title ? (
        <View style={styles.titleRow}>
          {onBackPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={backLabel}
              onPress={onBackPress}
              hitSlop={12}
            >
              <Icon name="chevron-left" size={22} />
            </Pressable>
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
    backgroundColor: theme.colors.surface60,
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
