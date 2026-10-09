import { UIButton, UIInput, UIPage, UIText } from "@/ui";
import { autoComplete, CELL_COUNT } from "@/utils";
import { useState } from "react";
import { View } from "react-native";
import {
  CodeField,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { StyleSheet } from "react-native-unistyles";
{
  /*
  TODO: generate two steps in
  design for this page - provide email
  and otp for mobile

  split screen into smaller components
  */
}
export default function OtpScreen() {
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
  const [step, setStep] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const onButtonPress = () => {
    setStep((prev) => !prev);
  };
  const ref = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });
  return (
    <UIPage style={styles.root}>
      <View style={styles.container}>
        {step === false ? (
          <View style={styles.otpContainer}>
            <UIText weight="bold" size="lg">
              Check your university inbox
            </UIText>
            <UIText color="gray">
              We sent a six-digit code to {email}. It expires in 5 minutes.
            </UIText>
            <CodeField
              ref={ref}
              {...props}
              value={otp}
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
          </View>
        ) : (
          <View style={styles.emailContainer}>
            <UIText weight="bold" size="lg">
              Provide your university email
            </UIText>
            {/*TODO: add email icon in UIInput*/}
            <UIInput
              captionText="Email"
              value={email}
              onChangeText={setEmail}
              editable
            />
          </View>
        )}
      </View>
      {/*
        TODO: use here react-native-keyboard-controller,
        so button moves above keyboard
        */}
      <View style={styles.container}>
        <UIButton onPress={onButtonPress} radius="md" size="rg">
          {/*
            TODO: add here check icon if step is otp code
            */}
          <UIText size="md" weight="semibold" color="white">
            {step === true ? "Send code" : "Verify and continue"}
          </UIText>
        </UIButton>
      </View>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    paddingHorizontal: theme.s(16),
    justifyContent: "center",
  },
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
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  otpContainer: {
    gap: theme.vs(10),
  },
  emailContainer: { gap: theme.vs(20) },
}));
