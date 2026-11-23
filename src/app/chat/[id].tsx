import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, LayoutChangeEvent, View } from "react-native";
import {
  KeyboardAvoidingView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { ApiChatMessage, MessageFormValues } from "@/@types";
import { ChatThread, MessageComposer } from "@/components/chat";
import { ReportSheet } from "@/components/report";
import {
  useChatConversation,
  useChatMessages,
  useChatPeerRead,
  useDeleteChatMessage,
  useMarkChatRead,
  useMyProfile,
  useSendChatMessage,
} from "@/hooks";
import { messageSchema } from "@/schemas";
import {
  apiErrorKey,
  conversationTitle,
  profileHref,
  refreshChatPhotos,
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
  // newest first, as the API pages them and the inverted thread reads them
  const messages =
    messagePages?.pages.flatMap((page) => page.items ?? []) ?? [];
  const { sendMessage } = useSendChatMessage(id);
  const { mutateAsync: deleteMessage } = useDeleteChatMessage(id);
  const { mutate: markRead } = useMarkChatRead(id);
  const { data: peerReadSeq } = useChatPeerRead(id);
  const queryClient = useQueryClient();
  const reportRef = useRef<BottomSheetModal>(null);
  const [reportedMessageId, setReportedMessageId] = useState("");
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { text: "", photos: [] },
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

  // the photos picked in the composer go out with the text in one message (the text may be empty then).
  // Optimistic: the field clears and the message shows at once; a failed send puts both back
  const send = ({ text, photos }: MessageFormValues) => {
    reset();
    sendMessage(
      { text, photos },
      {
        onError: (error) => {
          reset({ text, photos });
          toast.error(t(apiErrorKey(error)));
        },
      },
    );
  };
  const handleSendPress = handleSubmit(send);

  // a long press deletes your own message for everyone (it stays as a "Message deleted" line)
  // and reports someone else's
  const handleMessageLongPress = (message: ApiChatMessage) => {
    if (message.sender.id !== profile?.id) {
      setReportedMessageId(message.id);
      return reportRef.current?.present();
    }
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

  // a photo whose link expired loads again with a fresh one; a failed refresh leaves the placeholder
  const handlePhotoError = (message: ApiChatMessage) =>
    refreshChatPhotos(queryClient, message).catch(() => undefined);

  // the inverted thread's end is its top, where older pages load
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  // the thread leaves room under its newest message for the composer floating over it
  const [composerHeight, setComposerHeight] = useState(0);
  const handleComposerLayout = (event: LayoutChangeEvent) => {
    setComposerHeight(event.nativeEvent.layout.height);
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
            composerHeight={composerHeight}
            onEndReached={handleEndReached}
            peerReadSeq={peerReadSeq}
            onMessageLongPress={handleMessageLongPress}
            onPhotoError={handlePhotoError}
          />
        )}
        {conversation ? (
          // over the list's bottom, so messages scroll on under it; the inverted thread keeps its newest
          // message above it. UIPage already lifts it off the home indicator; above the keyboard that gap is dropped
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
      <ReportSheet
        ref={reportRef}
        targetId={reportedMessageId}
        targetType="message"
      />
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
  // floats over the thread, so it pads itself as the page would
  composer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(12),
  },
}));
