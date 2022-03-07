import React from "react";

import MaterialSelect, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import { ThemeProvider } from "@mui/material/styles";

import { muiTheme } from "@styles/theme";

export type SelectItem = {
  label: string;
  value: string;
};

export type SelectProps = {
  className?: string;
  label: string;
  id?: string;
  labelId: string;
  value?: string;
  onChange: { (event: SelectChangeEvent): void };
  items: SelectItem[];
};

export const Select: React.FC<SelectProps> = ({
  className = "",
  label,
  id = "",
  labelId,
  value = "",
  items,
  onChange,
}) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <Box sx={{ minWidth: 120 }} className={className}>
        <FormControl fullWidth>
          <InputLabel id={labelId}>{label}</InputLabel>
          <MaterialSelect
            labelId={labelId}
            id={id}
            label={label}
            onChange={onChange}
            value={value}
          >
            {items.map((item, index) => {
              return (
                <MenuItem value={item.value} key={index}>
                  {item.label}
                </MenuItem>
              );
            })}
          </MaterialSelect>
        </FormControl>
      </Box>
    </ThemeProvider>
  );
};
