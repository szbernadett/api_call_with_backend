import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import SearchBar from "./SearchBar"; // Adjust the path as necessary
import { Link } from 'react-router-dom';

export default function Header({ handleSearch, isAuthenticated, user, onLogout }) {
  return (
    <AppBar
      position="static"
      sx={{
        width: "100vw",
        background: "linear-gradient(to bottom, #2F536A, #49708D)",
        opacity: 0.95, // Slight transparency
        padding: 2, // Add some padding for spacing
        //zIndex: 1201, // Ensure the header stays on top
      }}
    >
      <Toolbar
        sx={{
          flexDirection: "column", // Stack items vertically
          alignItems: "center", // Center items horizontally
          width: "100%",
        }}
      >
        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            color: "white", // Ensure contrast with the background
            marginBottom: 2, // Add space below the title
          }}
        >
          City Explorer
        </Typography>

        {/* Search Bar */}
        <Box sx={{ width: "100%", maxWidth: "1000px" }}>
          <SearchBar handleSearch={handleSearch} />
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', mt: 2 }}>
          {isAuthenticated ? (
            <>
              {user?.isAdmin && (
                <Button 
                  component={Link} 
                  to="/admin" 
                  color="inherit"
                  sx={{ mr: 2 }}
                >
                  Admin Dashboard
                </Button>
              )}
              <Button 
                color="inherit"
                onClick={onLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                component={Link} 
                to="/login" 
                color="inherit"
                sx={{ mr: 2 }}
              >
                Login
              </Button>
              <Button 
                component={Link} 
                to="/signup" 
                color="inherit"
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
