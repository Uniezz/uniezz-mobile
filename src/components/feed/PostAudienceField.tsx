import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { NewPostFormValues } from "@/@types/feed";
import { Icon, UIGlass, UIText, UIUniversityLogo } from "@/ui";
import { AudienceOption } from "./AudienceOption";

type PostAudienceFieldProps = {
  value: NewPostFormValues["audience"];
  onChange: (value: NewPostFormValues["audience"]) => void;
  universityId: string;
  universityName: string;
};

export const PostAudienceField = ({
  value,
  onChange,
  universityId,
  universityName,
}: PostAudienceFieldProps) => {
  const { t } = useTranslation();
  const handleAllPress = () => onChange("all");
  const handleUniversityPress = () => onChange("university");

  return (
    <View style={styles.field}>
      <UIText size="sm" weight="semibold" color="soft" style={styles.label}>
        {t("postComposer.audience")}
      </UIText>
      <UIGlass radius={16} style={styles.options}>
        <AudienceOption
          selected={value === "all"}
          onPress={handleAllPress}
          icon={
            <Icon
              name="globe"
              size={20}
              uniProps={(theme) => ({ color: theme.colors.white80 })}
            />
          }
          title={t("feed.allStudents")}
          subtitle={t("postComposer.audienceAll")}
        />
        <AudienceOption
          selected={value === "university"}
          onPress={handleUniversityPress}
          icon={<UIUniversityLogo id={universityId} size="xs" />}
          title={universityName}
          subtitle={t("postComposer.audienceUniversity", {
            university: universityName,
          })}
        />
      </UIGlass>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.vs(8),
  },
  label: {
    paddingHorizontal: theme.s(4),
  },
  options: {
    padding: theme.s(4),
    gap: theme.vs(4),
  },
}));
