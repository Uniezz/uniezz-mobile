import { UIAvatar } from "@/ui";
import { View } from "react-native";

export default function ChatScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <UIAvatar
        color="indigo"
        imageSrc="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkeR-gsFcnQGEFryfQdVAPA7uVWXq9W11wOoiiyEh_mg&s=10"
        placeholderText="hi"
      />
      <UIAvatar size="xl" color="ember" placeholderText="HI" />
      <UIAvatar size="sm" color="indigo" placeholderText="hi" />
      <UIAvatar
        size="sm"
        color="indigo"
        imageSrc="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkeR-gsFcnQGEFryfQdVAPA7uVWXq9W11wOoiiyEh_mg&s=10"
        placeholderText="hi"
      />
    </View>
  );
}
