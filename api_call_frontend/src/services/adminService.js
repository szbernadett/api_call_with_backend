import { API_URL } from '../config';

// Helper function to handle API requests
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'API request failed');
  }
  
  return response.json();
};

// Get all users
export const getUsers = () => {
  return apiRequest('/api/admin/users');
};

// Get user by ID
export const getUserById = (userId) => {
  return apiRequest(`/api/admin/users/${userId}`);
};

// Create new user
export const createUser = (userData) => {
  return apiRequest('/api/admin/users', 'POST', userData);
};

// Update user
export const updateUser = (userId, userData) => {
  return apiRequest(`/api/admin/users/${userId}`, 'PUT', userData);
};

// Delete user
export const deleteUser = (userId) => {
  return apiRequest(`/api/admin/users/${userId}`, 'DELETE');
};