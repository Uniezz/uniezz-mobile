import {
  BottomSheetBackdrop,
  BottomSheetHandle,
  BottomSheetModal,
  type BottomSheetBackdropProps,
  type BottomSheetHandleProps,
  type BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
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
      backgroundStyle={styles.background}
      maxDynamicContentSize={height * MAX_HEIGHT_RATIO}
      {...props}
    >
      {children}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create((theme) => ({
  background: {
    backgroundColor: theme.colors.surface,
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
