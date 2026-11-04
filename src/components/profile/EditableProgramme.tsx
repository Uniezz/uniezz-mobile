import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { Programme } from "@/@types/profile";
import {
  useDeleteMyProgramme,
  useReplaceMyProgramme,
} from "@/hooks/useMyProfile";
import { UIText } from "@/ui";
import { ProgrammeCard } from "./ProgrammeCard";
import { ProgrammeEditForm } from "./ProgrammeEditForm";

type EditableProgrammeProps = {
  programme: Programme;
  editing: boolean;
};

export const EditableProgramme = ({
  programme,
  editing,
}: EditableProgrammeProps) => {
  const { t } = useTranslation();
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const { mutateAsync: replaceProgramme } = useReplaceMyProgramme();
  const { mutateAsync: deleteProgramme } = useDeleteMyProgramme();

  const handleMakePrimary = async () => {
    try {
      await replaceProgramme({
        id: programme.id,
        body: {
          programme: programme.programme,
          faculty: programme.faculty,
          status: programme.status,
          isPrimary: true,
          yearOfStudy: programme.yearOfStudy ?? undefined,
          level: programme.level ?? undefined,
          modeOfStudies: programme.modeOfStudies ?? undefined,
        },
      });
    } catch {
      toast.error(t("apiState.profileSaveError"));
    }
  };

  const confirmRemove = async () => {
    try {
      await deleteProgramme(programme.id);
    } catch {
      toast.error(t("apiState.profileSaveError"));
    }
  };

  const handleRemovePress = () =>
    Alert.alert(t("app.remove"), programme.programme, [
      { text: t("postComposer.cancel"), style: "cancel" },
      { text: t("app.remove"), style: "destructive", onPress: confirmRemove },
    ]);

  const handleToggleDetails = () => setIsEditingDetails(!isEditingDetails);
  const handleDetailsSaved = () => setIsEditingDetails(false);

  return (
    <ProgrammeCard programme={programme}>
      {editing ? (
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={handleToggleDetails}>
            <UIText size="sm" weight="semibold" color="link">
              {isEditingDetails ? t("postComposer.cancel") : t("app.edit")}
            </UIText>
          </Pressable>
          {programme.isPrimary ? null : (
            <Pressable accessibilityRole="button" onPress={handleMakePrimary}>
              <UIText size="sm" weight="semibold" color="link">
                {t("app.makePrimary")}
              </UIText>
            </Pressable>
          )}
          <Pressable accessibilityRole="button" onPress={handleRemovePress}>
            <UIText size="sm" weight="semibold" color="error">
              {t("app.remove")}
            </UIText>
          </Pressable>
        </View>
      ) : null}
      {editing && isEditingDetails ? (
        <ProgrammeEditForm programme={programme} onDone={handleDetailsSaved} />
      ) : null}
    </ProgrammeCard>
  );
};

const styles = StyleSheet.create((theme) => ({
  actions: {
    flexDirection: "row",
    gap: theme.s(20),
    paddingTop: theme.vs(4),
  },
}));
