import { useTranslation } from "react-i18next";
import type { University } from "@/@types";
import { UIChip } from "./UIChip";
import { UIFilterRow } from "./UIFilterRow";
import { UIUniversityLogo } from "./UIUniversityLogo";

type UIUniversityFilterRowProps = {
  universities: University[];
  /** ids currently picked */
  selectedIds: string[];
  onUniversityPress: (id: string) => void;
  /** the leading chip that clears the pick; every row has one, like the feed's */
  allLabel: string;
  isAllSelected: boolean;
  onAllPress: () => void;
};

// the university chips: one label, order and logo treatment everywhere the list is filtered
export const UIUniversityFilterRow = ({
  universities,
  selectedIds,
  onUniversityPress,
  allLabel,
  isAllSelected,
  onAllPress,
}: UIUniversityFilterRowProps) => {
  const { t } = useTranslation();

  return (
    <UIFilterRow label={t("app.university")}>
      <UIChip label={allLabel} selected={isAllSelected} onPress={onAllPress} />
      {universities.map(({ id }) => {
        const handlePress = () => onUniversityPress(id);
        return (
          <UIChip
            key={id}
            label={id.toUpperCase()}
            leading={<UIUniversityLogo id={id} size="xxs" />}
            selected={selectedIds.includes(id)}
            onPress={handlePress}
          />
        );
      })}
    </UIFilterRow>
  );
};
