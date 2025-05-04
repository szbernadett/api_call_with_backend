import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert
} from '@mui/material';
import { signup } from '../services/authService';

function SignupForm({ onSuccess, onCancel }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form inputs
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Attempting signup with:', { username, email });
      const response = await signup(username, email, password);
      console.log('Signup successful:', response);
      onSuccess(response.user);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        maxWidth: 500, 
        mx: 'auto', 
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}
    >
      <Typography variant="h4" component="h2" gutterBottom>
        Create Account
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{ px: 3 }}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ px: 3 }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Creating Account
              </>
            ) : (
              'Sign Up'
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default SignupForm;

