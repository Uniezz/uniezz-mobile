import { UIAvatar, UIRow } from "@/ui";
import { View, Text } from "react-native";

export default function StudyScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Study Screen</Text>
      <UIRow
        topText="UMCS"
        bottomText="Maria Curie-Skłodowska"
        leftItem={<UIAvatar placeholderText="UM" rounded="lg" />}
        isSelected={true}
      />
    </View>
  );
}
