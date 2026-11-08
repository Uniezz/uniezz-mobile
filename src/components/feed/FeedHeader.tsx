import { BlurView } from "expo-blur";
import { useTranslation } from "react-i18next";
import { LayoutChangeEvent, Pressable, View } from "react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet } from "react-native-unistyles";
import { Icon, UIAvatar, UIIconButton, UIText } from "@/ui";
import {
  FEED_HEADER_COLLAPSE_HEIGHT,
  FEED_HEADER_ROW_LIFT,
  FEED_HEADER_TITLE_LIFT,
  FEED_HEADER_TITLE_ORIGIN,
  FEED_HEADER_TITLE_SCALE,
  FEED_HEADER_TRANSITION,
} from "@/utils";

type FeedHeaderProps = {
  /** compact once the feed is scrolled: blurred backdrop, no subtitle, smaller title */
  isCompact: boolean;
  avatarUrl?: string | null;
  onLayout: (event: LayoutChangeEvent) => void;
  onSearchPress: () => void;
  onFiltersPress: () => void;
  onProfilePress: () => void;
};

// pinned over the feed; switches between resting and compact with native (react-native-ease) animations
export const FeedHeader = ({
  isCompact,
  avatarUrl,
  onLayout,
  onSearchPress,
  onFiltersPress,
  onProfilePress,
}: FeedHeaderProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.header} onLayout={onLayout}>
      {/* slides up rather than shrinking: Ease animates transforms, not layout; its top stays off-screen */}
      <EaseView
        animate={{
          opacity: isCompact ? 1 : 0,
          translateY: isCompact ? -FEED_HEADER_COLLAPSE_HEIGHT : 0,
        }}
        transition={FEED_HEADER_TRANSITION}
        style={styles.backdrop}
      >
        <BlurView intensity={50} tint="dark" style={styles.blur} />
      </EaseView>
      <EaseView
        animate={{ translateY: isCompact ? -FEED_HEADER_ROW_LIFT : 0 }}
        transition={FEED_HEADER_TRANSITION}
        style={styles.row}
      >
        <View style={styles.title}>
          <EaseView
            animate={{
              opacity: isCompact ? 0 : 1,
              translateY: isCompact ? -4 : 0,
            }}
            transition={FEED_HEADER_TRANSITION}
          >
            <UIText size="sm" weight="medium" color="secondary">
              {t("app.feedSubtitle")}
            </UIText>
          </EaseView>
          <EaseView
            animate={{
              translateY: isCompact ? -FEED_HEADER_TITLE_LIFT : 0,
              scale: isCompact ? FEED_HEADER_TITLE_SCALE : 1,
            }}
            transition={FEED_HEADER_TRANSITION}
            transformOrigin={FEED_HEADER_TITLE_ORIGIN}
          >
            <UIText size="title1" weight="bold" style={styles.h1}>
              {t("tabs.feed")}
            </UIText>
          </EaseView>
        </View>
        <UIIconButton
          accessibilityRole="button"
          accessibilityLabel={t("topbar.search")}
          onPress={onSearchPress}
        >
          <Icon name="search" size={18} />
        </UIIconButton>
        <UIIconButton
          accessibilityRole="button"
          accessibilityLabel={t("feed.filtersTitle")}
          onPress={onFiltersPress}
        >
          <Icon name="sliders-horizontal" size={18} />
        </UIIconButton>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("app.profile")}
          onPress={onProfilePress}
        >
          <UIAvatar imageSrc={avatarUrl} />
        </Pressable>
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
    // only the buttons take touches; the strip the row vacates when compact passes them to the feed
    pointerEvents: "box-none",
    paddingTop: rt.insets.top + theme.vs(4),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(12),
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.s(8),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.white5,
  },
  // light tint, so posts stay visible, blurred, as they pass under the header
  // shortcut: Android shows only the ink tint (no BlurTargetView behind the feed), add one if Android needs real blur
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
    lineHeight: theme.vs(26),
  },
}));
