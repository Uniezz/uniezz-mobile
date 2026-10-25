import { ReactNode } from "react";
import { View, ViewProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIBackdrop, UIBackdropVariant } from "./UIBackdrop";

type UIPageProps = {
  children?: ReactNode;
  backdrop?: UIBackdropVariant;
} & ViewProps;

export const UIPage = ({
  children,
  backdrop,
  style,
  ...props
}: UIPageProps) => {
  return (
    <View style={[styles.page, style]} {...props}>
      {backdrop ? <UIBackdrop variant={backdrop} /> : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  page: {
    flex: 1,
    backgroundColor: theme.colors.ink,
    paddingTop: rt.insets.top,
    paddingBottom: rt.insets.bottom,
  },
}));
