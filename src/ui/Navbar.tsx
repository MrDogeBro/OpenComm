import Link from "next/link";
import React, { useState } from "react";

import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { Menu } from "@mui/icons-material";

export interface NavbarProps {
  className?: string;
}

interface PageData {
  name: string;
  location: string;
}

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

const styles = makeStyles((_: any) => ({
  drawerPaper: {
    backgroundColor: "#0c0c0c",
  },
}));

export const Navbar: React.FC<NavbarProps> = ({ className = "" }) => {
  const [drawerState, setDrawer] = useState(false);

  const links: PageData[] = [
    {
      name: "User",
      location: "/user",
    },
    {
      name: "Base",
      location: "/base",
    },
  ];

  return (
    <nav
      className={`h-14 bg-primary-bg flex justify-center items-center sticky w-full px-10 xs:px-20 ${className}`}
    >
      <Link href="/">
        <span className="text-2xl font-sans text-primary-fg cursor-pointer">
          OpenComm
        </span>
      </Link>

      <div className="flex-grow" />

      <div className="hidden md:flex justify-end items-center">
        {links.map((link: PageData, i: number) => (
          <div key={i}>
            <Link href={link.location}>
              <span className="font-sans text-xl text-white cursor-pointer ml-10">
                {link.name}
              </span>
            </Link>
          </div>
        ))}
      </div>

      <div className="block md:hidden">
        <ThemeProvider theme={theme}>
          <IconButton
            aria-label="Open navigation"
            className="relative left-3"
            onClick={() => {
              setDrawer(!drawerState);
            }}
          >
            <Menu className="text-white" />
          </IconButton>

          <Drawer
            anchor="right"
            open={drawerState}
            onClose={() => {
              setDrawer(false);
            }}
            classes={{
              paper: styles().drawerPaper,
            }}
          >
            <div className="w-40 mt-8">
              {links.map((link: PageData, i: number) => (
                <div key={i} className="mr-10 flex justify-end items-center">
                  <Link href={link.location}>
                    <span className="font-sans text-xl text-white cursor-pointer inline-block mb-2">
                      {link.name}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </Drawer>
        </ThemeProvider>
      </div>
    </nav>
  );
};
