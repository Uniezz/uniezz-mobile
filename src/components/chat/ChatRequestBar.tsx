import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { ApiConversation } from "@/@types";
import { useAcceptChatRequest, useDeclineChatRequest } from "@/hooks";
import { UIButton, UIGlass, UIText } from "@/ui";
import { apiErrorKey, chatStudentName } from "@/utils";

type ChatRequestBarProps = {
  conversation: ApiConversation;
};

// in place of the composer while a message request waits: the recipient accepts or declines it,
// the sender, having used their one message, waits for an answer
export function ChatRequestBar({ conversation }: ChatRequestBarProps) {
  const { t } = useTranslation();
  const { id } = conversation;
  const name = chatStudentName(conversation.peer, t);
  const { mutateAsync: accept, isPending: isAccepting } =
    useAcceptChatRequest(id);
  const { mutateAsync: decline, isPending: isDeclining } =
    useDeclineChatRequest(id);
  const isBusy = isAccepting || isDeclining;

  const handleAcceptPress = async () => {
    try {
      await accept({ params: { path: { id } } });
    } catch (error) {
      toast.error(t(apiErrorKey(error)));
    }
  };
  const handleDeclinePress = async () => {
    try {
      await decline({ params: { path: { id } } });
      toast.success(t("chat.requestDeclined"));
      router.back();
    } catch (error) {
      toast.error(t(apiErrorKey(error)));
    }
  };

  if (!conversation.incoming) {
    return (
      <UIGlass radius={16} style={styles.bar}>
        <UIText size="body" color="secondary" style={styles.centred}>
          {t("chat.requestWaiting", { name })}
        </UIText>
      </UIGlass>
    );
  }
  return (
    <UIGlass radius={16} style={styles.bar}>
      <UIText weight="semibold" style={styles.centred}>
        {t("chat.requestFrom", { name })}
      </UIText>
      <UIText size="xs" color="secondary" style={styles.centred}>
        {t("chat.requestHint")}
      </UIText>
      <View style={styles.actions}>
        <UIButton
          type="secondary"
          radius="sm"
          disabled={isBusy}
          onPress={handleDeclinePress}
          style={styles.action}
        >
          <UIText weight="semibold">{t("chat.decline")}</UIText>
        </UIButton>
        <UIButton
          radius="sm"
          disabled={isBusy}
          onPress={handleAcceptPress}
          style={styles.action}
        >
          <UIText weight="semibold" color="black">
            {t("chat.accept")}
          </UIText>
        </UIButton>
      </View>
    </UIGlass>
  );
}

const styles = StyleSheet.create((theme) => ({
  bar: {
    padding: theme.s(14),
    gap: theme.vs(6),
  },
  centred: { textAlign: "center" },
  actions: {
    flexDirection: "row",
    gap: theme.s(8),
    marginTop: theme.vs(6),
  },
  action: { flex: 1, width: "auto" },
}));
