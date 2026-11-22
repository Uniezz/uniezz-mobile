import { zodResolver } from "@hookform/resolvers/zod";
import { launchImageLibraryAsync } from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import {
  KeyboardAvoidingView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { ApiChatMessage, MessageFormValues } from "@/@types";
import { ChatThread, MessageComposer } from "@/components/chat";
import {
  useChatConversation,
  useChatMessages,
  useDeleteChatMessage,
  useMarkChatRead,
  useMyProfile,
  useSendChatMessage,
  useUploadImages,
} from "@/hooks";
import { messageSchema } from "@/schemas";
import {
  apiErrorKey,
  conversationTitle,
  MAX_CHAT_PHOTOS,
  profileHref,
} from "@/utils";
import {
  Icon,
  UIAvatar,
  UIEmpty,
  UIIconButton,
  UIPage,
  UIPressable,
  UIQueryError,
  UIText,
} from "@/ui";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: profile } = useMyProfile();
  const { data: conversation, isError, refetch } = useChatConversation(id);
  const {
    data: messagePages,
    isPending: areMessagesPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(id);
  // the API pages newest first; the thread reads oldest first
  const messages =
    messagePages?.pages.flatMap((page) => page.items ?? []).reverse() ?? [];
  const { sendMessage, isPending: isSending } = useSendChatMessage(id);
  const { mutateAsync: deleteMessage } = useDeleteChatMessage(id);
  const { mutateAsync: uploadImages, isPending: isUploading } =
    useUploadImages("chat");
  const { mutate: markRead } = useMarkChatRead(id);
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
  const { bottom: bottomInset } = useSafeAreaInsets();

  // an open thread is read up to its newest message: on entering, and again as each new one arrives;
  // a failed mark waits for the next message rather than retrying
  const lastSeq = conversation?.lastSeq ?? 0;
  const isBehind = conversation ? conversation.lastReadSeq < lastSeq : false;
  useEffect(() => {
    if (isBehind)
      markRead({ params: { path: { id } }, body: { seq: lastSeq } });
  }, [id, lastSeq, isBehind, markRead]);

  const handleSendPress = handleSubmit(async ({ text }) => {
    try {
      await sendMessage({ body: text });
      reset();
    } catch (error) {
      toast.error(t(apiErrorKey(error)));
    }
  });

  // picked photos go out at once as their own message; the typed text stays in the field
  const handleAttachPress = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_CHAT_PHOTOS,
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;
    const picked = result.assets
      .slice(0, MAX_CHAT_PHOTOS)
      .map(({ uri, mimeType, fileSize }) => ({ uri, mimeType, fileSize }));
    const toastId = toast.loading(t("app.processingPhotos"));
    try {
      const attachmentIds = await uploadImages(picked);
      await sendMessage({ attachmentIds });
      toast.dismiss(toastId);
    } catch (error) {
      toast.error(t(apiErrorKey(error)), { id: toastId });
    }
  };

  // removed for everyone; it stays as a "Message deleted" line so positions keep
  const handleOwnMessageLongPress = (message: ApiChatMessage) => {
    const confirmDelete = async () => {
      try {
        await deleteMessage({ params: { path: { id: message.id } } });
      } catch (error) {
        toast.error(t(apiErrorKey(error)));
      }
    };
    Alert.alert(
      t("chat.deleteMessageTitle"),
      t("chat.deleteMessageDescription"),
      [
        { text: t("postComposer.cancel"), style: "cancel" },
        { text: t("app.remove"), style: "destructive", onPress: confirmDelete },
      ],
    );
  };

  const handleStartReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };

  // a group opens its members and settings; a direct chat opens the other student's profile
  const handleHeaderPress = () => {
    if (conversation?.kind === "group") {
      return router.push({ pathname: "/chat/group/[id]", params: { id } });
    }
    const peerId = conversation?.peer?.id;
    if (peerId) router.push(profileHref(peerId, profile?.id));
  };

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
            <UIPressable
              accessibilityRole="button"
              accessibilityLabel={
                conversationTitle(conversation) || t("apiState.student")
              }
              onPress={handleHeaderPress}
              style={styles.identity}
            >
              <UIAvatar size="sm" imageSrc={conversation.peer?.avatarUrl} />
              <View style={styles.who}>
                <UIText size="rg" weight="semibold" numberOfLines={1}>
                  {conversationTitle(conversation) || t("apiState.student")}
                </UIText>
                {conversation.kind === "group" ? (
                  <UIText size="xs" color="secondary">
                    {t("chat.members", {
                      count: conversation.memberCount ?? 0,
                    })}
                  </UIText>
                ) : null}
              </View>
            </UIPressable>
          ) : null}
        </View>
        {isError ? (
          <UIQueryError message={t("apiState.error")} onRetry={refetch} />
        ) : (
          <ChatThread
            messages={messages}
            myId={profile?.id}
            onStartReached={handleStartReached}
            onOwnMessageLongPress={handleOwnMessageLongPress}
          />
        )}
        {conversation ? (
          // under the list, not over it: FlashList's startRenderingFromBottom ignores a bottom padding, so
          // the latest message would end behind an overlaid composer. UIPage already lifts it off the home
          // indicator; above the keyboard that gap is dropped
          <KeyboardStickyView
            offset={{ opened: bottomInset }}
            style={styles.composer}
          >
            <MessageComposer
              control={control}
              isSendDisabled={!isValid || isSending}
              onSendPress={handleSendPress}
              onAttachPress={handleAttachPress}
              isAttachDisabled={isUploading || isSending}
            />
          </KeyboardStickyView>
        ) : null}
      </View>
      {/* a direct child of UIPage, so the cat centres like every other empty state;
          the keyboard shrinks the area, so the composer riding up on it never covers the message */}
      {!isError && !areMessagesPending && messages.length === 0 ? (
        <KeyboardAvoidingView
          behavior="padding"
          pointerEvents="box-none"
          style={styles.empty}
        >
          <View pointerEvents="box-none" style={styles.emptyArea}>
            <UIEmpty isScreenCentred message={t("app.empty")} />
          </View>
        </KeyboardAvoidingView>
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
  identity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
  },
  who: {
    flex: 1,
    gap: theme.vs(1),
  },
  empty: StyleSheet.absoluteFillObject,
  emptyArea: { flex: 1 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.s(8),
    paddingBottom: theme.vs(12),
  },
}));
