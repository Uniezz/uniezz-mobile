import { AuthWordmark } from "./AuthWordmark";
import { UIPage, UIText } from "@/ui";
import { ReactNode } from "react";
import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

const headlineEntering = FadeInDown.duration(380).delay(70);

type AuthPageProps = {
  children: ReactNode;
  topText: string;
  bottomText: string;
};

export const AuthPage = ({ children, topText, bottomText }: AuthPageProps) => {
  return (
    <UIPage backdrop="glow" style={styles.page}>
      <AuthWordmark />
      <KeyboardAvoidingView behavior="padding" style={styles.body}>
        <View style={styles.grow} />
        <Animated.View entering={headlineEntering} style={styles.head}>
          <UIText weight="bold" size="xxl">
            {topText}
          </UIText>
          <UIText color="soft" style={styles.sub}>
            {bottomText}
          </UIText>
        </Animated.View>
        {children}
      </KeyboardAvoidingView>
    </UIPage>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  page: {
    paddingHorizontal: theme.s(20),
    paddingTop: rt.insets.top + theme.vs(12),
  },
  body: {
    flex: 1,
  },
  grow: {
    flex: 1,
    minHeight: theme.vs(24),
  },
  head: {
    gap: theme.vs(8),
    paddingHorizontal: theme.s(4),
    paddingBottom: theme.vs(20),
  },
  sub: {
    lineHeight: theme.vs(15 * 1.45),
  },
}));
