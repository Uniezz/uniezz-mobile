import { ReactNode } from "react";
import { Pressable, PressableProps, Text } from "react-native";

type UIButtonProps = {
    children: ReactNode;
} & PressableProps;

export const UIButton = ({ children, ...props }: UIButtonProps) => {
    return (
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: "#007AFF",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1
            },
          ]}
          {...props}
        >
          <Text style={{ color: "white", fontWeight: "600"}}>
            {children}
          </Text>
        </Pressable>
    );
};
