import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";
import { ScrollViewProps, View } from "react-native";
import { KeyboardChatScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import type { ChatMessage } from "@/@types/chat";
import { UIText } from "@/ui";
import { chatDay, isSameDay } from "@/utils";

// lifts the latest messages with the keyboard, like the post comments;
// the list ends above the home indicator (UIPage pads it), which the keyboard already covers
const ThreadScrollView = (props: ScrollViewProps) => {
  const { bottom } = useSafeAreaInsets();
  return <KeyboardChatScrollView {...props} offset={bottom} />;
};

type ChatThreadProps = {
  /** oldest first */
  messages: ChatMessage[];
  /** the composer floats over the list's end, so the list reserves its height */
  composerHeight: number;
};

export function ChatThread({ messages, composerHeight }: ChatThreadProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";

  return (
    <FlashList
      renderScrollComponent={ThreadScrollView}
      data={messages}
      keyExtractor={(message) => message.id}
      // opens on the latest message and follows new ones while the reader is near the end
      maintainVisibleContentPosition={{
        startRenderingFromBottom: true,
        autoscrollToBottomThreshold: 0.2,
      }}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list(composerHeight)}
      renderItem={({ item, index }) => {
        const previous = messages[index - 1];
        const isNewDay =
          !previous || !isSameDay(previous.createdAt, item.createdAt);
        return (
          <View style={styles.item}>
            {isNewDay ? (
              <UIText
                size="xs"
                weight="medium"
                color="secondary"
                style={styles.day}
              >
                {chatDay(item.createdAt, locale, t("feed.today"))}
              </UIText>
            ) : null}
            <View style={styles.bubble(item.mine)}>
              <UIText>{item.text}</UIText>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  list: (composerHeight: number) => ({
    paddingBottom: composerHeight,
  }),
  item: {
    paddingBottom: theme.vs(6),
  },
  day: {
    alignSelf: "center",
    paddingBottom: theme.vs(8),
  },
  bubble: (mine: boolean) => ({
    alignSelf: mine ? "flex-end" : "flex-start",
    maxWidth: theme.s(260),
    paddingVertical: theme.vs(10),
    paddingHorizontal: theme.s(14),
    borderRadius: theme.vs(16),
    borderWidth: mine ? 0 : 1,
    borderColor: theme.colors.white10,
    backgroundColor: mine ? theme.colors.blue : theme.colors.surface60,
  }),
}));
