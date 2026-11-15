import { AuthWordmark } from "./AuthWordmark";
import { LanguagePicker } from "@/components/LanguagePicker";
import { UIPage, UIText } from "@/ui";
import { ReactNode } from "react";
import { Keyboard, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

const headlineEntering = FadeInDown.duration(380).delay(70);

type AuthPageProps = {
  children: ReactNode;
  topText: string;
  bottomText: string;
  /** small caps line above the headline, e.g. onboarding's step */
  labelText?: string;
  /** headline under the top bar and content filling the page, which then handles the keyboard itself (e.g. onboarding) */
  isTopAligned?: boolean;
};

export const AuthPage = ({
  children,
  topText,
  bottomText,
  labelText,
  isTopAligned,
}: AuthPageProps) => {
  return (
    <UIPage style={styles.page}>
      <View style={styles.topBar}>
        <AuthWordmark />
        <LanguagePicker />
      </View>
      <KeyboardAvoidingView
        behavior="padding"
        enabled={!isTopAligned}
        style={styles.body}
      >
        <View style={isTopAligned ? styles.top : styles.grow} />
        {/* a tap on the headline closes the keyboard, as it sits outside any scroll view */}
        <Animated.View
          entering={headlineEntering}
          onTouchStart={Keyboard.dismiss}
          style={styles.head}
        >
          {labelText ? (
            <UIText size="xs" weight="semibold" style={styles.label}>
              {labelText}
            </UIText>
          ) : null}
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
    paddingTop: rt.insets.top + theme.vs(12),
  },
  body: {
    flex: 1,
    paddingHorizontal: theme.s(20),
  },
  topBar: {
    paddingHorizontal: theme.s(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  top: {
    height: theme.vs(24),
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
  label: {
    color: theme.colors.sky,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  sub: {
    lineHeight: theme.vs(15 * 1.45),
  },
}));
