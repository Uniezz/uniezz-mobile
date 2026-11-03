import { UIInput } from "./UIInput";
import { Icon } from "./icons";
import type { ComponentProps } from "react";

export function UISearch(props: ComponentProps<typeof UIInput>) {
  return (
    <UIInput
      {...props}
      accessibilityRole="search"
      leftIcon={<Icon name="search" size={16} />}
    />
  );
}
