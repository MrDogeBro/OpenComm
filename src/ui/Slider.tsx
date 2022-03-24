import React from "react";

import Box from "@mui/material/Box";
import MuiSlider from "@mui/material/Slider";
import MuiInput from "@mui/material/Input";
import { ThemeProvider } from "@mui/material/styles";

import { muiTheme } from "@styles/theme";

export type SliderProps = {
  className?: string;
  id?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  defaultValue?: number;
  label: string;
};

export const Slider: React.FC<SliderProps> = ({
  className = "",
  id = "",
  minValue = 0,
  maxValue = 100,
  step = 10,
  defaultValue = 10,
  label,
}) => {
  const [value, setValue] =
    React.useState<number | string | Array<number | string>>(defaultValue);

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setValue(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value === "" ? "" : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < minValue) {
      setValue(minValue);
    } else if (value > maxValue) {
      setValue(maxValue);
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Box sx={{ minWidrth: 250 }} className={className} id={id}>
        <span className="text-gray-300 font-roboto font-normal text-sm">
          {label}
        </span>
        <div className="grid grid-cols-4 gap-4">
          <MuiSlider
            className="col-span-3"
            value={typeof value === "number" ? value : 0}
            min={minValue}
            max={maxValue}
            defaultValue={defaultValue}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
          />
          <MuiInput
            value={value}
            className="w-14"
            size="small"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: step,
              min: minValue,
              max: maxValue,
              type: "number",
              "aria-labelledby": "input-slider",
            }}
          />
        </div>
      </Box>
    </ThemeProvider>
  );
};
