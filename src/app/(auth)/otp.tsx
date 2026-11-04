import { AuthPage } from "@/components";
import { useOtpScreen } from "@/hooks";
import { Icon, UIButton, UIGlass, UIInput, UIText } from "@/ui";
import { Pressable, View } from "react-native";
import { CodeField } from "react-native-confirmation-code-field";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";

export default function OtpScreen() {
  const { t } = useTranslation();
  const {
    onBackPress,
    onResendPress,
    isRequesting,
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
          <UIGlass radius={999} style={styles.emailPill}>
            <Icon
              name="mail"
              size={17}
              uniProps={(theme) => ({ color: theme.colors.white60 })}
            />
            <UIText numberOfLines={1} style={styles.grow}>
              {email}
            </UIText>
            <Pressable
              accessibilityRole="button"
              onPress={onBackPress}
              hitSlop={8}
              style={styles.change}
            >
              <UIText size="body" weight="semibold" color="link">
                {backText}
              </UIText>
            </Pressable>
          </UIGlass>
          <CodeField
            {...props}
            value={code}
            autoFocus
            onChangeText={onCodeChange}
            cellCount={cellCount}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete={autoComplete}
            rootStyle={styles.cells}
            renderCell={({ index, symbol, isFocused }) => {
              return (
                <UIText
                  key={index}
                  weight="semibold"
                  style={styles.cell(isFocused)}
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
          {isEmailStep ? (
            <Icon
              size={16}
              uniProps={(theme) => ({ color: theme.colors.ink })}
              name={iconName}
            />
          ) : null}
          <UIText size="md" weight="semibold" color="black">
            {buttonText}
          </UIText>
        </UIButton>
        {isEmailStep ? (
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
        ) : (
          <View style={styles.resend}>
            <UIText size="sm" color="secondary">
              {t("auth.otp.didntGetIt")}
            </UIText>
            <Pressable
              accessibilityRole="button"
              disabled={isRequesting}
              onPress={onResendPress}
              hitSlop={8}
            >
              <UIText size="sm" weight="semibold" color="link">
                {t("auth.otp.resend")}
              </UIText>
            </Pressable>
          </View>
        )}
      </View>
    </AuthPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  cell: (isFocused: boolean) => ({
    flex: 1,
    height: theme.vs(58),
    lineHeight: theme.vs(58),
    fontSize: theme.vs(26),
    borderWidth: isFocused ? 1.5 : 1,
    borderColor: isFocused ? theme.colors.white : theme.colors.white10,
    textAlign: "center",
    color: theme.colors.white,
    borderRadius: theme.vs(16),
    overflow: "hidden",
    backgroundColor: theme.colors.surface60,
  }),
  cells: {
    gap: theme.s(8),
  },
  emailPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
    paddingVertical: theme.vs(11),
    paddingLeft: theme.s(14),
    paddingRight: theme.s(8),
  },
  grow: {
    flex: 1,
  },
  change: {
    paddingHorizontal: theme.s(8),
    paddingVertical: theme.vs(4),
  },
  resend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.s(4),
    paddingTop: theme.vs(14),
    paddingBottom: theme.vs(8),
  },
  codeField: {
    gap: theme.vs(16),
  },
  button: {
    flexDirection: "row",
    gap: theme.s(8),
  },
  actionButtons: {
    marginTop: theme.vs(16),
  },
}));
