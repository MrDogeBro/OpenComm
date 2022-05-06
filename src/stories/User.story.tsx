import React from "react";
import { Story, Meta } from "@storybook/react";

import { User, UserProps } from "@ui/User";

export default {
  title: "User",
  component: User,
} as Meta<typeof User>;

const TheUser: Story<UserProps> = () => {
  return <User name="Test User"></User>;
};

export const Main = TheUser.bind({});
