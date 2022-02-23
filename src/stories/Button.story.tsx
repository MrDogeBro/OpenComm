import React from "react";
import { Story, Meta } from "@storybook/react";

import { Button, ButtonProps } from "@ui/Button";

import { toEnum } from "./utils/toEnum";

export default {
  title: "Button",
  component: Button,
} as Meta<typeof Button>;

const TheButton: Story<ButtonProps> = ({ children, ...props }) => {
  return <Button {...props}>{children || "Button"}</Button>;
};

export const Main = TheButton.bind({});

Main.args = {
  color: "primary",
  disabled: false,
  loading: false,
};

Main.argTypes = {
  color: toEnum(["primary", "secondary"]),
};
