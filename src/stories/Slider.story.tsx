import React from "react";
import { Story, Meta } from "@storybook/react";

import { Slider, SliderProps } from "@ui/Slider";

export default {
  title: "Slider",
  component: Slider,
} as Meta<typeof Slider>;

const TheSlider: Story<SliderProps> = () => {
  return <Slider />;
};

export const Main = TheSlider.bind({});
