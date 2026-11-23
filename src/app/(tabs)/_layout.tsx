import { type BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useFeatureFlag } from "posthog-react-native";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { BirthDateSheet } from "@/components/meet";
import {
  useChatStream,
  useChatUnread,
  useConnectionPreferences,
} from "@/hooks";
import type { ConnectionPreferences } from "@/@types";
import { tabsHostNativeProps, unreadBadge } from "@/utils";
import { router } from "expo-router";

export default function TabLayout() {
  const { t } = useTranslation();
  const chatEnabled = useFeatureFlag("chat") === true;
  // live chat updates while signed in, only where chat is switched on
  useChatStream(chatEnabled);
  const { data: unread } = useChatUnread(chatEnabled);
  const birthDateRef = useRef<BottomSheetModal>(null);
  const birthDateRequested = useRef(false);
  const queryClient = useQueryClient();
  const { data: preferences, isPending } = useConnectionPreferences();
  const isBirthDateMissing = !isPending && !preferences?.birthDate;

  const handleMeetTabPress = (event: { data: { isPrevented: boolean } }) => {
    if (!event.data.isPrevented || isPending) return;
    birthDateRequested.current = true;
    birthDateRef.current?.present();
  };

  const handleBirthDateDismiss = () => {
    const requested = birthDateRequested.current;
    birthDateRequested.current = false;
    const saved = queryClient.getQueryData<ConnectionPreferences>([
      "connections",
      "me",
    ]);
    if (requested && saved?.birthDate) router.navigate("/(tabs)/meet");
  };

  return (
    <>
      <NativeTabs
        backBehavior="history"
        unstable_nativeProps={tabsHostNativeProps}
      >
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
          {/* expo-router shows any text even when hidden, and a red dot for no text unless hidden:
              at 0 the badge needs both no text and hidden */}
          <NativeTabs.Trigger.Badge hidden={!unread?.totalUnread}>
            {unread?.totalUnread ? unreadBadge(unread.totalUnread) : undefined}
          </NativeTabs.Trigger.Badge>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="meet"
          disabled={isPending || isBirthDateMissing}
          listeners={{ tabPress: handleMeetTabPress }}
        >
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
      <BirthDateSheet ref={birthDateRef} onDismiss={handleBirthDateDismiss} />
    </>
  );
}
