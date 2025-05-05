import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function Header({ handleSearch, user, onLogout }) {
  const navigate = useNavigate();
  
  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <AppBar
      position="static"
      sx={{
        width: "100vw",
        background: "linear-gradient(to bottom, #2F536A, #49708D)",
        opacity: 0.95,
        padding: 2,
      }}
    >
      <Toolbar
        sx={{
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* User info and auth button */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          width: "100%", 
          mb: 2 
        }}>
          {user ? (
            <>
              <Typography sx={{ mr: 2, color: "white" }}>
                Welcome, {user.username}
              </Typography>
              
                <Button 
                  variant="outlined" 
                  color="inherit"
                  onClick={handleAdminClick}
                  size="small"
                  sx={{ mr: 2 }}
                >
                  Admin Dashboard
                </Button>
              
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={onLogout}
                size="small"
              >
                Logout
              </Button>
            </>
          ) : null}
        </Box>

        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            color: "white",
            marginBottom: 2,
          }}
        >
          City Explorer
        </Typography>

        {/* Search Bar - only show if user is logged in */}
        {user && (
          <Box sx={{ width: "100%", maxWidth: "1000px" }}>
            <SearchBar handleSearch={handleSearch} isAuthenticated={!!user} />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
