import { useSetHeader } from "@/hooks/useSetHeader";
import { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type SafeAreaMode = "above-tabs" | "under-tabs" | "none";

interface UIScreenProps {
  children: ReactNode;
  title?: string;
  rightAction?: ReactNode;
  leftAction?: ReactNode;
  safeAreaMode?: SafeAreaMode;
}

export function UIScreen({
  title,
  children,
  rightAction,
  leftAction,
  safeAreaMode = "above-tabs",
}: UIScreenProps) {
  const hasHeader = !!(title || rightAction || leftAction);

  useSetHeader({ title, rightAction, leftAction });

  return (
    <View style={styles.container(safeAreaMode, hasHeader)}>{children}</View>
  );
}

const styles = StyleSheet.create((_, rt) => ({
  container: (mode: SafeAreaMode, hasHeader: boolean) => {
    if (mode === "none") {
      return {
        flex: 1,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
      };
    }

    return {
      flex: 1,
      paddingLeft: rt.insets.left + 10,
      paddingRight: rt.insets.right + 10,
      paddingTop: hasHeader ? 10 : rt.insets.top,
      paddingBottom: mode === "under-tabs" ? 0 : 10,
    };
  },
}));
