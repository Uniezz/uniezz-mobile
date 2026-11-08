import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Icon, UIAvatar, UIGlass, UIText } from "@/ui";
import { UniversityCard } from "./UniversityCard";

type ProfileHeroProps = {
  avatar?: string | null;
  name: string;
  subtitle?: string | null;
  universityId: string;
  /** makes the avatar a button with a camera badge, e.g. to pick a new photo */
  onAvatarPress?: () => void;
  avatarLabel?: string;
  isAvatarDisabled?: boolean;
  /** bio, interests and actions, below the identity card */
  children?: ReactNode;
};

export const ProfileHero = ({
  avatar,
  name,
  subtitle,
  universityId,
  onAvatarPress,
  avatarLabel,
  isAvatarDisabled,
  children,
}: ProfileHeroProps) => (
  <View style={styles.hero}>
    <UIGlass radius={24} style={styles.card}>
      <View style={styles.identity}>
        {onAvatarPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={avatarLabel}
            disabled={isAvatarDisabled}
            onPress={onAvatarPress}
          >
            <UIAvatar size="xxl" imageSrc={avatar} style={styles.avatar} />
            <View style={styles.badge}>
              <Icon
                name="camera"
                size={15}
                uniProps={(theme) => ({ color: theme.colors.ink })}
              />
            </View>
          </Pressable>
        ) : (
          <UIAvatar size="xxl" imageSrc={avatar} style={styles.avatar} />
        )}
        <View style={styles.text}>
          <UIText size="xxl" weight="semibold" style={styles.name}>
            {name}
          </UIText>
          {subtitle ? (
            <UIText size="body" weight="medium" color="soft">
              {subtitle}
            </UIText>
          ) : null}
        </View>
      </View>
      <UniversityCard universityId={universityId} />
    </UIGlass>
    {children}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  hero: {
    gap: theme.vs(20),
  },
  card: {
    padding: theme.s(6),
    gap: theme.vs(8),
    borderColor: theme.colors.white20,
    backgroundColor: theme.colors.white3,
  },
  identity: {
    alignItems: "center",
    gap: theme.vs(20),
    paddingVertical: theme.vs(24),
    paddingHorizontal: theme.s(20),
    borderRadius: theme.vs(16),
    borderWidth: 1,
    borderColor: theme.colors.sky15,
    backgroundColor: theme.colors.sky5,
  },
  // no fill: the transparent fallback cat sits on the card tint, as in the design
  avatar: {
    borderWidth: 1,
    borderColor: theme.colors.sky15,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: theme.vs(32),
    height: theme.vs(32),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.vs(16),
    borderWidth: 2,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.white,
  },
  text: {
    alignItems: "center",
    gap: theme.vs(8),
  },
  name: {
    textAlign: "center",
  },
}));
