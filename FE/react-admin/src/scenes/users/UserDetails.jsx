import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, TextField, Card, CardContent, Avatar, Grid, Select, MenuItem } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../theme';
import { fetchRoleByUserId, fetchUserDetail, updateUserDetail, updateUserRole } from '../../api/userApi';
import Header from '../../components/Header';
import './style.css';
import { storageDb } from '../../firebase';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { v4 } from 'uuid';

const UserDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const [image, setImage] = useState(null);
  const [imageRef, setImageRef] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const getUserDetail = async () => {
      try {
        const data = await fetchUserDetail(id);
        setUser(data);
        const userRole = await fetchRoleByUserId(id);
        setRole(userRole);
        console.log('Role:', userRole);
      } catch (err) {
        setError(`Failed to fetch user details: ${err.message}`);
      }
    };
    getUserDetail();
  }, [id]);

  const handleFieldChange = (field, value) => {
    if (field === 'role') {
      setRole(value);
    }
    setUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      if (file.size > 5 * 1024 * 1024) { // Limit 5MB
        console.error('File size exceeds 5MB');
        return;
      }
      setImage(file);
      setImageRef(ref(storageDb, `UserImage/${v4()}`));
      const previewImage1 = URL.createObjectURL(file);
      setPreviewImage(previewImage1);
      console.log(previewImage1);
    } else {
      console.error('File is not a PNG, JPEG, or JPG image');
    }
  };

  const handleSave = async () => {
    try {
      if (!role && user.role) {
        setRole(user.role);
      }

      if (image && imageRef) {
        if (user.profilePicture) {
          const oldPath = user.profilePicture.split('court-callers.appspot.com/o/')[1].split('?')[0];
          const imagebefore = ref(storageDb, decodeURIComponent(oldPath));
          await deleteObject(imagebefore);
        }
        const snapshot = await uploadBytes(imageRef, image);
        console.log('Uploaded a file!', snapshot);

        const url = await getDownloadURL(imageRef);
        setUser((prevUser) => ({
          ...prevUser,
          profilePicture: url,
        }));

        await updateUserDetail(id, { ...user, profilePicture: url, role });
      } else {
        await updateUserDetail(id, { ...user, role });
      }
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);

      await updateUserRole(id, role);

      setEditMode(false);
    } catch (err) {
      setError(`Failed to update user details: ${err.message}`);
    }
  };

  const handleEditToggle = () => {
    if (!editMode) {
      setRole(role || user.role);
    }
    setEditMode((prevState) => !prevState);
  };

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  console.log('User:', previewImage || user.profilePicture);

  return (
    <Box m="20px">
      <Header title="USER DETAILS" subtitle={`Details for User ID: ${id}`} />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Button
                variant="contained"
                onClick={handleBack}
                style={{
                  backgroundColor: colors.blueAccent[500],
                  color: colors.primary[900],
                }}
              >
                Back
              </Button>
              <Box>
                <Button
                  variant="contained"
                  onClick={handleEditToggle}
                  style={{
                    backgroundColor: colors.greenAccent[400],
                    color: colors.primary[900],
                    marginRight: 8
                  }}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
                {editMode && (
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    style={{
                      backgroundColor: colors.greenAccent[400],
                      color: colors.primary[900],
                    }}
                  >
                    Save
                  </Button>
                )}
              </Box>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4} display="flex" justifyContent="center" alignItems="center">
                <Avatar src={previewImage || user.profilePicture} alt="Profile Picture" sx={{ width: 150, height: 150 }} />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Box mb={2}>
                  <Typography variant="h6">Full Name</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={user.fullName || ''}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      size="small"
                    />
                  ) : (
                    <Typography>{user.fullName || 'N/A'}</Typography>
                  )}
                </Box>
                <Box mb={2}>
                  <Typography variant="h6">Year of Birth</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      type="number"
                      value={user.yearOfBirth || ''}
                      onChange={(e) => handleFieldChange('yearOfBirth', e.target.value)}
                      size="small"
                      sx={{
                        '& input[type=number]': {
                          MozAppearance: 'textfield',
                          '&::-webkit-outer-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                          },
                          '&::-webkit-inner-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                          },
                        },
                      }}
                    />
                  ) : (
                    <Typography>{user.yearOfBirth || 'N/A'}</Typography>
                  )}
                </Box>
                <Box mb={2}>
                  <Typography variant="h6">Address</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={user.address || ''}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      size="small"
                    />
                  ) : (
                    <Typography>{user.address || 'N/A'}</Typography>
                  )}
                </Box>
                {editMode && (
                  <Box mb={2}>
                    <Typography variant="h6">Profile Picture</Typography>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                    />
                  </Box>
                )}
                <Box mb={2}>
                  <Typography variant="h6">Balance</Typography>
                  <Typography>{user.balance || 'N/A'}</Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="h6">Point</Typography>
                  <Typography>{user.point || 'N/A'}</Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="h6">Role</Typography>
                  {editMode ? (
                    <Select
                      fullWidth
                      value={role || ''}
                      onChange={(e) => handleFieldChange('role', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="Customer">Customer</MenuItem>
                      <MenuItem value="Staff">Staff</MenuItem>
                      <MenuItem value="Admin">Admin</MenuItem>
                    </Select>
                  ) : (
                    <Typography>{role || 'N/A'}</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default UserDetails;
