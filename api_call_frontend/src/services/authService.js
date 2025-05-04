import { API_URL } from '../config';

// Check if user is authenticated
export const checkAuthStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include', // Important for cookies
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
};

// Login user
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  return response.json();
};

// Register new user
export const signup = async (username, email, password) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({ username, email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }
  
  return response.json();
};

// Logout user
export const logout = async () => {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include', // Important for cookies
  });
};
