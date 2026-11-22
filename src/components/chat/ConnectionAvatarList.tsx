import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import { Alert, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { Connection } from "@/@types";
import {
  useConnections,
  useDeleteConnection,
  useOpenDirectChat,
} from "@/hooks";
import { UIText } from "@/ui";
import { ConnectionAvatar } from "./ConnectionAvatar";

// a tap opens the direct conversation with the match
export function ConnectionAvatarList() {
  const { t } = useTranslation();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConnections();
  const { mutateAsync: removeConnection } = useDeleteConnection();
  const { openChat } = useOpenDirectChat();
  const connections = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  if (connections.length === 0) return null;

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleOpen = (connection: Connection) =>
    openChat(connection.profile.id);
  const handleRemove = (connection: Connection) =>
    Alert.alert(
      t("connections.removeTitle"),
      t("connections.removeDescription"),
      [
        { text: t("postComposer.cancel"), style: "cancel" },
        {
          text: t("app.remove"),
          style: "destructive",
          onPress: () =>
            removeConnection(connection.id).catch(() =>
              toast.error(t("apiState.error")),
            ),
        },
      ],
    );

  return (
    <View style={styles.section}>
      <UIText size="sm" weight="semibold" color="secondary">
        {t("connections.matches")}
      </UIText>
      <FlashList
        horizontal
        data={connections}
        keyExtractor={(connection) => connection.id}
        showsHorizontalScrollIndicator={false}
        onEndReached={handleEndReached}
        renderItem={({ item: connection }) => (
          <ConnectionAvatar
            connection={connection}
            onOpen={handleOpen}
            onRemove={handleRemove}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { gap: theme.vs(8) },
}));
