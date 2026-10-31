import { AuthPage } from "@/components";
import { useOtpScreen } from "@/hooks";
import { Icon, UIButton, UIInput, UIText } from "@/ui";
import { View } from "react-native";
import { CodeField } from "react-native-confirmation-code-field";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

export default function OtpScreen() {
  const { t } = useTranslation();
  const {
    onBackPress,
    email,
    onEmailChange,
    emailError,
    emailPlaceholder,
    props,
    code,
    codeError,
    onCodeChange,
    getCellOnLayoutHandler,
    cellCount,
    autoComplete,
    onButtonPress,
    topText,
    bottomText,
    buttonText,
    backText,
    iconName,
    isEmailStep,
    isButtonDisabled,
  } = useOtpScreen();

  return (
    <AuthPage topText={topText} bottomText={bottomText}>
      {isEmailStep ? (
        <UIInput
          keyboardType="email-address"
          leftIcon={
            <Icon
              name="at-sign"
              size={16}
              uniProps={(theme) => ({ color: theme.colors.white40 })}
            />
          }
          captionText={t("otp.email")}
          placeholder={emailPlaceholder}
          value={email}
          onChangeText={onEmailChange}
          errorText={emailError}
        />
      ) : (
        <View style={styles.codeField}>
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
                  weight="semibold"
                  style={styles.cell(isFocused, isEntered)}
                  onLayout={getCellOnLayoutHandler(index)}
                >
                  {symbol}
                </UIText>
              );
            }}
          />
          {codeError ? (
            <UIText size="sm" weight="semibold" color="error">
              {codeError}
            </UIText>
          ) : null}
        </View>
      )}
      <View style={styles.actionButtons}>
        <UIButton
          style={styles.button}
          onPress={onButtonPress}
          size="rg"
          disabled={isButtonDisabled}
        >
          <Icon
            size={16}
            uniProps={(theme) => ({ color: theme.colors.ink })}
            name={iconName}
          />
          <UIText size="md" weight="semibold" color="black">
            {buttonText}
          </UIText>
        </UIButton>
        <UIButton
          style={styles.button}
          onPress={onBackPress}
          size="rg"
          type="ghost"
        >
          <Icon
            size={16}
            name={"arrow-left"}
            uniProps={(theme) => ({ color: theme.colors.white60 })}
          />
          <UIText weight="semibold" color="secondary">
            {backText}
          </UIText>
        </UIButton>
      </View>
    </AuthPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  cell: (isFocused: boolean, isEntered: boolean) => ({
    width: theme.s(48),
    height: theme.vs(48),
    lineHeight: theme.vs(48),
    fontSize: theme.vs(22),
    borderWidth: isFocused ? 1.5 : 1,
    borderColor: isFocused ? theme.colors.white60 : theme.colors.white10,
    textAlign: "center",
    alignItems: "center",
    color: theme.colors.white,
    borderRadius: theme.vs(16),
    backgroundColor: isEntered ? theme.colors.white10 : theme.colors.white5,
  }),
  codeField: {
    gap: theme.vs(8),
  },
  button: {
    flexDirection: "row",
    gap: theme.s(8),
  },
  actionButtons: {
    marginTop: theme.vs(16),
  },
}));
