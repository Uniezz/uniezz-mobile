import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LayoutChangeEvent, View } from "react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet } from "react-native-unistyles";
import { useUniversities } from "@/hooks/useUniversities";
import { Icon, UIAvatar, UIIconButton, UIText, UIUniversityLogo } from "@/ui";
import { HEADER_TRANSITION, PROFILE_HEADER_TITLE_SHIFT } from "@/utils";

type ProfileHeaderProps = {
  title: string;
  /** shown instead of the title once scrolled */
  name: string;
  avatarUrl?: string | null;
  /** shown with its logo under the name */
  universityId?: string;
  /** list scrolled: blurred backdrop, name instead of the title */
  isScrolled: boolean;
  /** right side, e.g. the edit/save button */
  action?: ReactNode;
  onLayout: (event: LayoutChangeEvent) => void;
  onBackPress: () => void;
};

// pinned over the profile list, with the same blurred backdrop as the feed header
export const ProfileHeader = ({
  title,
  name,
  avatarUrl,
  universityId,
  isScrolled,
  action,
  onLayout,
  onBackPress,
}: ProfileHeaderProps) => {
  const { t } = useTranslation();
  const { data: universities = [] } = useUniversities();
  const universityName = universities.find(
    ({ id }) => id === universityId,
  )?.name;

  return (
    <View style={styles.header} onLayout={onLayout}>
      <EaseView
        animate={{ opacity: isScrolled ? 1 : 0 }}
        transition={HEADER_TRANSITION}
        style={styles.backdrop}
      >
        <BlurView intensity={50} tint="dark" style={styles.blur} />
      </EaseView>
      <View style={styles.row}>
        <UIIconButton
          accessibilityRole="button"
          accessibilityLabel={t("app.back")}
          onPress={onBackPress}
        >
          <Icon name="arrow-left" size={18} />
        </UIIconButton>
        <View style={styles.titles}>
          <EaseView
            animate={{
              opacity: isScrolled ? 0 : 1,
              translateY: isScrolled ? -PROFILE_HEADER_TITLE_SHIFT : 0,
            }}
            transition={HEADER_TRANSITION}
            style={styles.title}
          >
            <UIText weight="semibold" numberOfLines={1}>
              {title}
            </UIText>
          </EaseView>
          <EaseView
            animate={{
              opacity: isScrolled ? 1 : 0,
              translateY: isScrolled ? 0 : PROFILE_HEADER_TITLE_SHIFT,
            }}
            transition={HEADER_TRANSITION}
            style={[styles.title, styles.person]}
          >
            <UIAvatar size="sm" imageSrc={avatarUrl} />
            <View style={styles.personText}>
              <UIText weight="semibold" numberOfLines={1}>
                {name}
              </UIText>
              {universityId ? (
                <View style={styles.university}>
                  <UIUniversityLogo id={universityId} size="xxs" />
                  <UIText
                    size="xs"
                    weight="medium"
                    color="secondary"
                    numberOfLines={1}
                    style={styles.universityName}
                  >
                    {universityName ?? universityId.toUpperCase()}
                  </UIText>
                </View>
              ) : null}
            </View>
          </EaseView>
        </View>
        {action}
      </View>
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
    pointerEvents: "box-none",
    paddingTop: rt.insets.top + theme.vs(4),
    paddingHorizontal: theme.s(20),
    paddingBottom: theme.vs(12),
  },
  backdrop: StyleSheet.absoluteFillObject,
  // shortcut: Android shows only the ink tint (no BlurTargetView behind the list), add one if Android needs real blur
  blur: {
    flex: 1,
    backgroundColor: theme.colors.ink40,
  },
  row: {
    height: theme.vs(44),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(14),
  },
  titles: {
    flex: 1,
    height: "100%",
    overflow: "hidden",
  },
  // both titles share the slot and crossfade
  title: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    gap: theme.vs(2),
  },
  person: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
  },
  // flex: 1 bounds the width so long names and universities end with "…"
  personText: {
    flex: 1,
    gap: theme.vs(2),
  },
  university: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
  },
  universityName: {
    flexShrink: 1,
  },
}));
