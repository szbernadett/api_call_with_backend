import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/adminService';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    isAdmin: false
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load users: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      isAdmin: false
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      isAdmin: user.isAdmin || false
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'isAdmin' ? checked : value
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        await createUser(formData);
      } else {
        await updateUser(selectedUser._id, formData);
      }
      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      setError(`Failed to ${dialogMode === 'add' ? 'create' : 'update'} user: ${err.message || 'Unknown error'}`);
    }
  };

  const handleOpenDeleteConfirm = (user) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(userToDelete._id);
      fetchUsers();
      handleCloseDeleteConfirm();
    } catch (err) {
      setError('Failed to delete user: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading && users.length === 0) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">User Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add User
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenEditDialog(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDeleteConfirm(user)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'add' ? 'Add New User' : 'Edit User'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            value={formData.username}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="password"
            label={dialogMode === 'add' ? 'Password' : 'New Password (leave blank to keep current)'}
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isAdmin}
                onChange={handleInputChange}
                name="isAdmin"
              />
            }
            label="Administrator"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'add' ? 'Add User' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{userToDelete?.username}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
