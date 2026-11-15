import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useFeatureFlag } from "posthog-react-native";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { t } = useTranslation();
  const chatEnabled = useFeatureFlag("chat") === true;

  return (
    // back (and Android's back button) returns to the previous tab, e.g. after skipping the birth date in Connections
    <NativeTabs backBehavior="history">
      <NativeTabs.Trigger name="feed">
        <NativeTabs.Trigger.Icon
          sf={{ default: "newspaper", selected: "newspaper.fill" }}
          md="newspaper"
        />
        <NativeTabs.Trigger.Label>{t("tabs.feed")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chat" hidden={!chatEnabled}>
        <NativeTabs.Trigger.Icon
          sf={{ default: "message", selected: "message.fill" }}
          md={{ default: "chat_bubble_outline", selected: "chat_bubble" }}
        />
        <NativeTabs.Trigger.Label>{t("tabs.chat")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="meet">
        <NativeTabs.Trigger.Icon sf="sparkles" md="auto_awesome" />
        <NativeTabs.Trigger.Label>
          {t("tabs.connections")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="study">
        <NativeTabs.Trigger.Icon
          sf={{ default: "books.vertical", selected: "books.vertical.fill" }}
          md="local_library"
        />
        <NativeTabs.Trigger.Label>{t("tabs.exams")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="faq">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "questionmark.circle",
            selected: "questionmark.circle.fill",
          }}
          md="help"
        />
        <NativeTabs.Trigger.Label>{t("tabs.faq")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
