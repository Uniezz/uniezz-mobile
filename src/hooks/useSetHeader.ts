import { useNavigation } from "expo-router";
import { ReactNode, useLayoutEffect } from "react";

type HeaderConfig = {
  title?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
};

export function useSetHeader({ title, leftAction, rightAction }: HeaderConfig) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    const hasHeader = !!(title || rightAction || leftAction);

    if (!hasHeader) {
      return;
    }

    navigation.setOptions({
      headerShown: true,
      title,
      headerTitleAlign: "center",
      headerLeft: leftAction ? () => leftAction : undefined,
      headerRight: rightAction ? () => rightAction : undefined,
    });
  }, [navigation, title, leftAction, rightAction]);
}
