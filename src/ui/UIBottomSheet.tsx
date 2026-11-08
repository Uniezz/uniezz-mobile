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
import { useWindowDimensions } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIText } from "./UIText";

export type UIBottomSheetProps = {
  ref: Ref<BottomSheetModal>;
  title?: string;
  children: ReactNode;
} & Omit<BottomSheetModalProps, "children">;

const MAX_HEIGHT_RATIO = 0.8;

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
  children,
  ...props
}: UIBottomSheetProps) => {
  const { height } = useWindowDimensions();
  // the title lives in the handle so dynamic sizing measures it
  const renderHandle = (handleProps: BottomSheetHandleProps) => (
    <BottomSheetHandle {...handleProps} indicatorStyle={styles.indicator}>
      {title ? (
        <UIText size="lg" weight="semibold" style={styles.title}>
          {title}
        </UIText>
      ) : null}
    </BottomSheetHandle>
  );

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      backgroundComponent={renderBackground}
      maxDynamicContentSize={height * MAX_HEIGHT_RATIO}
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
  title: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.s(8),
    paddingTop: theme.vs(12),
  },
}));
