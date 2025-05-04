import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

export default function Login({ onLogin, switchToSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch("https://api-call-with-backend.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }
      
      onLogin(data.user);
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Login
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          sx={{ mt: 3, mb: 2 }}
        >
          Login
        </Button>
        <Button
          variant="text"
          fullWidth
          onClick={switchToSignup}
        >
          Don't have an account? Sign up
        </Button>
      </Box>
    </Paper>
  );
}