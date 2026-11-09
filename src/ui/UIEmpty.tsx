import LottieView from "lottie-react-native";
import { ReactNode } from "react";
import { View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { UIText } from "./UIText";

type UIEmptyProps = {
  /** the line under the cat */
  message?: string;
  /** richer content under the cat, e.g. a title and an action */
  children?: ReactNode;
  /** covers the page and centres there, so every screen shows the cat in the same place whatever its header holds;
   * render it as a direct child of UIPage (beside a list, not inside it) */
  isScreenCentred?: boolean;
};

// the uniezz-web empty state: the animated black cat over a short message
export const UIEmpty = ({
  message,
  children,
  isScreenCentred = false,
}: UIEmptyProps) => {
  const isReducedMotion = useReducedMotion();
  return (
    <View
      accessibilityRole="summary"
      pointerEvents={isScreenCentred ? "box-none" : "auto"}
      style={[styles.container, isScreenCentred && styles.screen]}
    >
      {/* holds still when the system asks for reduced motion */}
      <LottieView
        source={require("../../assets/animations/empty-cat.json")}
        autoPlay={!isReducedMotion}
        loop
        style={styles.cat}
      />
      {message ? (
        <UIText color="secondary" style={styles.message}>
          {message}
        </UIText>
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  // fills its parent (a list's content with flexGrow) and centres the cat in it
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.vs(12),
    paddingVertical: theme.vs(24),
    paddingHorizontal: theme.s(24),
  },
  screen: StyleSheet.absoluteFillObject,
  cat: {
    height: theme.vs(127),
    aspectRatio: 1495 / 805,
  },
  message: {
    textAlign: "center",
  },
}));
