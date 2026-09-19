import { useThemeStore } from "@/store/themeStore";
import { StyleSheet } from "react-native-unistyles";
import { darkTheme, goldTheme, lightTheme } from ".";

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
  gold: goldTheme,
};

const breakpoints = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 800,
  xl: 1200,
};

type AppThemes = typeof appThemes;
type AppBreakpoints = typeof breakpoints;

declare module "react-native-unistyles" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    initialTheme: () => {
      return useThemeStore.getState().theme || "dark";
    },
  },
  breakpoints,
  themes: appThemes,
});
