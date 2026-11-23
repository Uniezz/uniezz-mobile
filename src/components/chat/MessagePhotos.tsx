import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIImage, UIPressable } from "@/ui";
import { CHAT_ALBUM_ROWS, previewImages } from "@/utils";

type MessagePhotosProps = {
  urls: string[];
  /** a photo failed to load, e.g. because its link expired */
  onError: () => void;
  /** a long press on any photo, e.g. to delete or report the message */
  onLongPress?: () => void;
};

// a message's photos as one album; a tap opens them full screen from that photo
export const MessagePhotos = ({
  urls,
  onError,
  onLongPress,
}: MessagePhotosProps) => {
  const { t } = useTranslation();
  const rows = CHAT_ALBUM_ROWS[urls.length] ?? [urls.length];
  // where each row's photos start in `urls`
  const starts = rows.map((_, index) =>
    rows.slice(0, index).reduce((sum, size) => sum + size, 0),
  );

  return (
    <View style={styles.album}>
      {rows.map((size, rowIndex) => {
        const start = starts[rowIndex] ?? 0;
        return (
          <View key={rowIndex} style={styles.row(size)}>
            {urls.slice(start, start + size).map((url, offset) => (
              <UIPressable
                key={url}
                accessibilityRole="imagebutton"
                accessibilityLabel={t("app.openImage")}
                onPress={() => previewImages(urls, start + offset)}
                onLongPress={onLongPress}
                style={styles.photo}
              >
                <UIImage
                  source={{ uri: url }}
                  fallback={undefined}
                  contentFit="cover"
                  onError={onError}
                  style={StyleSheet.absoluteFill}
                />
              </UIPressable>
            ))}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  // the album fills the bubble's width, with thin gaps between photos as in Telegram
  album: {
    width: theme.s(252),
    gap: theme.s(2),
    borderRadius: theme.vs(13),
    overflow: "hidden",
  },
  // a lone photo stands tall; more photos per row make the row shorter
  row: (size: number) => ({
    flexDirection: "row",
    gap: theme.s(2),
    height: theme.s(size === 1 ? 220 : size === 2 ? 140 : 100),
  }),
  photo: {
    flex: 1,
    backgroundColor: theme.colors.surface60,
  },
}));
