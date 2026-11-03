import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { Profile } from "@/@types/profile";
import { useUpdateMyProfile } from "@/hooks/useMyProfile";
import { UIGlass, UISwitch, UIText } from "@/ui";
import { PRIVACY_SETTINGS } from "@/utils";

type PrivacyKey = (typeof PRIVACY_SETTINGS)[number][0];

export const PrivacyCard = ({ privacy }: { privacy: Profile["privacy"] }) => {
  const { t } = useTranslation();
  const { mutateAsync: update, isPending } = useUpdateMyProfile();

  const handleChange = async (key: PrivacyKey, value: boolean) => {
    try {
      await update({ privacy: { ...privacy, [key]: value } });
    } catch {
      toast.error(t("apiState.profileSaveError"));
    }
  };

  return (
    <View style={styles.section}>
      <UIText size="md" weight="semibold">
        {t("app.profileVisibility")}
      </UIText>
      <UIGlass radius={24} style={styles.card}>
        {PRIVACY_SETTINGS.map(([key, label], index) => (
          <View key={key} style={styles.row(index > 0)}>
            <UIText weight="medium" style={styles.label}>
              {t(label)}
            </UIText>
            <UISwitch
              accessibilityLabel={t(label)}
              disabled={isPending}
              value={privacy[key]}
              onValueChange={(value) => handleChange(key, value)}
            />
          </View>
        ))}
      </UIGlass>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.vs(12),
  },
  card: {
    paddingHorizontal: theme.s(16),
  },
  row: (divided: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    minHeight: theme.vs(52),
    borderTopWidth: divided ? 1 : 0,
    borderTopColor: theme.colors.white5,
  }),
  label: {
    flex: 1,
  },
}));
