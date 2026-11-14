import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useUniversities } from "@/hooks/useUniversities";
import { UIChip, UIFilterRow, UIFilters, UIUniversityLogo } from "@/ui";

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
  const handleAllUniversitiesPress = () => onUniversityChange(undefined);
  const handleAnySemesterPress = () => onSemesterChange(undefined);

  return (
    <UIFilters ref={sheetRef} title={t("study.filters")}>
      <UIFilterRow label={t("app.university")}>
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
      </UIFilterRow>
      {showSemester ? (
        <UIFilterRow label={t("app.semester")}>
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
        </UIFilterRow>
      ) : null}
    </UIFilters>
  );
}
