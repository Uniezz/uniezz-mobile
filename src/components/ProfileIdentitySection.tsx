import { UIAvatar, UIText } from "@/ui";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  avatarDraftUri?: string;
  disabled: boolean;
  onChangePhoto: () => void;
};

export function ProfileIdentitySection({
  firstName,
  lastName,
  avatarUrl,
  avatarDraftUri,
  disabled,
  onChangePhoto,
}: Props) {
  const { t } = useTranslation();
  const displayName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <View style={[styles.identity, styles.panel]}>
      <UIAvatar
        size="xl"
        imageSrc={avatarDraftUri ?? avatarUrl ?? undefined}
        placeholderText={
          `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "U"
        }
      />
      <UIText size="lg" weight="bold" style={styles.name}>
        {displayName || t("profile.nameMissing")}
      </UIText>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onChangePhoto}
        style={styles.photoButton}
      >
        <UIText color="link" weight="semibold">
          {t("profile.changePhoto")}
        </UIText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  identity: {
    alignItems: "center",
    gap: theme.vs(12),
  },
  name: {
    textAlign: "center",
  },
  panel: {
    gap: theme.vs(12),
    padding: theme.s(16),
    borderRadius: theme.vs(18),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
  },
  photoButton: {
    minHeight: theme.vs(36),
    justifyContent: "center",
    paddingHorizontal: theme.s(12),
  },
}));
