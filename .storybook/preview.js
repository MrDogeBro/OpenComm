import "@styles/globals.scss";

import * as nextImage from "next/image";

import { muiTheme as baseMuiTheme } from "storybook-addon-material-ui5";
import { muiTheme } from "@styles/theme";

export const decorators = [baseMuiTheme(muiTheme)];

Object.defineProperty(nextImage, "default", {
  configurable: true,
  value: (props) => {
    return <img {...props} />;
  },
});

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  layout: "centered",
};
