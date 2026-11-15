import type { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Icon, UIGlass, UIText } from "@/ui";

type IconName = ComponentProps<typeof Icon>["name"];

// expo-router passes its own vendored navigator types, so take the shape from `tabBar`
type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

// the shadow of the iOS 26 tab bar: one glyph per tab, whatever the platform set calls them
const TAB_ICONS: Record<string, IconName> = {
  feed: "newspaper",
  chat: "message-circle",
  meet: "sparkles",
  study: "library-big",
  faq: "info",
};

type GlassTabItemProps = {
  route: TabBarProps["state"]["routes"][number];
  isFocused: boolean;
  label: string | undefined;
} & Pick<TabBarProps, "navigation">;

const GlassTabItem = ({
  route,
  isFocused,
  label,
  navigation,
}: GlassTabItemProps) => {
  const handlePress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const handleLongPress = () => {
    navigation.emit({ type: "tabLongPress", target: route.key });
  };

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={[styles.item, isFocused && styles.selected]}
    >
      <Icon
        name={TAB_ICONS[route.name] ?? "newspaper"}
        size={20}
        uniProps={(theme) => ({
          color: isFocused ? theme.colors.white : theme.colors.white60,
        })}
      />
      <UIText
        size="xxs"
        weight={isFocused ? "semibold" : "medium"}
        color={isFocused ? "white" : "secondary"}
      >
        {label}
      </UIText>
    </Pressable>
  );
};

// iOS 26 look on Android: a floating glass pill instead of the system tab bar
export const GlassTabBar = ({
  state,
  descriptors,
  navigation,
}: TabBarProps) => (
  <View pointerEvents="box-none" style={styles.slot}>
    <UIGlass radius={26} style={styles.bar}>
      {state.routes.map((route, index) => (
        <GlassTabItem
          key={route.key}
          route={route}
          isFocused={state.index === index}
          label={descriptors[route.key]?.options.title}
          navigation={navigation}
        />
      ))}
    </UIGlass>
  </View>
);

const styles = StyleSheet.create((theme, rt) => ({
  // the bar floats over the screen, so the scene keeps the full height
  slot: {
    position: "absolute",
    left: theme.s(16),
    right: theme.s(16),
    bottom: rt.insets.bottom + theme.vs(8),
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.vs(6),
    gap: theme.s(4),
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.vs(2),
    paddingVertical: theme.vs(6),
    borderRadius: theme.vs(20),
  },
  selected: {
    backgroundColor: theme.colors.white10,
  },
}));
