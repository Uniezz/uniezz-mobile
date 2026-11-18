import * as Haptics from "expo-haptics";
import { Pressable, type PressableProps } from "react-native";
import { useHapticsStore } from "@/store/hapticsStore";

export type PressHaptic = "light" | "selection";

export type UIPressableProps = PressableProps & {
  /** Default light impact. Pass `selection` or `false` to override. */
  haptic?: PressHaptic | false;
};

export const UIPressable = ({
  haptic = "light",
  disabled,
  onPress,
  ...props
}: UIPressableProps) => {
  const handlePress: PressableProps["onPress"] = (event) => {
    if (!disabled && haptic && onPress && useHapticsStore.getState().enabled) {
      void (haptic === "selection"
        ? Haptics.selectionAsync()
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    }
    onPress?.(event);
  };

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={onPress ? handlePress : undefined}
    />
  );
};
