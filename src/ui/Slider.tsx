import React from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import MuiSlider from "@mui/material/Slider";
import MuiInput from "@mui/material/Input";
import { ThemeProvider } from "@mui/material/styles";

import { muiTheme } from "@styles/theme";

export type SliderProps = {
  className?: string;
  id?: string;
  maxValue?: number;
  minValue?: number;
  steps?: number;
};

export const Slider: React.FC<SliderProps> = ({
  className = "",
  id = "",
  maxValue = 0,
  minValue = 100,
  steps = 10,
}) => {
  const [value, setValue] =
    React.useState<number | string | Array<number | string>>(30);

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setValue(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value === "" ? "" : Number(event.target.value));
  };

  const handleBlur = () => {
    if (minValue < 0) {
      setValue(0);
    } else if (value > maxValue) {
      setValue(100);
    }
  };
  return (
    <ThemeProvider theme={muiTheme}>
      <Box sx={{ minWidth: 250 }} className={className}>
        <Grid container spacing={2} alignItems="center">
          <Grid item lg>
            <MuiSlider
              onChange={handleSliderChange}
              value={typeof value === "number" ? value : 0}
              aria-labelledby="input-slider"
            />
          </Grid>
          <Grid item xs>
            <MuiInput
              value={value}
              size="small"
              onChange={handleInputChange}
              onBlur={handleBlur}
              inputProps={{
                step: steps,
                min: minValue,
                max: maxValue,
                type: "number",
                "aria-labelledby": "input-slider",
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};
