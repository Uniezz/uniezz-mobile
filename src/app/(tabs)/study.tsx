import { UIAvatar, UIButton, UIIconButton, UIRow, UISegmented } from "@/ui";
import { useState } from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const items: string[] = ["Direct", "Groups", "Requests"];

export default function StudyScreen() {
  const [selected, setSelected] = useState<number>(0);
  const handlePress = (index: number) => {
    setSelected(index);
  };
  const pressUIButton = () => console.log("hii");
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Study Screen</Text>
      <UIRow
        topText="UMCS"
        bottomText="Maria Curie-Skłodowska"
        leftItem={<UIAvatar placeholderText="UM" rounded="lg" />}
        isSelected={true}
      />
      <UISegmented
        selectedItemIndex={selected}
        items={items}
        onPress={handlePress}
      />
      <UIButton onPress={pressUIButton}>hi</UIButton>
      <UIIconButton>
        <Ionicons name="baseball" />
      </UIIconButton>
    </View>
  );
}
