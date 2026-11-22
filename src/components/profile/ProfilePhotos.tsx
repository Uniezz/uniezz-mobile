import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ProfileGalleryPhoto } from "@/@types";
import { Icon, UIFadeScrollView, UIImage, UIPressable, UIText } from "@/ui";
import { MAX_PROFILE_PHOTOS, previewImages } from "@/utils";

type ProfilePhotosProps = {
  photos: ProfileGalleryPhoto[];
  /** shows an add tile while there is room, for the own profile */
  onAddPress?: () => void;
  isAdding?: boolean;
  /** shows a remove button on every photo with an id */
  onRemovePress?: (id: string) => void;
};

// the profile's photos in a row, the avatar first; a tap opens them full screen
export const ProfilePhotos = ({
  photos,
  onAddPress,
  isAdding,
  onRemovePress,
}: ProfilePhotosProps) => {
  const { t } = useTranslation();
  const urls = photos.map((photo) => photo.url);
  const handlePhotoPress = (index: number) => previewImages(urls, index);
  const handleRemovePress = (id: string) => onRemovePress?.(id);

  return (
    <View style={styles.section}>
      <View style={styles.top}>
        <UIText size="md" weight="semibold">
          {t("students.photos")}
        </UIText>
        {onAddPress ? (
          <UIText size="xs" color="secondary">
            {photos.length} / {MAX_PROFILE_PHOTOS}
          </UIText>
        ) : null}
      </View>
      <UIFadeScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroller}
        contentContainerStyle={styles.row}
      >
        {photos.map(({ url, id }, index) => (
          <UIPressable
            key={url}
            accessibilityRole="imagebutton"
            accessibilityLabel={t("app.openImage")}
            onPress={() => handlePhotoPress(index)}
            style={styles.thumb}
          >
            <UIImage
              source={{ uri: url }}
              fallback={undefined}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
            />
            {onRemovePress && id ? (
              <UIPressable
                accessibilityRole="button"
                accessibilityLabel={t("postComposer.removePhoto")}
                onPress={() => handleRemovePress(id)}
                hitSlop={6}
                style={styles.remove}
              >
                <Icon name="x" size={13} />
              </UIPressable>
            ) : null}
          </UIPressable>
        ))}
        {onAddPress && photos.length < MAX_PROFILE_PHOTOS ? (
          <UIPressable
            accessibilityRole="button"
            accessibilityLabel={t("postComposer.addPhoto")}
            disabled={isAdding}
            onPress={onAddPress}
            style={styles.add}
          >
            <Icon name="plus" size={20} />
          </UIPressable>
        ) : null}
      </UIFadeScrollView>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.vs(12),
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  // bleeds past the page's side padding, so photos scroll to the screen edge instead of clipping 20pt in
  scroller: {
    marginHorizontal: -theme.s(20),
  },
  row: {
    gap: theme.s(8),
    paddingHorizontal: theme.s(20),
  },
  thumb: {
    width: theme.vs(96),
    height: theme.vs(128),
    borderRadius: theme.vs(16),
    overflow: "hidden",
    backgroundColor: theme.colors.surface60,
  },
  add: {
    width: theme.vs(96),
    height: theme.vs(128),
    borderRadius: theme.vs(16),
    borderWidth: 1,
    borderColor: theme.colors.white12,
    backgroundColor: theme.colors.white3,
    alignItems: "center",
    justifyContent: "center",
  },
  remove: {
    position: "absolute",
    top: theme.vs(6),
    right: theme.s(6),
    width: theme.vs(22),
    height: theme.vs(22),
    borderRadius: theme.vs(11),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.ink70,
  },
}));
