import { otpDefaultValues, otpSchema, type OtpSchema } from "@/schemas";
import { autoComplete, CELL_COUNT } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { useClearByFocusCell } from "react-native-confirmation-code-field";
import { useRequestOtpCode, useVerifyOtpCode } from "./auth";
import { useTranslation } from "react-i18next";

export const useOtpScreen = () => {
  const { t, i18n } = useTranslation();
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
    clearErrors,
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
    // validate only on submit; typing just clears the previous error
    setValue("code", value);
    if (errors.code) clearErrors("code");
  };

  const onButtonPress = handleSubmit(async (data) => {
    if (!university) {
      router.replace("/(auth)");
      return;
    }

    try {
      if (data.step === "email") {
        await requestCode({ email: data.email, university });
        setValue("step", "code");
        setValue("code", "");
      } else {
        await verifyCode({ code: data.code, email: data.email, university });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error && i18n.exists(error.message)
          ? error.message
          : "common.tryAgain";
      setError(data.step, {
        message: errorMessage,
      });
    }
  });

  const onBackPress = () => {
    if (isEmailStep) {
      router.back();
      return;
    }

    clearErrors();
    setValue("step", "email");
  };

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: onCodeChange,
  });

  const topText = isEmailStep
    ? t("otp.provideUniversityEmail")
    : t("otp.checkInbox");
  const bottomText = isEmailStep
    ? t("otp.emailInstructions")
    : t("otp.codeSent", { email });
  const buttonText = isEmailStep
    ? t("otp.sendCode")
    : t("otp.verifyAndContinue");
  const backText = isEmailStep
    ? t("auth.backToUniversities")
    : t("otp.changeEmail");
  const iconName: "send" | "check" = isEmailStep ? "send" : "check";
  const isButtonDisabled =
    isPending || (!isEmailStep && code.length !== CELL_COUNT);

  return {
    form,
    email,
    onEmailChange,
    emailError: errors.email?.message ? t(errors.email.message) : undefined,
    emailPlaceholder: t("otp.emailPlaceholder"),
    code,
    codeError: errors.code?.message ? t(errors.code.message) : undefined,
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
    backText,
    iconName,
    isEmailStep,
    isButtonDisabled,
  };
};
