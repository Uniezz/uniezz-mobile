import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ChatMessage } from "@/@types/chat";
import { ChatThread } from "@/components/chat";
import { useChatStore } from "@/store/chat";
import { Icon, UIAvatar, UIPage, UIText } from "@/ui";

const emptyMessages: ChatMessage[] = [];

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const conversation = useChatStore((state) =>
    state.conversations.find((item) => item.id === id),
  );
  const messages = useChatStore((state) => state.messages[id] ?? emptyMessages);
  const sendMessages = useChatStore((state) => state.sendMessages);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/chat");
  };

  return (
    <UIPage backdrop="city">
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("app.back")}
            onPress={handleBackPress}
            style={styles.back}
          >
            <Icon name="arrow-left" size={18} />
          </Pressable>
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
          <ChatThread
            messages={messages}
            onSend={(sent) => sendMessages(id, sent)}
          />
        ) : (
          <UIText color="secondary">{t("app.empty")}</UIText>
        )}
      </View>
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
  back: {
    width: theme.vs(44),
    height: theme.vs(44),
    alignItems: "center",
    justifyContent: "center",
  },
  who: {
    flex: 1,
    gap: theme.vs(1),
  },
}));
