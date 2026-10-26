import { otpDefaultValues, otpSchema, type OtpSchema } from "@/schemas";
import { autoComplete, CELL_COUNT } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { useClearByFocusCell } from "react-native-confirmation-code-field";
import { useRequestOtpCode, useVerifyOtpCode } from "./auth";

export const useOtpScreen = () => {
  const { university = "" } = useLocalSearchParams<{ university?: string }>();
  const { mutateAsync: requestCode, isPending: isRequesting } =
    useRequestOtpCode();
  const { mutateAsync: verifyCode, isPending: isVerifying } =
    useVerifyOtpCode();
  const isPending = isRequesting || isVerifying;

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
    setError,
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

  const onButtonPress = handleSubmit(async (data) => {
    try {
      if (data.step === "email") {
        await requestCode({ email: data.email, university });
        setValue("step", "code");
        setValue("code", "");
      } else {
        await verifyCode({ code: data.code, email: data.email, university });
      }
    } catch (error) {
      setError(data.step, {
        message: error instanceof Error ? error.message : "Please try again.",
      });
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
    : `We sent a six-digit code to ${email}. It expires in 10 minutes.`;
  const buttonText = isEmailStep ? "Send code" : "Verify and continue";
  const iconName: "send" | "check" = isEmailStep ? "send" : "check";
  const isButtonDisabled =
    isPending || (!isEmailStep && code.length !== CELL_COUNT);

  return {
    form,
    email,
    onEmailChange,
    emailError: errors.email?.message,
    emailPlaceholder: "you@university.edu",
    code,
    codeError: errors.code?.message,
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
