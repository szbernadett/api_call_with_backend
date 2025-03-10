import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Footer() {
  return (
    <AppBar
      component="footer"
      position="static"
      sx={{
        width: "100%",
        background: "linear-gradient(to top, #49708D, #2F536A)", // Reverse gradient direction
        opacity: 0.95, // Slight transparency
        padding: 2, // Add padding for spacing
        marginTop: "auto", // Ensure footer sticks to the bottom if needed
      }}
    >
      <Toolbar
        sx={{
          flexDirection: "column", // Stack items vertically
          alignItems: "center", // Center items horizontally
          width: "100%",
        }}
      >
        {/* Footer Text */}
        <Typography
          variant="body1"
          sx={{
            color: "white", // Ensure contrast with the background
          }}
        >
          &copy; {new Date().getFullYear()} City Explorer. All rights reserved.
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
