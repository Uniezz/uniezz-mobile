import { UIInput } from "@/ui";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function MeetScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Meet Screen</Text>
      <UIInput
        leftIcon={<Ionicons name="search" color={"grey"} size={16} />}
        captionText="hello"
        value="hi"
        errorText="error"
        editable={false}
      />
    </View>
  );
}
