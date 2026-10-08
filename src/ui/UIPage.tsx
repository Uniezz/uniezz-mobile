import { ReactNode } from "react";
import { View } from "react-native";
import { ViewProps } from "react-native-svg/lib/typescript/fabric/utils";
import { StyleSheet } from "react-native-unistyles";

type UIPageProps = {
  children?: ReactNode;
} & ViewProps;

export const UIPage = ({ children, style, ...props }: UIPageProps) => {
  return (
    <View style={[styles.page, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  page: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
    paddinTop: rt.insets.top,
    paddingBottom: rt.insets.bottom,
  },
}));
