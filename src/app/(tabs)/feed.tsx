import { UIText } from "@/ui";
import { View } from "react-native";

export default function FeedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <UIText>Feed Screen</UIText>
      <UIText color="brand">brand color</UIText>
      <UIText color="error">error color</UIText>
      <UIText color="success">success color</UIText>
      <UIText color="gray">gray color</UIText>
      <UIText weight="extrabold" size="lg">
        lg size
      </UIText>
      {/*style is overriding default prop, fine */}
      <UIText style={{ color: "pink" }} weight="bold" size="xl">
        Feed Screen
      </UIText>
    </View>
  );
}
