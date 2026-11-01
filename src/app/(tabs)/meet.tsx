import { ScreenHeader } from "@/components";
import { UIPage } from "@/ui";
import { useTranslation } from "react-i18next";

export default function MeetScreen() {
  const { t } = useTranslation();
  return (
    <UIPage backdrop="city">
      <ScreenHeader title={t("tabs.meet")} />
    </UIPage>
  );
}
