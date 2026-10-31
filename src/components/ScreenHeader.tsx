import { LanguagePicker } from "@/components/LanguagePicker";
import { useMyProfile } from "@/hooks";
import { UIAvatar, UIText } from "@/ui";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type ScreenHeaderProps = {
  title: string;
  style?: ViewStyle;
};

export const ScreenHeader = ({ title, style }: ScreenHeaderProps) => {
  const { t } = useTranslation();
  const { data: profile } = useMyProfile();
  const initials = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .map((name) => name?.[0])
    .join("")
    .toUpperCase();

  return (
    <View style={[styles.container, style]}>
      <UIText weight="bold" size="xl">
        {title}
      </UIText>
      <View style={styles.actions}>
        <LanguagePicker />
        <Pressable
          accessibilityLabel={t("profile.open")}
          accessibilityRole="button"
          onPress={() => router.push("/profile")}
          hitSlop={8}
        >
          <UIAvatar
            size="sm"
            imageSrc={profile?.avatarUrl ?? undefined}
            placeholderText={initials || "U"}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    minHeight: theme.vs(42),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.s(12),
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
  },
}));
