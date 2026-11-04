import type { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIAvatar, UIText } from "@/ui";

type ProfileHeroProps = {
  avatar?: string | null;
  name: string;
  subtitle?: string | null;
  children?: ReactNode;
};

export const ProfileHero = ({
  avatar,
  name,
  subtitle,
  children,
}: ProfileHeroProps) => (
  <View style={styles.hero}>
    <UIAvatar size="xxl" imageSrc={avatar} style={styles.avatar} />
    <View style={styles.text}>
      <UIText size="title1" weight="semibold">
        {name}
      </UIText>
      {subtitle ? (
        <UIText size="sm" weight="medium" color="secondary">
          {subtitle}
        </UIText>
      ) : null}
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  hero: {
    alignItems: "center",
    gap: theme.vs(14),
    paddingTop: theme.vs(8),
    paddingBottom: theme.vs(4),
  },
  avatar: {
    borderWidth: 2,
    borderColor: theme.colors.white20,
    overflow: "hidden",
  },
  text: {
    alignItems: "center",
    gap: theme.vs(5),
  },
}));
