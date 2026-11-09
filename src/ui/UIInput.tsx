import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { TextInput, TextInputProps, View } from "react-native";
import { UIText } from "./UIText";
import { UIGlass } from "./UIGlass";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { s, vs } from "@/theme/scale";
import { ReactNode } from "react";

const ThemedTextInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.white40,
}));
const ThemedSheetTextInput = withUnistyles(BottomSheetTextInput, (theme) => ({
  placeholderTextColor: theme.colors.white40,
}));

type UIInputProps = {
  captionText?: string;
  leftIcon?: ReactNode;
  errorText?: string;
  /** inside a bottom sheet: uses its input so the sheet moves above the keyboard */
  isInSheet?: boolean;
} & TextInputProps;

export const UIInput = ({
  captionText,
  leftIcon,
  errorText,
  isInSheet,
  editable = true,
  ...props
}: UIInputProps) => {
  const isError = Boolean(errorText);
  const Input = isInSheet ? ThemedSheetTextInput : ThemedTextInput;
  return (
    <View style={styles.container}>
      <UIText size="xs" weight="semibold" color="secondary">
        {captionText}
      </UIText>

      <UIGlass
        style={styles.inputContainer({
          isError,
          editable,
          isMultiline: props.multiline,
        })}
      >
        {leftIcon}
        <Input
          {...props}
          hitSlop={{ top: vs(12), bottom: vs(12), left: s(12), right: s(12) }}
          style={styles.input(props.multiline)}
          autoCorrect={false}
          autoCapitalize="none"
          editable={editable}
        />
      </UIGlass>
      {isError && editable ? (
        <UIText weight="semibold" style={styles.errorText} size={"sm"}>
          {errorText}
        </UIText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "column",
    gap: theme.vs(6),
    width: "100%",
  },
  inputContainer: ({
    isError,
    editable,
    isMultiline,
  }: {
    isError?: boolean;
    editable?: boolean;
    isMultiline?: boolean;
  }) => ({
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: theme.vs(12),
    // multiline starts at one line and grows with the text
    ...(isMultiline ? { minHeight: theme.vs(48) } : { height: theme.vs(48) }),
    alignItems: "center",
    paddingLeft: theme.s(14),
    paddingRight: theme.s(8),
    borderColor: isError && editable ? theme.colors.red : theme.colors.white12,
    gap: theme.s(10),
    backgroundColor: theme.colors.white3,
    opacity: editable ? 1 : 0.5,
  }),
  input: (isMultiline?: boolean) => ({
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(15),
    // no fontWeight: with a custom font, iOS resolves the placeholder to another face and draws it low
    color: theme.colors.white,
    flex: 1,
    // a multiline input grows from its content; the 48pt box (alignItems center) keeps its first line centred
    ...(isMultiline
      ? {
          // a fixed line height fits an emoji line, so adding or removing emoji doesn't change the height
          lineHeight: theme.vs(21),
          paddingTop: theme.vs(12),
          paddingBottom: theme.vs(12),
          textAlignVertical: "top" as const,
        }
      : { height: theme.vs(46) }),
  }),
  errorText: {
    color: theme.colors.red,
  },
}));
