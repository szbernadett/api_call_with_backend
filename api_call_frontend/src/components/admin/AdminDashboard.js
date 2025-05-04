import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper,
  Container
} from '@mui/material';
import UserManagement from './UserManagement';

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="User Management" />
            <Tab label="System Settings" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>
        
        {tabValue === 0 && <UserManagement />}
        {tabValue === 1 && <Typography>System Settings (Coming Soon)</Typography>}
        {tabValue === 2 && <Typography>Analytics (Coming Soon)</Typography>}
      </Paper>
    </Container>
  );
}