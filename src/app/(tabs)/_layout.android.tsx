import { Tabs } from "expo-router";
import { useFeatureFlag } from "posthog-react-native";
import { useTranslation } from "react-i18next";
import { BirthDateSheet } from "@/components/meet";
import { GlassTabBar } from "@/components/tabs";
import { useBirthDateGate, useChatStream, useChatUnread } from "@/hooks";

// Android draws its own floating tab bar; iOS keeps the system one (see _layout.tsx)
export default function TabLayout() {
  const { t } = useTranslation();
  const chatEnabled = useFeatureFlag("chat") === true;
  // live chat updates while signed in, only where chat is switched on
  useChatStream(chatEnabled);
  const { data: unread } = useChatUnread(chatEnabled);
  const { birthDateRef, requestBirthDate, handleDismiss } = useBirthDateGate();

  const handleMeetTabPress = (event: { preventDefault: () => void }) => {
    if (requestBirthDate()) event.preventDefault();
  };

  return (
    <>
      <Tabs
        backBehavior="history"
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <GlassTabBar {...props} />}
      >
        <Tabs.Screen name="feed" options={{ title: t("tabs.feed") }} />
        <Tabs.Protected guard={chatEnabled}>
          <Tabs.Screen
            name="chat"
            options={{
              title: t("tabs.chat"),
              tabBarBadge: unread?.totalUnread || undefined,
            }}
          />
        </Tabs.Protected>
        <Tabs.Screen
          name="meet"
          options={{ title: t("tabs.connections") }}
          listeners={{ tabPress: handleMeetTabPress }}
        />
        <Tabs.Screen name="study" options={{ title: t("tabs.exams") }} />
        <Tabs.Screen name="faq" options={{ title: t("tabs.faq") }} />
      </Tabs>
      <BirthDateSheet ref={birthDateRef} onDismiss={handleDismiss} />
    </>
  );
}
