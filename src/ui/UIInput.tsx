import { TextInput, TextInputProps, View } from "react-native";
import { UIText } from "./UIText";
import { StyleSheet } from "react-native-unistyles";
import { s, vs } from "@/theme/scale";
import { ReactNode } from "react";

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
      <UIText size={"sm"}>{captionText}</UIText>

      <View style={styles.inputContainer({ isError, editable })}>
        {leftIcon}
        <TextInput
          hitSlop={{ top: vs(12), bottom: vs(12), left: s(12), right: s(12) }}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          editable={editable}
          placeholderTextColor={"grey"}
          {...props}
        />
      </View>
      {isError && editable ? (
        <UIText weight="bold" style={styles.errorText} size={"sm"}>
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
    borderWidth: theme.vs(1),
    borderRadius: theme.vs(8),
    height: theme.vs(41),
    alignItems: "center",
    paddingVertical: theme.vs(12),
    paddingHorizontal: theme.s(12),
    borderColor:
      isError && editable ? theme.colors.error : theme.colors.graySoft,
    gap: theme.s(10),
    backgroundColor: !editable
      ? theme.colors.grayLight
      : isError
        ? theme.colors.errorLight
        : theme.colors.white,
  }),
  input: {
    fontFamily: theme.fonts.PlusJakartaSans,
    fontWeight: "semibold",
  },
  errorText: {
    color: theme.colors.error,
  },
}));
