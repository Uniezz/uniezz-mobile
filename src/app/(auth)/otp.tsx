import { AuthPage } from "@/components";
import { useOtpScreen } from "@/hooks";
import { Icon, UIButton, UIInput, UIText } from "@/ui";
import { CodeField } from "react-native-confirmation-code-field";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";

export default function OtpScreen() {
  const {
    onBackPress,
    email,
    onEmailChange,
    emailError,
    emailPlaceholder,
    props,
    code,
    onCodeChange,
    getCellOnLayoutHandler,
    cellCount,
    autoComplete,
    onButtonPress,
    topText,
    bottomText,
    buttonText,
    iconName,
    isEmailStep,
    isButtonDisabled,
  } = useOtpScreen();

  return (
    <AuthPage topText={topText} bottomText={bottomText}>
      {isEmailStep ? (
        <UIInput
          keyboardType="email-address"
          autoFocus
          leftIcon={<Icon name="at-sign" size={18} color={"gray"} />}
          captionText="Email"
          placeholder={emailPlaceholder}
          value={email}
          onChangeText={onEmailChange}
          errorText={emailError}
        />
      ) : (
        <CodeField
          {...props}
          value={code}
          autoFocus
          onChangeText={onCodeChange}
          cellCount={cellCount}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete={autoComplete}
          renderCell={({ index, symbol, isFocused }) => {
            const isEntered = symbol.length !== 0;
            return (
              <UIText
                key={index}
                size="xl"
                style={styles.cell(isFocused, isEntered)}
                onLayout={getCellOnLayoutHandler(index)}
              >
                {symbol}
              </UIText>
            );
          }}
        />
      )}
      <KeyboardStickyView
        offset={{
          closed: styles.keyboardStickyView(false).height,
          opened: styles.keyboardStickyView(true).height,
        }}
        style={styles.actionButtons}
      >
        <UIButton
          style={styles.button}
          onPress={onButtonPress}
          radius="md"
          size="rg"
          disabled={isButtonDisabled}
        >
          <Icon size={16} color={"white"} name={iconName} />
          <UIText size="md" weight="semibold" color="white">
            {buttonText}
          </UIText>
        </UIButton>
        <UIButton
          style={styles.button}
          onPress={onBackPress}
          radius="md"
          size="rg"
          type="ghost"
        >
          <Icon size={16} name={"arrow-left"} color={"rgb(89, 100, 138)"} />
          <UIText weight="semibold" color="secondary">
            Back to universities
          </UIText>
        </UIButton>
      </KeyboardStickyView>
    </AuthPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  cell: (isFocused: boolean, isEntered: boolean) => ({
    width: theme.s(48),
    height: theme.vs(48),
    lineHeight: theme.vs(48),
    borderWidth: theme.s(1),
    borderColor: isFocused ? theme.colors.brand : theme.colors.gray,
    textAlign: "center",
    alignItems: "center",
    color: theme.colors.black,
    borderRadius: theme.vs(10),
    backgroundColor: isEntered ? "transparent" : theme.colors.brandLight,
  }),
  button: {
    flexDirection: "row",
    gap: theme.s(8),
  },
  actionButtons: {
    flex: 1,
    justifyContent: "flex-end",
  },
  keyboardStickyView: (open: boolean) => ({
    height: open ? rt.insets.bottom + theme.vs(16) : 0,
  }),
}));
