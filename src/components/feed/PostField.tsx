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
      style={styles.input(Boolean(errorText), Boolean(tall))}
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
  input: (error: boolean, tall: boolean) => ({
    height: tall ? theme.vs(168) : undefined,
    borderRadius: theme.vs(12),
    borderWidth: 1,
    borderColor: error ? theme.colors.red : theme.colors.white12,
    backgroundColor: theme.colors.white3,
    paddingVertical: theme.vs(16),
    paddingHorizontal: theme.s(16),
    color: theme.colors.white,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(16),
    // iOS draws single-line text off-centre (and away from the placeholder) when lineHeight is set
    lineHeight: tall ? theme.vs(16 * 1.4) : undefined,
    textAlignVertical: "top",
  }),
}));
