import { CELL_COUNT } from "@/utils";
import { router } from "expo-router";
import { useState } from "react";
import {
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

enum OtpStep {
  Email,
  OtpCode,
}

export const useOtpPage = () => {
  const [step, setStep] = useState<OtpStep>(OtpStep.Email);
  const [otp, setOtp] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const onButtonPress = () => {
    setStep((prev) =>
      prev === OtpStep.Email ? OtpStep.OtpCode : OtpStep.Email,
    );
  };

  const onBackPress = () => {
    router.back();
  };

  const ref = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });
  const isEmailStep = step === OtpStep.Email;
  const topText = isEmailStep
    ? "Provide your university email"
    : "Check your university inbox";

  const bottomText = isEmailStep
    ? "We’ll send a six-digit code to this inbox. Use the address your university issued."
    : `We sent a six-digit code to ${email}. It expires in 5 minutes.`;
  const buttonText = isEmailStep ? "Send code" : "Verify and continue";
  const iconName: "send" | "check" = isEmailStep ? "send" : "check";

  return {
    otp,
    setOtp,
    email,
    setEmail,
    onButtonPress,
    onBackPress,
    ref,
    props,
    getCellOnLayoutHandler,
    topText,
    bottomText,
    buttonText,
    iconName,
    isEmailStep,
  };
};
