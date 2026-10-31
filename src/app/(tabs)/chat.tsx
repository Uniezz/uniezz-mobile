import { ScreenHeader } from "@/components";
import { UIPage } from "@/ui";
import { useTranslation } from "react-i18next";

export default function ChatScreen() {
  const { t } = useTranslation();
  return (
    <UIPage backdrop="city">
      <ScreenHeader title={t("tabs.chat")} />
    </UIPage>
  );
}
