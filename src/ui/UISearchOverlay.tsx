import { BlurView } from "expo-blur";
import { Keyboard } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { UISearch } from "./UISearch";

type UISearchOverlayProps = {
  isOpen: boolean;
  value: string;
  onChangeText: (value: string) => void;
  /** runs the search; only on submit, not per keystroke */
  onSubmit: () => void;
  /** the field lost focus; the screen closes the overlay */
  onClose: () => void;
  placeholder: string;
  submitLabel: string;
};

// a search field pinned above the keyboard over a blurred screen
export const UISearchOverlay = ({
  isOpen,
  value,
  onChangeText,
  onSubmit,
  onClose,
  placeholder,
  submitLabel,
}: UISearchOverlayProps) =>
  isOpen ? (
    <>
      {/* touching the blurred screen (tap or scroll) dismisses the keyboard, which closes the overlay */}
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.backdrop}
        onTouchStart={Keyboard.dismiss}
      >
        <BlurView intensity={40} tint="dark" style={styles.blur} />
      </Animated.View>
      <KeyboardStickyView style={styles.bar}>
        <UISearch
          autoFocus
          returnKeyType="search"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onSubmit={onSubmit}
          submitLabel={submitLabel}
          onBlur={onClose}
        />
      </KeyboardStickyView>
    </>
  ) : null;

const styles = StyleSheet.create((theme) => ({
  // above a pinned header (zIndex 1), so search blurs the whole screen
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  // shortcut: Android shows only the ink tint (no BlurTargetView around the screen), add one if Android needs real blur
  blur: {
    flex: 1,
    backgroundColor: theme.colors.ink40,
  },
  // pinned to the bottom, so the keyboard lifts it to sit just above the keys
  bar: {
    position: "absolute",
    zIndex: 3,
    left: theme.s(16),
    right: theme.s(16),
    bottom: theme.vs(8),
  },
}));
