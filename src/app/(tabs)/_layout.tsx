import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="feed">
        <NativeTabs.Trigger.Icon
          sf={{ default: "newspaper", selected: "newspaper.fill" }}
          md="newspaper"
        />
        <NativeTabs.Trigger.Label>Feed</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chat">
        <NativeTabs.Trigger.Icon
          sf={{ default: "message", selected: "message.fill" }}
          md={{ default: "chat_bubble_outline", selected: "chat_bubble" }}
        />
        <NativeTabs.Trigger.Label>Chat</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="meet">
        <NativeTabs.Trigger.Icon sf="sparkles" md="auto_awesome" />
        <NativeTabs.Trigger.Label>Meet</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="study">
        <NativeTabs.Trigger.Icon
          sf={{ default: "books.vertical", selected: "books.vertical.fill" }}
          md="local_library"
        />
        <NativeTabs.Trigger.Label>Study</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="guide">
        <NativeTabs.Trigger.Icon
          sf={{ default: "mappin", selected: "mappin.circle.fill" }}
          md="location_on"
        />
        <NativeTabs.Trigger.Label>Guide</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
