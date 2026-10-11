import { AuthPage } from "@/components";
import { Icon, UIButton, UIInput, UIText } from "@/ui";
import { autoComplete, CELL_COUNT } from "@/utils";
import { CodeField } from "react-native-confirmation-code-field";
import { StyleSheet } from "react-native-unistyles";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useOtpPage } from "@/hooks";
{
  /*
  TODO: instead of direct states define and use schema in
  src/schemas/otp.ts
  schema need to have current step, pretty error text

  move all logic into useOtpScreen hook so we can
  have clean screen with only UI defined - in need to have all
  handlers, variables, react hook form
  */
}
export default function OtpScreen() {
  const {
    onBackPress,
    email,
    setEmail,
    ref,
    props,
    otp,
    setOtp,
    getCellOnLayoutHandler,
    onButtonPress,
    topText,
    bottomText,
    buttonText,
    iconName,
    isEmailStep,
  } = useOtpPage();

  return (
    <AuthPage topText={topText} bottomText={bottomText}>
      {isEmailStep ? (
        // TODO: add here on input some placeholder
        <UIInput
          keyboardType="email-address"
          autoFocus
          leftIcon={<Icon name="at-sign" size={18} color={"gray"} />}
          captionText="Email"
          value={email}
          onChangeText={setEmail}
        />
      ) : (
        <CodeField
          ref={ref}
          {...props}
          value={otp}
          autoFocus
          onChangeText={setOtp}
          cellCount={CELL_COUNT}
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
        {/*
          TODO:
          This button need to be disabled
          while on otp and did not fully provided code
          */}
        <UIButton
          style={styles.button}
          onPress={onButtonPress}
          radius="md"
          size="rg"
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
