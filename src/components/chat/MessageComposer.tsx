import { Control, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Pressable, TextInput } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import type { MessageFormValues } from "@/@types/chat";
import { Icon, UIGlass, UIIconButton } from "@/ui";

const ThemedTextInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.white60,
  selectionColor: theme.colors.white,
}));

type MessageComposerProps = {
  /** the conversation screen owns the form */
  control: Control<MessageFormValues>;
  isSendDisabled: boolean;
  onSendPress: () => void;
};

// the message field under a conversation
export const MessageComposer = ({
  control,
  isSendDisabled,
  onSendPress,
}: MessageComposerProps) => {
  const { t } = useTranslation();

  return (
    <>
      {/* shortcut: placeholder from the design, attachments aren't supported yet; wire it up once chat has a backend */}
      <UIIconButton
        size="lg"
        disabled
        accessibilityRole="button"
        accessibilityLabel={t("app.attach")}
        accessibilityState={{ disabled: true }}
      >
        <Icon
          name="plus"
          size={20}
          uniProps={(theme) => ({ color: theme.colors.white80 })}
        />
      </UIIconButton>
      <Controller
        control={control}
        name="text"
        render={({ field }) => (
          <UIGlass
            // half the 44pt height: a pill on one line, a rounded box (not an oval) once it grows
            radius={22}
            style={styles.field}
          >
            <ThemedTextInput
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder={t("app.message")}
              maxLength={2000}
              multiline
              style={styles.input}
            />
          </UIGlass>
        )}
      />
      <Pressable
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
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
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
