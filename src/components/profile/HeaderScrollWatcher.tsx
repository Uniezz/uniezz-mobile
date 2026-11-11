import { useCurrentTabScrollY } from "react-native-collapsible-tab-view";
import { useAnimatedReaction } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { HEADER_COMPACT_OFFSET } from "@/utils";

type HeaderScrollWatcherProps = {
  onScrolledChange: (isScrolled: boolean) => void;
};

// reports when the focused tab scrolls past the compact offset; render it inside Tabs.Container
export function HeaderScrollWatcher({
  onScrolledChange,
}: HeaderScrollWatcherProps) {
  const scrollY = useCurrentTabScrollY();
  // a boolean, so a scroll only re-renders when it flips
  useAnimatedReaction(
    () => scrollY.value > HEADER_COMPACT_OFFSET,
    (isScrolled, wasScrolled) => {
      if (isScrolled !== wasScrolled)
        scheduleOnRN(onScrolledChange, isScrolled);
    },
  );
  return null;
}
