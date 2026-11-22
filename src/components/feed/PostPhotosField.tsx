import { usePostHog } from "posthog-react-native";
import { captureAction, MAX_POST_PHOTOS, previewImages } from "@/utils";
import { Image } from "expo-image";
import { launchImageLibraryAsync } from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { PickedImage } from "@/@types";
import { UIPressable, Icon, UIFadeScrollView, UIText } from "@/ui";

type PostPhotosFieldProps = {
  value: PickedImage[];
  onChange: (photos: PickedImage[]) => void;
};

export const PostPhotosField = ({ value, onChange }: PostPhotosFieldProps) => {
  const { t } = useTranslation();
  const posthog = usePostHog();

  const handleAddPress = async () => {
    captureAction(posthog, "post_photos_pick", "attempted");
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_POST_PHOTOS - value.length,
      quality: 0.8,
    }).catch((error: unknown) => {
      captureAction(posthog, "post_photos_pick", "failed");
      throw error;
    });
    if (result.canceled) {
      captureAction(posthog, "post_photos_pick", "cancelled");
      return;
    }
    captureAction(posthog, "post_photos_pick", "succeeded");
    const picked = result.assets.map(({ uri, mimeType, fileSize }) => ({
      uri,
      mimeType,
      fileSize,
    }));
    // any format and size goes: the upload converts and shrinks it to fit
    const valid = picked.filter(
      (photo) => !value.some((existing) => existing.uri === photo.uri),
    );
    if (valid.length < picked.length) {
      captureAction(posthog, "post_photos", "validation_failed");
      toast.error(t("postComposer.duplicatePhoto"));
    }
    onChange([...value, ...valid].slice(0, MAX_POST_PHOTOS));
  };

  const removePhoto = (uri: string) => {
    toast.dismiss();
    onChange(value.filter((photo) => photo.uri !== uri));
  };

  const handlePhotoPress = (index: number) =>
    previewImages(
      value.map((photo) => photo.uri),
      index,
    );

  return (
    <View style={styles.field}>
      <View style={styles.top}>
        <UIText size="sm" weight="semibold" color="soft">
          {t("postComposer.photos")}
        </UIText>
        <UIText size="xs" color="secondary">
          {value.length} / {MAX_POST_PHOTOS}
        </UIText>
      </View>
      <UIFadeScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroller}
        contentContainerStyle={styles.row}
      >
        {value.length < MAX_POST_PHOTOS ? (
          <UIPressable
            accessibilityRole="button"
            accessibilityLabel={t("postComposer.addPhoto")}
            onPress={handleAddPress}
            style={styles.add}
          >
            <Icon name="plus" size={20} />
          </UIPressable>
        ) : null}
        {value.map((photo, index) => (
          <UIPressable
            key={photo.uri}
            accessibilityRole="imagebutton"
            accessibilityLabel={t("app.openImage")}
            onPress={() => handlePhotoPress(index)}
            style={styles.thumb}
          >
            <Image
              source={{ uri: photo.uri }}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
              accessibilityLabel={t("postComposer.photoPreview")}
            />
            <UIPressable
              accessibilityRole="button"
              accessibilityLabel={t("postComposer.removePhoto")}
              onPress={() => removePhoto(photo.uri)}
              hitSlop={6}
              style={styles.remove}
            >
              <Icon name="x" size={13} />
            </UIPressable>
          </UIPressable>
        ))}
      </UIFadeScrollView>
      <UIText size="xs" color="secondary" style={styles.hint}>
        {t("postComposer.photosHint")}
      </UIText>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.vs(8),
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.s(4),
  },
  // bleeds past the page's side padding, so photos scroll to the screen edge instead of clipping 20pt in
  scroller: {
    marginHorizontal: -theme.s(20),
  },
  row: {
    gap: theme.s(8),
    paddingHorizontal: theme.s(20),
  },
  add: {
    width: theme.vs(84),
    height: theme.vs(84),
    borderRadius: theme.vs(16),
    borderWidth: 1,
    borderColor: theme.colors.white12,
    backgroundColor: theme.colors.white3,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: theme.vs(84),
    height: theme.vs(84),
    borderRadius: theme.vs(16),
    overflow: "hidden",
    backgroundColor: theme.colors.surface60,
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
  hint: {
    paddingHorizontal: theme.s(4),
  },
}));
