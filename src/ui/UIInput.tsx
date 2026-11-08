import { TextInput, TextInputProps, View } from "react-native";
import { UIText } from "./UIText";
import { UIGlass } from "./UIGlass";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { s, vs } from "@/theme/scale";
import { ReactNode } from "react";

const ThemedTextInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.white40,
}));

type UIInputProps = {
  captionText?: string;
  leftIcon?: ReactNode;
  errorText?: string;
} & TextInputProps;

export const UIInput = ({
  captionText,
  leftIcon,
  errorText,
  editable = true,
  ...props
}: UIInputProps) => {
  const isError = Boolean(errorText);
  return (
    <View style={styles.container}>
      <UIText size="xs" weight="semibold" color="secondary">
        {captionText}
      </UIText>

      <UIGlass style={styles.inputContainer({ isError, editable })}>
        {leftIcon}
        <ThemedTextInput
          {...props}
          hitSlop={{ top: vs(12), bottom: vs(12), left: s(12), right: s(12) }}
          style={styles.input}
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
  }: {
    isError?: boolean;
    editable?: boolean;
  }) => ({
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: theme.vs(12),
    height: theme.vs(48),
    alignItems: "center",
    paddingLeft: theme.s(14),
    paddingRight: theme.s(8),
    borderColor: isError && editable ? theme.colors.red : theme.colors.white12,
    gap: theme.s(10),
    backgroundColor: theme.colors.white3,
    opacity: editable ? 1 : 0.5,
  }),
  input: {
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(15),
    fontWeight: "400",
    color: theme.colors.white,
    flex: 1,
    height: theme.vs(46),
  },
  errorText: {
    color: theme.colors.red,
  },
}));
