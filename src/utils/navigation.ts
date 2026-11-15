import { darkTheme } from "@/theme";

// expo-router mounts react-navigation's light default theme, which paints the area behind every
// native stack light grey, so the stack container and each screen are pinned to the app background
export const stackScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: darkTheme.colors.ink },
} as const;

export const stackHostNativeProps = {
  nativeContainerStyle: { backgroundColor: darkTheme.colors.ink },
} as const;

export const tabsHostNativeProps = {
  nativeContainerStyle: { backgroundColor: darkTheme.colors.ink },
} as const;
