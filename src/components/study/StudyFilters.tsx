import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useUniversities } from "@/hooks/useUniversities";
import {
  Icon,
  UIBottomSheet,
  UIChip,
  UIIconButton,
  UIUniversityLogo,
  UIText,
} from "@/ui";

type StudyFiltersProps = {
  universityId?: string;
  semester?: number;
  showSemester: boolean;
  onUniversityChange: (universityId: string | undefined) => void;
  onSemesterChange: (semester: number | undefined) => void;
};

const semesters = Array.from({ length: 12 }, (_, index) => index + 1);

export function StudyFilters({
  universityId,
  semester,
  showSemester,
  onUniversityChange,
  onSemesterChange,
}: StudyFiltersProps) {
  const { t } = useTranslation();
  const { data: universities = [] } = useUniversities();
  const sheetRef = useRef<BottomSheetModal>(null);
  const handlePress = () => sheetRef.current?.present();
  const handleAllUniversitiesPress = () => onUniversityChange(undefined);
  const handleAnySemesterPress = () => onSemesterChange(undefined);

  return (
    <>
      <UIIconButton
        accessibilityRole="button"
        accessibilityLabel={t("study.filters")}
        onPress={handlePress}
      >
        <Icon name="sliders-horizontal" size={18} />
      </UIIconButton>
      <UIBottomSheet ref={sheetRef} title={t("study.filters")}>
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.group}>
            <UIText size="sm" weight="semibold">
              {t("app.university")}
            </UIText>
            <View style={styles.options}>
              <UIChip
                label={t("app.allUniversities")}
                selected={universityId === undefined}
                onPress={handleAllUniversitiesPress}
              />
              {universities.map(({ id }) => {
                const handleUniversityPress = () => onUniversityChange(id);
                return (
                  <UIChip
                    key={id}
                    label={id.toLocaleUpperCase("en")}
                    leading={<UIUniversityLogo id={id} size="xxs" />}
                    selected={universityId === id}
                    onPress={handleUniversityPress}
                  />
                );
              })}
            </View>
          </View>
          {showSemester ? (
            <View style={styles.group}>
              <UIText size="sm" weight="semibold">
                {t("app.semester")}
              </UIText>
              <View style={styles.options}>
                <UIChip
                  label={t("study.anySemester")}
                  selected={semester === undefined}
                  onPress={handleAnySemesterPress}
                />
                {semesters.map((value) => {
                  const handleSemesterPress = () => onSemesterChange(value);
                  return (
                    <UIChip
                      key={value}
                      label={String(value)}
                      selected={semester === value}
                      onPress={handleSemesterPress}
                    />
                  );
                })}
              </View>
            </View>
          ) : null}
        </BottomSheetScrollView>
      </UIBottomSheet>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.vs(16),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(16),
  },
  group: { gap: theme.vs(8) },
  options: { flexDirection: "row", flexWrap: "wrap", gap: theme.s(8) },
}));
