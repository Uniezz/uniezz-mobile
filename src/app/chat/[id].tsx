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
import { ChatRequestBar, ChatThread, MessageComposer } from "@/components/chat";
import { ReportSheet } from "@/components/report";
import {
  useChatConversation,
  useChatMembers,
  useChatMessages,
  useChatPeerRead,
  useCreateChatRequest,
  useDeleteChatMessage,
  useMarkChatRead,
  useMyProfile,
  usePublicProfile,
  useSendChatMessage,
} from "@/hooks";
import { messageSchema } from "@/schemas";
import {
  apiErrorKey,
  authorName,
  chatStudentName,
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
  // with a userId, a draft: no conversation exists until the first message goes out as a request
  const { id, userId } = useLocalSearchParams<{
    id: string;
    userId?: string;
  }>();
  const isDraft = Boolean(userId);
  const { t } = useTranslation();
  const { data: profile } = useMyProfile();
  const {
    data: conversation,
    isError,
    refetch,
  } = useChatConversation(id, !isDraft);
  const { data: student } = usePublicProfile(userId ?? "", isDraft);
  const { createRequest, isPending: isCreatingRequest } =
    useCreateChatRequest();
  const {
    data: messagePages,
    isPending: areMessagesPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(id, !isDraft);
  // newest first, as the API pages them and the inverted thread reads them
  const messages =
    messagePages?.pages.flatMap((page) => page.items ?? []) ?? [];
  const { sendMessage } = useSendChatMessage(id);
  const { mutateAsync: deleteMessage } = useDeleteChatMessage(id);
  const { mutate: markRead } = useMarkChatRead(id);
  const { data: peerReadSeq } = useChatPeerRead(id);
  // a group's system messages name its members by id
  const isGroup = conversation?.kind === "group";
  const { data: memberPage } = useChatMembers(id, isGroup);
  const memberNames = new Map(
    (memberPage?.items ?? []).flatMap(({ student }) =>
      student.id ? [[student.id, chatStudentName(student, t)] as const] : [],
    ),
  );
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
  // a message request: the recipient answers it first; the sender has one text message, then waits
  const isRequestBlocking =
    conversation?.status === "pending" &&
    (conversation.incoming === true || (conversation.lastSeq ?? 0) > 0);

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
  const send = async ({ text, photos }: MessageFormValues) => {
    if (userId) {
      try {
        const { id: createdId } = await createRequest(userId, text);
        // the same screen turns into the conversation, without a transition
        router.setParams({ id: createdId, userId: undefined });
        reset();
      } catch (error) {
        toast.error(t(apiErrorKey(error)));
      }
      return;
    }
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

  // the message menu: Report opens the report sheet; Delete removes your own message for everyone,
  // and it stays as a "Message deleted" line
  const handleReportMessage = (message: ApiChatMessage) => {
    setReportedMessageId(message.id);
    reportRef.current?.present();
  };
  const handleDeleteMessage = (message: ApiChatMessage) => {
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

  const title = conversation
    ? conversationTitle(conversation, t)
    : authorName(student) || t("apiState.student");

  // a group opens its members and settings; a direct chat opens the other student's profile
  const handleHeaderPress = () => {
    if (conversation?.kind === "group") {
      return router.push({ pathname: "/chat/group/[id]", params: { id } });
    }
    const peerId = conversation?.peer?.id ?? userId;
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
          {conversation || isDraft ? (
            <UIPressable
              accessibilityRole="button"
              accessibilityLabel={title}
              onPress={handleHeaderPress}
              style={styles.identity}
            >
              <UIAvatar
                size="sm"
                imageSrc={conversation?.peer?.avatarUrl ?? student?.avatarUrl}
              />
              <View style={styles.who}>
                <UIText size="rg" weight="semibold" numberOfLines={1}>
                  {title}
                </UIText>
                {conversation?.kind === "group" ? (
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
            isGroup={isGroup}
            names={memberNames}
            onDeleteMessage={handleDeleteMessage}
            onReportMessage={handleReportMessage}
            onPhotoError={handlePhotoError}
          />
        )}
        {conversation || isDraft ? (
          // over the list's bottom, so messages scroll on under it; the inverted thread keeps its newest
          // message above it. UIPage already lifts it off the home indicator; above the keyboard that gap is dropped
          <KeyboardStickyView
            offset={{ opened: bottomInset }}
            style={styles.composer}
            onLayout={handleComposerLayout}
          >
            {conversation && isRequestBlocking ? (
              <ChatRequestBar conversation={conversation} />
            ) : (
              <MessageComposer
                control={control}
                // a request's first message is text only
                isAttachHidden={isDraft}
                isSendDisabled={!isValid || isCreatingRequest}
                onSendPress={handleSendPress}
              />
            )}
          </KeyboardStickyView>
        ) : null}
      </View>
      {/* a direct child of UIPage, so the cat centres like every other empty state;
          the keyboard shrinks the area, so the composer riding up on it never covers the message */}
      {/* a draft's messages never load, so it shows the request's rule instead */}
      {!isError && (isDraft || !areMessagesPending) && messages.length === 0 ? (
        <KeyboardAvoidingView
          behavior="padding"
          pointerEvents="box-none"
          style={styles.empty}
        >
          <View pointerEvents="box-none" style={styles.emptyArea}>
            <UIEmpty
              isScreenCentred
              message={
                isDraft
                  ? t("chat.requestFirstMessage", { name: title })
                  : t("app.empty")
              }
            />
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
