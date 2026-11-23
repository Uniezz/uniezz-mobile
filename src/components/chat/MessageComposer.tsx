import { launchImageLibraryAsync } from "expo-image-picker";
import { Control, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextInput, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import type { MessageFormValues } from "@/@types";
import { UIPressable, Icon, UIGlass, UIIconButton } from "@/ui";
import { MAX_CHAT_PHOTOS } from "@/utils";
import { DraftPhotos } from "./DraftPhotos";

const ThemedTextInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.white60,
  selectionColor: theme.colors.white,
}));

type MessageComposerProps = {
  /** the conversation screen owns the form: the text and the photos picked for it */
  control: Control<MessageFormValues>;
  isSendDisabled: boolean;
  onSendPress: () => void;
};

// the message field under a conversation; picked photos wait in a row above it, full width
export const MessageComposer = ({
  control,
  isSendDisabled,
  onSendPress,
}: MessageComposerProps) => {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name="photos"
      render={({ field }) => {
        const photos = field.value;
        const hasPhotos = photos.length > 0;
        const isAttachDisabled = photos.length >= MAX_CHAT_PHOTOS;
        const handleAttachPress = async () => {
          const result = await launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true,
            selectionLimit: MAX_CHAT_PHOTOS - photos.length,
            quality: 0.8,
          });
          if (result.canceled) return;
          const picked = result.assets
            .map(({ uri, mimeType, fileSize }) => ({
              uri,
              mimeType,
              fileSize,
            }))
            .filter(({ uri }) => !photos.some((photo) => photo.uri === uri));
          field.onChange([...photos, ...picked].slice(0, MAX_CHAT_PHOTOS));
        };
        const handleRemovePhoto = (uri: string) =>
          field.onChange(photos.filter((photo) => photo.uri !== uri));

        return (
          <View>
            {hasPhotos ? (
              <View style={styles.photos}>
                <DraftPhotos photos={photos} onRemove={handleRemovePhoto} />
              </View>
            ) : null}
            <View style={styles.row}>
              <UIIconButton
                size="lg"
                disabled={isAttachDisabled}
                accessibilityRole="button"
                accessibilityLabel={t("app.attach")}
                accessibilityState={{ disabled: isAttachDisabled }}
                onPress={handleAttachPress}
              >
                <Icon
                  name="plus"
                  size={20}
                  uniProps={(theme) => ({ color: theme.colors.white80 })}
                />
              </UIIconButton>
              <UIGlass
                // half the 44pt height: a pill on one line, a rounded box (not an oval) once it grows
                radius={22}
                style={styles.field}
              >
                <Controller
                  control={control}
                  name="text"
                  render={({ field: textField }) => (
                    <ThemedTextInput
                      allowFontScaling={false}
                      value={textField.value}
                      onChangeText={textField.onChange}
                      onBlur={textField.onBlur}
                      placeholder={t("app.message")}
                      maxLength={2000}
                      multiline
                      style={styles.input}
                    />
                  )}
                />
              </UIGlass>
              <UIPressable
                accessibilityRole="button"
                accessibilityLabel={t("app.send")}
                disabled={isSendDisabled}
                onPress={onSendPress}
                style={styles.send(isSendDisabled)}
              >
                <Icon
                  name="arrow-up"
                  size={18}
                  uniProps={(theme) => ({ color: theme.colors.ink })}
                />
              </UIPressable>
            </View>
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  // picked photos run edge to edge above the field, past the page's 16pt side padding
  photos: {
    marginHorizontal: -theme.s(16),
    marginBottom: theme.vs(8),
    paddingVertical: theme.vs(10),
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.s(8),
  },
  // grows from one 44pt line up to a few lines
  field: {
    flex: 1,
    minHeight: theme.vs(44),
    maxHeight: theme.vs(120),
    justifyContent: "center",
    paddingHorizontal: theme.s(16),
  },
  input: {
    maxHeight: theme.vs(118),
    lineHeight: theme.vs(22),
    paddingTop: theme.vs(10),
    paddingBottom: theme.vs(10),
    color: theme.colors.white,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(16),
  },
  send: (isDisabled: boolean) => ({
    width: theme.vs(44),
    height: theme.vs(44),
    borderRadius: theme.vs(22),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    opacity: isDisabled ? 0.5 : 1,
  }),
}));
