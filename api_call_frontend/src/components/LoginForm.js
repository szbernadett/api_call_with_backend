import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  Link
} from '@mui/material';
import { login } from '../services/authService';

function LoginForm({ onSuccess, onCancel, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login(email, password);
      onSuccess(response.user);
    } catch (err) {
      setError(err.message || 'Login failed');
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
        Login
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
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
                Logging in
              </>
            ) : (
              'Login'
            )}
          </Button>
        </Box>
        
        {onSwitchToSignup && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link 
                component="button" 
                variant="body2" 
                onClick={onSwitchToSignup}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default LoginForm;


