import { ReactNode } from "react";
import { Image } from "expo-image";
import { View, ViewProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type UIPageProps = {
  children?: ReactNode;
} & ViewProps;

export const UIPage = ({ children, style, ...props }: UIPageProps) => {
  return (
    <View style={[styles.page, style]} {...props}>
      <Image
        source={require("../../assets/auth/sign-in-backdrop.png")}
        style={styles.backdrop}
        contentFit="contain"
        contentPosition="top center"
        pointerEvents="none"
        accessible={false}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    aspectRatio: 393 / 550,
  },
  page: {
    flex: 1,
    backgroundColor: theme.colors.ink,
    paddingTop: rt.insets.top,
    paddingBottom: rt.insets.bottom,
  },
}));
