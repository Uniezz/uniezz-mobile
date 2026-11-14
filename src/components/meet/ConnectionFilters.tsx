import { Controller, type Control, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type {
  ConnectionFilterValues,
  ConnectionMode,
} from "@/@types/connections";
import { useUniversities } from "@/hooks/useUniversities";
import { UIChip, UIFilterRow, UISwitch, UIText, UIUniversityLogo } from "@/ui";
import { CONNECTION_GENDERS, STUDY_LEVEL_OPTIONS, toggleValues } from "@/utils";

type ConnectionFiltersProps = {
  control: Control<ConnectionFilterValues>;
  /** faculty and level only narrow the study buddy search */
  mode: ConnectionMode;
};

export const ConnectionFilters = ({
  control,
  mode,
}: ConnectionFiltersProps) => {
  const { t } = useTranslation();
  const { data: universities = [] } = useUniversities();
  // the faculty chips follow the picked universities
  const selectedUniversities = useWatch({ control, name: "universities" });
  const faculties = universities
    .filter(
      ({ id }) =>
        selectedUniversities.length === 0 || selectedUniversities.includes(id),
    )
    .flatMap(({ id, faculties }) =>
      (faculties ?? []).map(({ name }) => ({ key: `${id}:${name}`, name })),
    );

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
          <UIFilterRow label={t("connections.showMe")}>
            {CONNECTION_GENDERS.map(([gender, label]) => (
              <UIChip
                key={label}
                label={t(label)}
                selected={field.value === gender}
                onPress={() => field.onChange(gender)}
              />
            ))}
          </UIFilterRow>
        )}
      />
      <Controller
        control={control}
        name="universities"
        render={({ field }) => (
          <UIFilterRow label={t("app.university")}>
            {universities.map(({ id }) => (
              <UIChip
                key={id}
                label={id.toUpperCase()}
                leading={<UIUniversityLogo id={id} size="xxs" />}
                selected={field.value.includes(id)}
                onPress={() => field.onChange(toggleValues(field.value, [id]))}
              />
            ))}
          </UIFilterRow>
        )}
      />
      {mode === "studyBuddy" ? (
        <>
          <Controller
            control={control}
            name="faculty"
            render={({ field }) => (
              <UIFilterRow label={t("app.faculty")}>
                <UIChip
                  label={t("connections.anyFaculty")}
                  selected={field.value === null}
                  onPress={() => field.onChange(null)}
                />
                {faculties.map(({ key, name }) => (
                  <UIChip
                    key={key}
                    label={name}
                    selected={field.value === name}
                    onPress={() => field.onChange(name)}
                  />
                ))}
              </UIFilterRow>
            )}
          />
          <Controller
            control={control}
            name="levels"
            render={({ field }) => (
              <UIFilterRow label={t("app.studyLevel")}>
                {STUDY_LEVEL_OPTIONS.map(([levels, label]) => (
                  <UIChip
                    key={label}
                    label={t(label)}
                    selected={levels.every((level) =>
                      field.value.includes(level),
                    )}
                    onPress={() =>
                      field.onChange(toggleValues(field.value, levels))
                    }
                  />
                ))}
              </UIFilterRow>
            )}
          />
        </>
      ) : null}
      <Controller
        control={control}
        name="matchInterests"
        render={({ field }) => (
          <View style={styles.switchRow}>
            <UIText weight="semibold">{t("connections.matchInterests")}</UIText>
            <UISwitch value={field.value} onValueChange={field.onChange} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.vs(12),
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
}));
