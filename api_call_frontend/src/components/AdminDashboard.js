import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  
  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Header user={user} onLogout={onLogout} />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: 2,
          margin: "20px auto",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 2,
          maxWidth: "800px",
          width: "100%",
        }}
      >
        <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
          Admin Dashboard
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          This is the admin dashboard. Content will be added soon.
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={handleBackToHome}
          sx={{ mt: 2, alignSelf: "center" }}
        >
          Back to Home
        </Button>
      </Box>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
}