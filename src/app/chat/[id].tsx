import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { LayoutChangeEvent, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import type { ChatMessage, MessageFormValues } from "@/@types/chat";
import { ChatThread, MessageComposer } from "@/components/chat";
import { messageSchema } from "@/schemas";
import { useChatStore } from "@/store/chat";
import { captureAction } from "@/utils/analytics";
import { Icon, UIAvatar, UIEmpty, UIIconButton, UIPage, UIText } from "@/ui";

const emptyMessages: ChatMessage[] = [];

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const posthog = usePostHog();
  const conversation = useChatStore((state) =>
    state.conversations.find((item) => item.id === id),
  );
  const messages = useChatStore((state) => state.messages[id] ?? emptyMessages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { text: "" },
    mode: "onChange",
  });
  const [composerHeight, setComposerHeight] = useState(0);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const handleComposerLayout = (event: LayoutChangeEvent) => {
    setComposerHeight(event.nativeEvent.layout.height);
  };

  const handleSendPress = handleSubmit(({ text }) => {
    captureAction(posthog, "message_send", "attempted", { storage: "local" });
    try {
      sendMessage(id, text);
      reset();
      captureAction(posthog, "message_send", "succeeded", { storage: "local" });
    } catch (error) {
      captureAction(posthog, "message_send", "failed", { storage: "local" });
      throw error;
    }
  });

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/chat");
  };

  return (
    <UIPage>
      <View style={styles.page}>
        <View style={styles.header}>
          <UIIconButton
            size="lg"
            accessibilityRole="button"
            accessibilityLabel={t("app.back")}
            onPress={handleBackPress}
          >
            <Icon name="arrow-left" size={18} />
          </UIIconButton>
          {conversation ? (
            <>
              <UIAvatar size="sm" />
              <View style={styles.who}>
                <UIText size="rg" weight="semibold" numberOfLines={1}>
                  {conversation.name}
                </UIText>
                {conversation.group ? (
                  <UIText size="xs" color="secondary">
                    {t("app.groups")}
                  </UIText>
                ) : null}
              </View>
            </>
          ) : null}
        </View>
        {conversation ? (
          <ChatThread messages={messages} composerHeight={composerHeight} />
        ) : null}
        {conversation ? (
          // UIPage already lifts the composer off the home indicator; above the keyboard that gap is dropped
          <KeyboardStickyView
            offset={{ opened: bottomInset }}
            style={styles.composer}
            onLayout={handleComposerLayout}
          >
            <MessageComposer
              control={control}
              isSendDisabled={!isValid}
              onSendPress={handleSendPress}
            />
          </KeyboardStickyView>
        ) : null}
      </View>
      {/* a direct child of UIPage, so the cat centres like every other empty state */}
      {!conversation || messages.length === 0 ? (
        <UIEmpty isScreenCentred message={t("app.empty")} />
      ) : null}
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    flex: 1,
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
    gap: theme.vs(12),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
    height: theme.vs(44),
  },
  who: {
    flex: 1,
    gap: theme.vs(1),
  },
  composer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.s(8),
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
    paddingBottom: theme.vs(12),
  },
}));
