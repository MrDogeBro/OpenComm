import React from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { CardActionArea } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import { muiTheme } from "@styles/theme";

export type UserProps = {
  name: string;
  className: string;
  image?: string;
  imageAlt?: string;
};

export const User: React.FC<UserProps> = ({
  name,
  className = "",
  image = "/assets/defaults/default-user-image.webp",
  imageAlt = "Default user image",
}) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <Card className={className}>
        <CardActionArea>
          <div className="flex">
            <CardMedia
              component="img"
              className="w-20"
              image={image}
              alt={imageAlt}
            />
            <CardContent
              className="p-0 m-0 ml-10 mr-5 flex justify-left items-center"
              sx={{ minWidth: "8rem" }}
            >
              <span className="text-lg">{name}</span>
            </CardContent>
          </div>
        </CardActionArea>
      </Card>
    </ThemeProvider>
  );
};
