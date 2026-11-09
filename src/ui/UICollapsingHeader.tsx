import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet } from "react-native-unistyles";
import {
  HEADER_COLLAPSE_HEIGHT,
  HEADER_ROW_LIFT,
  HEADER_TITLE_LIFT,
  HEADER_TITLE_ORIGIN,
  HEADER_TITLE_SCALE,
  HEADER_TRANSITION,
} from "@/utils";
import { Icon } from "./icons";
import { UIIconButton } from "./UIIconButton";
import { UIText } from "./UIText";

type UICollapsingHeaderProps = {
  title: string;
  /** small line above the title; hidden once compact */
  subtitle?: string;
  /** compact once the list is scrolled: blurred backdrop, no subtitle, smaller title */
  isCompact: boolean;
  /** shows a back button before the title */
  onBackPress?: () => void;
  backLabel?: string;
  /** buttons after the title */
  actions?: ReactNode;
  onLayout: (event: LayoutChangeEvent) => void;
};

// a screen's pinned large-title header; switches between resting and compact with native (react-native-ease) animations
export const UICollapsingHeader = ({
  title,
  subtitle,
  isCompact,
  onBackPress,
  backLabel,
  actions,
  onLayout,
}: UICollapsingHeaderProps) => {
  // only a subtitle leaves room above the buttons for the row to rise into
  const rowLift = subtitle ? HEADER_ROW_LIFT : 0;
  // with a subtitle the title sits on the buttons' bottom edge and lifts to their centre when compact;
  // without one it is centred on them from the start
  const titleLift = subtitle ? HEADER_TITLE_LIFT : 0;

  return (
    <View style={styles.header} onLayout={onLayout}>
      {/* slides up rather than shrinking: Ease animates transforms, not layout; its top stays off-screen */}
      <EaseView
        animate={{
          opacity: isCompact ? 1 : 0,
          translateY: isCompact
            ? -(HEADER_COLLAPSE_HEIGHT - HEADER_ROW_LIFT + rowLift)
            : 0,
        }}
        transition={HEADER_TRANSITION}
        style={styles.backdrop}
      >
        <BlurView intensity={50} tint="dark" style={styles.blur} />
      </EaseView>
      <EaseView
        animate={{ translateY: isCompact ? -rowLift : 0 }}
        transition={HEADER_TRANSITION}
        style={styles.row(Boolean(subtitle))}
      >
        {onBackPress ? (
          <UIIconButton
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            onPress={onBackPress}
          >
            <Icon name="arrow-left" size={18} />
          </UIIconButton>
        ) : null}
        <View style={styles.title}>
          {subtitle ? (
            <EaseView
              animate={{
                opacity: isCompact ? 0 : 1,
                translateY: isCompact ? -4 : 0,
              }}
              transition={HEADER_TRANSITION}
            >
              <UIText size="sm" weight="medium" color="secondary">
                {subtitle}
              </UIText>
            </EaseView>
          ) : null}
          <EaseView
            animate={{
              translateY: isCompact ? -titleLift : 0,
              scale: isCompact ? HEADER_TITLE_SCALE : 1,
            }}
            transition={HEADER_TRANSITION}
            transformOrigin={HEADER_TITLE_ORIGIN}
          >
            <UIText
              size="title1"
              weight="bold"
              numberOfLines={1}
              style={styles.h1}
            >
              {title}
            </UIText>
          </EaseView>
        </View>
        {actions}
      </EaseView>
    </View>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    // only the buttons take touches; the strip the row vacates when compact passes them to the list
    pointerEvents: "box-none",
    paddingTop: rt.insets.top + theme.vs(4),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(12),
  },
  row: (hasSubtitle: boolean) => ({
    flexDirection: "row",
    alignItems: hasSubtitle ? "flex-end" : "center",
    gap: theme.s(8),
  }),
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.white5,
  },
  // light tint, so content stays visible, blurred, as it passes under the header
  // shortcut: Android shows only the ink tint (no BlurTargetView behind the list), add one if Android needs real blur
  blur: {
    flex: 1,
    backgroundColor: theme.colors.ink40,
  },
  title: {
    flex: 1,
    gap: theme.vs(4),
  },
  h1: {
    letterSpacing: -1,
    // ~1.2× the 26pt size: a line height equal to the font size makes iOS draw the glyphs high, off-centre from the buttons
    lineHeight: theme.vs(32),
  },
}));
