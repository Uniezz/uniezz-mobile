import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import { Alert, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { Connection } from "@/@types/connections";
import { useConnections, useDeleteConnection } from "@/hooks/useConnections";
import { UIAvatar, UIText } from "@/ui";

// shortcut: opens the revealed profile, not a thread; open the match's chat once the chat backend lands (UNI-43)
export function ConnectionAvatarList() {
  const { t } = useTranslation();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConnections();
  const { mutateAsync: removeConnection } = useDeleteConnection();
  const connections = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  if (connections.length === 0) return null;

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleOpen = (connection: Connection) =>
    router.push(`/student/${connection.profile.id}`);
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
        renderItem={({ item: connection }) => {
          const handlePress = () => handleOpen(connection);
          const handleLongPress = () => handleRemove(connection);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityHint={t("connections.removeHint")}
              onPress={handlePress}
              onLongPress={handleLongPress}
              style={styles.match}
            >
              <UIAvatar size="lg" imageSrc={connection.profile.avatarUrl} />
              <UIText size="xs" numberOfLines={1}>
                {connection.profile.firstName ?? t("apiState.student")}
              </UIText>
              <UIText size="xs" color="secondary" numberOfLines={1}>
                {t(`app.${connection.mode}`)}
              </UIText>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { gap: theme.vs(8) },
  match: {
    width: theme.s(64),
    // FlashList ignores gap, so each match keeps its own spacing
    marginRight: theme.s(14),
    alignItems: "center",
    gap: theme.vs(2),
  },
}));
