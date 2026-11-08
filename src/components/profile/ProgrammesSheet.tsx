import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePostHog } from "posthog-react-native";
import { type Ref, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type {
  Programme,
  ProgrammeFormValues,
  ProgrammeSelection,
} from "@/@types/profile";
import {
  useAddMyProgramme,
  useDeleteMyProgramme,
  useReplaceMyProgramme,
} from "@/hooks/useMyProfile";
import { programmeSchema } from "@/schemas";
import {
  Icon,
  UIChip,
  UIFadeScrollView,
  UIFormSheet,
  UIInput,
  UIText,
  UIUniversityLogo,
} from "@/ui";
import {
  STUDY_LEVELS,
  STUDY_MODES,
  STUDY_STATUSES,
  toProgrammeBody,
  toProgrammeValues,
} from "@/utils";
import { captureAction } from "@/utils/analytics";

type ProgrammesSheetProps = {
  ref: Ref<BottomSheetModal>;
  programmes: Programme[];
  /** programmes have no university of their own; the profile's is shown with each */
  universityId: string;
};

// the student's programmes in one sheet: pick one from the list to edit it, or add a new one
export const ProgrammesSheet = ({
  ref,
  programmes,
  universityId,
}: ProgrammesSheetProps) => {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const [selection, setSelection] = useState<ProgrammeSelection>(null);
  const programme = programmes.find(({ id }) => id === selection);
  const isFormShown = selection !== null;
  const { mutateAsync: replace, isPending: isReplacing } =
    useReplaceMyProgramme();
  const { mutateAsync: add, isPending: isAdding } = useAddMyProgramme();
  const { mutateAsync: remove } = useDeleteMyProgramme();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm<ProgrammeFormValues>({
    resolver: zodResolver(programmeSchema),
    // follows the picked programme, so switching or reopening starts from it
    values: toProgrammeValues(programme),
    mode: "onChange",
  });

  const handleSavePress = handleSubmit(
    async (values) => {
      try {
        await (programme
          ? replace({
              id: programme.id,
              body: toProgrammeBody(values, programme.isPrimary),
            })
          : // the first programme becomes primary
            add(toProgrammeBody(values, programmes.length === 0)));
        toast.success(t("app.saved"));
        setSelection(null);
      } catch {
        toast.error(t("apiState.profileSaveError"));
      }
    },
    () =>
      captureAction(
        posthog,
        programme ? "programme_update_form" : "programme_add_form",
        "validation_failed",
      ),
  );
  const handleAddPress = () => setSelection("new");
  const handleBackPress = () => setSelection(null);
  // a closed sheet drops unsaved edits and opens on the list next time
  const handleDismiss = () => {
    setSelection(null);
    reset();
  };

  const handleMakePrimaryPress = async () => {
    if (!programme) return;
    try {
      await replace({
        id: programme.id,
        body: toProgrammeBody(toProgrammeValues(programme), true),
      });
      toast.success(t("app.saved"));
    } catch {
      toast.error(t("apiState.profileSaveError"));
    }
  };
  const confirmRemove = async () => {
    if (!programme) return;
    try {
      await remove(programme.id);
      toast.success(t("app.saved"));
      setSelection(null);
    } catch {
      toast.error(t("apiState.profileSaveError"));
    }
  };
  const handleRemovePress = () =>
    Alert.alert(t("app.remove"), programme?.programme, [
      { text: t("postComposer.cancel"), style: "cancel" },
      { text: t("app.remove"), style: "destructive", onPress: confirmRemove },
    ]);

  const form = (
    <>
      {(
        [
          ["programme", "app.programme"],
          ["faculty", "app.faculty"],
        ] as const
      ).map(([name, label]) => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field, fieldState }) => (
            <UIInput
              isInSheet
              captionText={t(label)}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorText={
                fieldState.error?.message && t(fieldState.error.message)
              }
              maxLength={120}
            />
          )}
        />
      ))}
      <Controller
        control={control}
        name="yearOfStudy"
        render={({ field }) => (
          <UIInput
            isInSheet
            captionText={t("app.yearOfStudy")}
            keyboardType="number-pad"
            maxLength={2}
            value={field.value ? String(field.value) : ""}
            onChangeText={(text) => field.onChange(text ? Number(text) : null)}
          />
        )}
      />
      {(
        [
          ["level", "app.studyLevel", STUDY_LEVELS],
          ["modeOfStudies", "app.modeOfStudies", STUDY_MODES],
          ["status", "app.studyStatus", STUDY_STATUSES],
        ] as const
      ).map(([name, label, options]) => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <View style={styles.group}>
              <UIText size="xs" weight="semibold" color="secondary">
                {t(label)}
              </UIText>
              <UIFadeScrollView
                horizontal
                fadeColor="surface"
                showsHorizontalScrollIndicator={false}
                style={styles.bleed}
                contentContainerStyle={styles.chips}
              >
                {options.map(([value, optionLabel]) => (
                  <UIChip
                    key={value}
                    label={t(optionLabel)}
                    selected={field.value === value}
                    onPress={() => field.onChange(value)}
                  />
                ))}
              </UIFadeScrollView>
            </View>
          )}
        />
      ))}
      {programme && !programme.isPrimary ? (
        <Pressable
          accessibilityRole="button"
          onPress={handleMakePrimaryPress}
          style={styles.makePrimary}
        >
          <UIText size="sm" weight="semibold" color="link">
            {t("app.makePrimary")}
          </UIText>
        </Pressable>
      ) : null}
    </>
  );

  const list = programmes.map((item) => {
    const handleRowPress = () => setSelection(item.id);
    return (
      <Pressable
        key={item.id}
        accessibilityRole="button"
        onPress={handleRowPress}
        style={styles.row}
      >
        <UIUniversityLogo id={universityId} size="sm" />
        <View style={styles.rowText}>
          {item.isPrimary ? (
            <UIText size="xs" weight="medium" color="secondary">
              {t("app.primary")}
            </UIText>
          ) : null}
          <UIText weight="semibold" numberOfLines={1}>
            {item.programme}
          </UIText>
          {item.faculty ? (
            <UIText size="sm" color="secondary" numberOfLines={1}>
              {item.faculty}
            </UIText>
          ) : null}
        </View>
        <Icon name="chevron-right" size={16} />
      </Pressable>
    );
  });

  return (
    <UIFormSheet
      ref={ref}
      title={t("app.studyProgrammes")}
      actionLabel={programme ? t("app.saveChanges") : t("app.addProgramme")}
      isActionDisabled={
        isFormShown && (!isDirty || !isValid || isReplacing || isAdding)
      }
      onActionPress={isFormShown ? handleSavePress : handleAddPress}
      destructiveLabel={programme ? t("app.remove") : undefined}
      onDestructivePress={handleRemovePress}
      onBackPress={isFormShown ? handleBackPress : undefined}
      backLabel={t("app.back")}
      onDismiss={handleDismiss}
    >
      {isFormShown ? form : list}
    </UIFormSheet>
  );
};

const styles = StyleSheet.create((theme) => ({
  makePrimary: {
    alignSelf: "flex-start",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    padding: theme.s(16),
    borderRadius: theme.vs(16),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white3,
  },
  rowText: {
    flex: 1,
    gap: theme.vs(3),
  },
  group: {
    gap: theme.vs(6),
  },
  // chip rows run edge to edge so chips scroll under the fades instead of being cut at the inset
  bleed: {
    marginHorizontal: -theme.s(16),
  },
  chips: {
    gap: theme.s(6),
    paddingHorizontal: theme.s(16),
  },
}));
