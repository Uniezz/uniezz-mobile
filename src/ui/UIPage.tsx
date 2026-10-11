import { ReactNode } from "react";
import { View, ViewProps } from "react-native";
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
    paddingTop: rt.insets.top,
    paddingBottom: rt.insets.bottom,
  },
}));
