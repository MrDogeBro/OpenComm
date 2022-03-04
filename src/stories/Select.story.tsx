import React from "react";
import { Story, Meta } from "@storybook/react";

import { Select, SelectProps, SelectItem } from "@ui/Select";

export default {
  title: "Select",
  component: Select,
} as Meta<typeof Select>;

const TheSelect: Story<SelectProps> = () => {
  const items: SelectItem[] = [
    { label: "test1", value: "test1" },
    { label: "test2", value: "test2" },
    { label: "test3", value: "test3" },
    { label: "test4", value: "test4" },
  ];

  return <Select label="Select" labelId="select-label" items={items}></Select>;
};

export const Main = TheSelect.bind({});
