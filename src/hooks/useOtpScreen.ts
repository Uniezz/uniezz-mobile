import { otpDefaultValues, otpSchema, type OtpSchema } from "@/schemas";
import { autoComplete, CELL_COUNT } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { useClearByFocusCell } from "react-native-confirmation-code-field";

export const useOtpScreen = () => {
  const form = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: otpDefaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted },
  } = form;

  const step = useWatch({ control, name: "step" });
  const email = useWatch({ control, name: "email" });
  const code = useWatch({ control, name: "code" });
  const isEmailStep = step === "email";

  const onEmailChange = (value: string) => {
    setValue("email", value, {
      shouldValidate: isSubmitted && isEmailStep,
    });
  };

  const onCodeChange = (value: string) => {
    setValue("code", value, {
      shouldValidate: isSubmitted && !isEmailStep,
    });
  };

  const onButtonPress = handleSubmit((data) => {
    if (data.step === "email") {
      setValue("step", "code");
      setValue("code", "");
    }
  });

  const onBackPress = () => {
    router.back();
  };

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: onCodeChange,
  });

  const topText = isEmailStep
    ? "Provide your university email"
    : "Check your university inbox";
  const bottomText = isEmailStep
    ? "We’ll send a six-digit code to this inbox. Use the address your university issued."
    : `We sent a six-digit code to ${email}. It expires in 5 minutes.`;
  const buttonText = isEmailStep ? "Send code" : "Verify and continue";
  const iconName: "send" | "check" = isEmailStep ? "send" : "check";
  const isButtonDisabled = !isEmailStep && code.length !== CELL_COUNT;

  return {
    form,
    email,
    onEmailChange,
    emailError: errors.email?.message,
    emailPlaceholder: "you@university.edu",
    code,
    onCodeChange,
    onButtonPress,
    onBackPress,
    props,
    getCellOnLayoutHandler,
    cellCount: CELL_COUNT,
    autoComplete,
    topText,
    bottomText,
    buttonText,
    iconName,
    isEmailStep,
    isButtonDisabled,
  };
};
