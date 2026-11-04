import type { ComponentProps } from "react";
import { TextInput, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { UIText } from "@/ui";

const ThemedTextInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.white60,
  selectionColor: theme.colors.white,
}));

type PostFieldProps = {
  label: string;
  value: string;
  maxLength: number;
  errorText?: string;
  tall?: boolean;
} & Omit<ComponentProps<typeof TextInput>, "style">;

export const PostField = ({
  label,
  value,
  maxLength,
  errorText,
  tall,
  ...props
}: PostFieldProps) => (
  <View style={styles.field}>
    <View style={styles.top}>
      <UIText size="sm" weight="semibold" color="soft">
        {label}
      </UIText>
      <UIText size="xs" color="secondary">
        {value.length} / {maxLength}
      </UIText>
    </View>
    <ThemedTextInput
      {...props}
      value={value}
      maxLength={maxLength}
      multiline={tall || props.multiline}
      style={styles.input(Boolean(value), Boolean(errorText), Boolean(tall))}
    />
    {errorText ? (
      <UIText size="sm" weight="semibold" color="error">
        {errorText}
      </UIText>
    ) : null}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.vs(8),
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.s(4),
  },
  input: (filled: boolean, error: boolean, tall: boolean) => ({
    minHeight: tall ? theme.vs(168) : undefined,
    borderRadius: theme.vs(20),
    borderWidth: 1,
    borderColor: error
      ? theme.colors.red
      : filled
        ? theme.colors.white40
        : theme.colors.white10,
    backgroundColor: theme.colors.surface60,
    paddingVertical: theme.vs(14),
    paddingHorizontal: theme.s(16),
    color: theme.colors.white,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(16),
    lineHeight: theme.vs(16 * 1.4),
    textAlignVertical: "top",
  }),
}));
