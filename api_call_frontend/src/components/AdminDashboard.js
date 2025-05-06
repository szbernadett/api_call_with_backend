import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ username: "", email: "" });
  const [newUserData, setNewUserData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://api-call-with-backend.onrender.com/admin/users", {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({ username: user.username, email: user.email });
    setEditDialogOpen(true);
  };

  const handleAddUserClick = () => {
    setNewUserData({ username: "", email: "", password: "", confirmPassword: "" });
    setAddUserDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`https://api-call-with-backend.onrender.com/admin/users/${selectedUser._id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }
      
      // Remove user from state
      setUsers(users.filter(u => u._id !== selectedUser._id));
      setSnackbar({ open: true, message: "User deleted successfully", severity: "success" });
    } catch (err) {
      console.error("Error deleting user:", err);
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`https://api-call-with-backend.onrender.com/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editFormData),
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }
      
      const updatedUser = await response.json();
      
      // Update user in state
      setUsers(users.map(u => u._id === selectedUser._id ? updatedUser : u));
      setSnackbar({ open: true, message: "User updated successfully", severity: "success" });
    } catch (err) {
      console.error("Error updating user:", err);
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setEditDialogOpen(false);
    }
  };

  const handleAddUserSubmit = async () => {
    // Validate passwords match
    if (newUserData.password !== newUserData.confirmPassword) {
      setSnackbar({ open: true, message: "Passwords don't match", severity: "error" });
      return;
    }

    try {
      const response = await fetch("https://api-call-with-backend.onrender.com/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: newUserData.username,
          email: newUserData.email,
          password: newUserData.password
        }),
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }
      
      const newUser = await response.json();
      
      // Add new user to state
      setUsers([...users, newUser]);
      setSnackbar({ open: true, message: "User created successfully", severity: "success" });
      setAddUserDialogOpen(false);
    } catch (err) {
      console.error("Error creating user:", err);
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const isAdmin = (username) => {
    return username.toLowerCase() === "admin";
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
          p: { xs: 1, sm: 2 },
          margin: "20px auto",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 2,
          maxWidth: { xs: "95%", sm: "90%", md: "80%" },
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ textAlign: { xs: "center", sm: "left" } }}>
            Admin Dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleAddUserClick}
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            Add User
          </Button>
        </Box>
        
        {/* Mobile Add User Button */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleAddUserClick}
          sx={{ display: { xs: "flex", sm: "none" }, mb: 2, alignSelf: "center" }}
        >
          Add User
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="users table">
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell component="th" scope="row">
                        {user.username}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell align="right">
                        {!isAdmin(user.username) && (
                          <>
                            <IconButton 
                              aria-label="edit" 
                              onClick={() => handleEditClick(user)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              aria-label="delete" 
                              onClick={() => handleDeleteClick(user)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
        
        <Button 
          variant="contained" 
          onClick={handleBackToHome}
          sx={{ mt: 4, alignSelf: "center" }}
        >
          Back to Home
        </Button>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        disableEnforceFocus
        container={() => document.getElementById('root')}
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete user "{selectedUser?.username}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        aria-labelledby="edit-dialog-title"
        disableEnforceFocus
        container={() => document.getElementById('root')}
      >
        <DialogTitle id="edit-dialog-title">
          Edit User
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="username"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.username}
            onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={editFormData.email}
            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add User Dialog */}
      <Dialog
        open={addUserDialogOpen}
        onClose={() => setAddUserDialogOpen(false)}
        aria-labelledby="add-user-dialog-title"
        disableEnforceFocus
        container={() => document.getElementById('root')}
      >
        <DialogTitle id="add-user-dialog-title">
          Add New User
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="new-username"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={newUserData.username}
            onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="new-email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newUserData.email}
            onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="new-password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newUserData.password}
            onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="new-confirm-password"
            label="Confirm Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newUserData.confirmPassword}
            onChange={(e) => setNewUserData({...newUserData, confirmPassword: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddUserSubmit} color="primary">
            Create User
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
}



