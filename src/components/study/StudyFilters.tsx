import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useUniversities } from "@/hooks";
import { UIChip, UIFilterRow, UIFilters, UIUniversityFilterRow } from "@/ui";
import { SEMESTERS } from "@/utils";

type StudyFiltersProps = {
  universityId?: string;
  semester?: number;
  showSemester: boolean;
  onUniversityChange: (universityId: string | undefined) => void;
  onSemesterChange: (semester: number | undefined) => void;
};

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
      <UIUniversityFilterRow
        universities={universities}
        selectedIds={universityId ? [universityId] : []}
        allLabel={t("app.allUniversities")}
        isAllSelected={universityId === undefined}
        onAllPress={handleAllUniversitiesPress}
        onUniversityPress={onUniversityChange}
      />
      {showSemester ? (
        <UIFilterRow label={t("app.semester")}>
          <UIChip
            label={t("study.anySemester")}
            selected={semester === undefined}
            onPress={handleAnySemesterPress}
          />
          {SEMESTERS.map((value) => {
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
