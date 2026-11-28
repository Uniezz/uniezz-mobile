import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import type { PickedImage } from "@/@types";
import { Icon, UIFadeScrollView, UIImage, UIPressable } from "@/ui";
import { previewImages } from "@/utils";

type DraftPhotosProps = {
  photos: PickedImage[];
  onRemove: (uri: string) => void;
};

// photos picked for the next message, in a row above the composer; a tap opens them full screen
export const DraftPhotos = ({ photos, onRemove }: DraftPhotosProps) => {
  const { t } = useTranslation();
  const uris = photos.map(({ uri }) => uri);

  return (
    // fades at an edge while more photos hide past it, as the post photos row
    <UIFadeScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}
    >
      {uris.map((uri, index) => (
        <UIPressable
          key={uri}
          accessibilityRole="imagebutton"
          accessibilityLabel={t("app.openImage")}
          onPress={() => previewImages(uris, index)}
          style={styles.thumb}
        >
          <UIImage
            source={{ uri }}
            fallback={undefined}
            contentFit="cover"
            accessibilityLabel={t("postComposer.photoPreview")}
            style={StyleSheet.absoluteFill}
          />
          <UIPressable
            accessibilityRole="button"
            accessibilityLabel={t("postComposer.removePhoto")}
            onPress={() => onRemove(uri)}
            hitSlop={6}
            style={styles.remove}
          >
            <Icon name="x" size={12} />
          </UIPressable>
        </UIPressable>
      ))}
    </UIFadeScrollView>
  );
};

const styles = StyleSheet.create((theme) => ({
  // lines the first photo up with the composer under it
  row: {
    gap: theme.s(8),
    paddingHorizontal: theme.s(16),
  },
  thumb: {
    width: theme.vs(72),
    height: theme.vs(72),
    borderRadius: theme.vs(12),
    overflow: "hidden",
    backgroundColor: theme.colors.surface60,
  },
  remove: {
    position: "absolute",
    top: theme.vs(4),
    right: theme.s(4),
    width: theme.vs(20),
    height: theme.vs(20),
    borderRadius: theme.vs(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.ink70,
  },
}));
