import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleProp, ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { Author } from "@/@types";
import { useMyProfile } from "@/hooks";
import { UIPressable, UIAvatar, UIText, UIUniversityLogo } from "@/ui";
import { authorName, profileHref } from "@/utils";

type AuthorRowProps = {
  author: Author;
  /** shown after the university, e.g. the post date */
  meta?: string;
  /** e.g. inside the author's own posts, where their profile is the screen behind */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

// avatar, name, university and meta; the whole row opens the author's profile
export const AuthorRow = ({
  author,
  meta,
  disabled,
  style,
}: AuthorRowProps) => {
  const { t } = useTranslation();
  const { data: me } = useMyProfile();
  const name = authorName(author) || t("apiState.student");
  const handlePress = () => router.push(profileHref(author.id, me?.id));

  return (
    <UIPressable
      accessibilityRole="link"
      accessibilityLabel={name}
      onPress={handlePress}
      disabled={disabled}
      hitSlop={6}
      style={[styles.row, style]}
    >
      <UIAvatar size="sm" imageSrc={author.avatarUrl} />
      <UIText size="sm" weight="medium" numberOfLines={1} style={styles.name}>
        {name}
      </UIText>
      <UIUniversityLogo id={author.universityId} size="xxs" />
      {meta ? (
        <UIText
          size="sm"
          color="secondary"
          numberOfLines={1}
          style={styles.meta}
        >
          · {meta}
        </UIText>
      ) : null}
    </UIPressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  // the name gives way first, so the university and date stay visible
  name: {
    flexShrink: 1,
  },
  meta: {
    flexShrink: 0,
  },
}));
