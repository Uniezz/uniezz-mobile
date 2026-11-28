import {
  type MenuAction,
  MenuView,
  type NativeActionEvent,
} from "@react-native-menu/menu";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { ApiChatMessage } from "@/@types";
import { UIAvatar, UIPressable, UIText } from "@/ui";
import {
  chatDay,
  chatMessageText,
  chatMessageTime,
  chatStudentName,
  isPendingChatMessage,
  isSameDay,
} from "@/utils";
import { MessagePhotos } from "./MessagePhotos";

type MessageProps = {
  message: ApiChatMessage;
  /** the message above, so a new day gets its date line */
  previous?: ApiChatMessage;
  /** the message below, so a group names the sender once, under their last message in a row */
  next?: ApiChatMessage;
  /** sent by the signed-in student, on the right */
  isMine: boolean;
  /** a group chat names who wrote each run of messages from someone else */
  isGroup: boolean;
  /** the other student has read this one, shown under it as "Read" */
  isReadByPeer?: boolean;
  /** names for the ids system messages carry, e.g. the group's members */
  names?: ReadonlyMap<string, string>;
  /** the context menu's Delete, on the student's own message */
  onDelete: (message: ApiChatMessage) => void;
  /** the context menu's Report, on someone else's message */
  onReport: (message: ApiChatMessage) => void;
  /** one of its photos failed to load, e.g. because its link expired */
  onPhotoError: (message: ApiChatMessage) => void;
};

// one message in a thread: a bubble with its album, text and time, or a centred system line.
// A long press opens the native menu, as the profile's ⋯ menu does; from 2.3 the library lifts the
// whole bubble as the menu's preview, where iOS 26 drew a glass lens over tall ones
export const Message = ({
  message,
  previous,
  next,
  isMine,
  isGroup,
  isReadByPeer = false,
  names,
  onDelete,
  onReport,
  onPhotoError,
}: MessageProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const createdAt = Date.parse(message.createdAt);
  const isNewDay =
    !previous || !isSameDay(Date.parse(previous.createdAt), createdAt);
  const hasPhotos = (message.attachments?.length ?? 0) > 0;
  const text = chatMessageText(message, t, names);
  const hasText = Boolean(message.deletedAt || message.body);
  const time = chatMessageTime(message.createdAt, locale);
  // shown before the API stored it: dimmed, and no menu yet
  const isPending = isPendingChatMessage(message);
  // in a group, the last of someone else's run (before another sender, a system line or a new day)
  // carries the sender's avatar and name under it
  const isSenderShown =
    isGroup &&
    !isMine &&
    (!next ||
      next.kind === "system" ||
      next.sender.id !== message.sender.id ||
      !isSameDay(Date.parse(next.createdAt), createdAt));

  // a deleted account has no id, and no profile to open
  const handleSenderPress = () =>
    message.sender.id &&
    router.push({
      pathname: "/student/[id]",
      params: { id: message.sender.id },
    });
  const handleCopy = () =>
    Clipboard.setStringAsync(message.body ?? "").then(() =>
      toast.success(t("chat.copied")),
    );
  // Copy for text; Delete on your own message, Report on someone else's
  const menuActions: MenuAction[] = [
    ...(message.body ? [{ id: "copy", title: t("chat.copy") }] : []),
    isMine
      ? {
          id: "delete",
          title: t("chat.delete"),
          attributes: { destructive: true },
        }
      : {
          id: "report",
          title: t("chat.report"),
          attributes: { destructive: true },
        },
  ];
  const handleMenuAction = ({ nativeEvent }: NativeActionEvent) => {
    if (nativeEvent.event === "copy") return handleCopy();
    if (nativeEvent.event === "delete") return onDelete(message);
    if (nativeEvent.event === "report") return onReport(message);
  };
  const handlePhotoError = () => onPhotoError(message);
  // pending and deleted messages have nothing to act on
  const hasMenu = !isPending && !message.deletedAt;

  const textContent = (
    <>
      <UIText color={message.deletedAt ? "secondary" : "white"}>{text}</UIText>
      <UIText size="xs" style={styles.time(isMine)}>
        {time}
      </UIText>
    </>
  );

  const bubble = (
    <View style={styles.bubble(isMine, hasPhotos, isPending)}>
      {hasPhotos ? (
        <View>
          <MessagePhotos
            attachments={message.attachments ?? []}
            onError={handlePhotoError}
          />
          {/* a photo without text carries its time over the album, as in Telegram */}
          {hasText ? null : (
            <View style={styles.timeOverPhoto}>
              <UIText size="xs" color="white">
                {time}
              </UIText>
            </View>
          )}
        </View>
      ) : null}
      {hasText ? (
        <View style={styles.text(hasPhotos)}>{textContent}</View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.item}>
      {isNewDay ? (
        <UIText size="xs" weight="medium" color="secondary" style={styles.day}>
          {chatDay(createdAt, locale, t("feed.today"))}
        </UIText>
      ) : null}
      {message.kind === "system" ? (
        <UIText size="xs" color="secondary" style={styles.system}>
          {text}
        </UIText>
      ) : (
        <>
          {hasMenu ? (
            <MenuView
              shouldOpenOnLongPress
              // Copy stays first even when the menu opens upward near the composer
              preferredMenuElementOrder="fixed"
              actions={menuActions}
              onPressAction={handleMenuAction}
              style={styles.menu(isMine)}
            >
              {bubble}
            </MenuView>
          ) : (
            bubble
          )}
          {isSenderShown ? (
            <UIPressable
              accessibilityRole="button"
              accessibilityLabel={chatStudentName(message.sender, t)}
              disabled={!message.sender.id}
              onPress={handleSenderPress}
              style={styles.sender}
            >
              <UIAvatar size="xs" imageSrc={message.sender.avatarUrl} />
              <UIText size="xs" weight="semibold" color="secondary">
                {chatStudentName(message.sender, t)}
              </UIText>
            </UIPressable>
          ) : null}
        </>
      )}
      {isReadByPeer ? (
        <UIText size="xs" color="secondary" style={styles.read}>
          {t("chat.read")}
        </UIText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  item: {
    paddingBottom: theme.vs(6),
  },
  day: {
    alignSelf: "center",
    paddingBottom: theme.vs(8),
  },
  system: {
    alignSelf: "center",
    textAlign: "center",
    paddingHorizontal: theme.s(24),
  },
  // under the last message of a run: the avatar, then the name beside it
  // only the avatar and the name are tappable, not the row's empty width
  sender: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
    marginTop: theme.vs(4),
  },
  // the menu wraps the bubble, so it takes the bubble's side
  menu: (mine: boolean) => ({
    alignSelf: mine ? "flex-end" : "flex-start",
  }),
  // a bubble with photos only frames them thinly; its text, if any, keeps its own padding
  bubble: (mine: boolean, hasPhotos: boolean, isPending: boolean) => ({
    alignSelf: mine ? "flex-end" : "flex-start",
    maxWidth: hasPhotos ? undefined : theme.s(260),
    padding: hasPhotos ? theme.s(3) : 0,
    borderRadius: theme.vs(16),
    borderWidth: mine ? 0 : 1,
    borderColor: theme.colors.white10,
    backgroundColor: mine ? theme.colors.blue : theme.colors.surface60,
    opacity: isPending ? 0.6 : 1,
  }),
  // under an album the text is as wide as the album and wraps there
  text: (underPhotos: boolean) => ({
    maxWidth: underPhotos ? theme.s(252) : undefined,
    paddingTop: theme.vs(underPhotos ? 6 : 10),
    paddingBottom: theme.vs(8),
    paddingHorizontal: theme.s(underPhotos ? 11 : 14),
    gap: theme.vs(2),
  }),
  time: (mine: boolean) => ({
    alignSelf: "flex-end",
    color: mine ? theme.colors.white60 : theme.colors.white40,
  }),
  timeOverPhoto: {
    position: "absolute",
    right: theme.s(8),
    bottom: theme.vs(8),
    paddingHorizontal: theme.s(6),
    paddingVertical: theme.vs(2),
    borderRadius: theme.vs(10),
    backgroundColor: theme.colors.ink40,
  },
  read: {
    alignSelf: "flex-end",
    paddingTop: theme.vs(2),
  },
}));
