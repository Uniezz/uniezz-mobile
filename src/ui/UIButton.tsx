import { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";

type UIButtonProps = {
    children: ReactNode;
} & PressableProps;

export const UIButton = ({ children, ...props }: UIButtonProps) => {
    return (
        <Pressable>
            {children}
        </Pressable>
    );
};


