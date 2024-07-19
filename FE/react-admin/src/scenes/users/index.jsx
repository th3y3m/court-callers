import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Button, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select,
  MenuItem, IconButton, InputBase, Modal, TextField
} from '@mui/material';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import {
  fetchTeamData, updateUserBanStatus, fetchRoleByUserId
} from '../../api/userApi';
import { registerStaffApi } from '../../api/registerApi';
import Header from '../../components/Header';
import SearchIcon from "@mui/icons-material/Search";
import { GrView } from "react-icons/gr";
import './style.css';
import {
  validateFullName,
  validateEmail,
  validatePassword,
  validateConfirmPassword
} from '../formValidation';

const useQuery = () => new URLSearchParams(useLocation().search);

const Users = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const query = useQuery();
  const navigate = useNavigate();

  const userRole = useMemo(() => localStorage.getItem("userRole"), []);

  const [teamData, setTeamData] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [usernameValidation, setUsernameValidation] = useState({ isValid: true, message: '' });
  const [emailValidation, setEmailValidation] = useState({ isValid: true, message: '' });
  const [passwordValidation, setPasswordValidation] = useState({ isValid: true, message: '' });
  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState({ isValid: true, message: '' });
  const [page, setPage] = useState(parseInt(query.get('pageNumber')) - 1 || 0);
  const [pageSize, setPageSize] = useState(parseInt(query.get('pageSize')) || 10);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(query.get('search') || "");

  const getTeamData = useCallback(async (page, pageSize, searchQuery = "") => {
    try {
      const data = await fetchTeamData(page + 1, pageSize, searchQuery.trim());
      if (data.items && Array.isArray(data.items)) {
        const itemsWithRoles = await Promise.all(data.items.map(async (item, index) => {
          const role = await fetchRoleByUserId(item.id);
          return {
            ...item,
            rowNumber: index + 1 + page * pageSize,
            banned: item.lockoutEnabled === false,
            role
          };
        }));
        setTeamData(itemsWithRoles);
        setRowCount(data.totalCount);
      } else {
        throw new Error('Invalid data structure');
      }
    } catch (err) {
      setError(`Failed to fetch team data: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    getTeamData(page, pageSize, searchQuery);
  }, [page, pageSize, searchQuery, getTeamData]);

  useEffect(() => {
    const validateEmailAsync = async () => {
      if (newUser.email) {
        const emailValidationResult = await validateEmail(newUser.email);
        setEmailValidation(emailValidationResult);
      }
    };

    validateEmailAsync();
  }, [newUser.email]);

  const handlePageClick = useCallback((event) => {
    const newPage = event.selected;
    setPage(newPage);
    navigate(`/${userRole === 'Admin' ? 'admin/Users' : 'Users'}?pageNumber=${newPage + 1}&pageSize=${pageSize}`);
  }, [navigate, pageSize, userRole]);

  const handlePageSizeChange = useCallback((event) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0);
    navigate(`/${userRole === 'Admin' ? 'admin/Users' : 'Users'}?pageNumber=1&pageSize=${newSize}`);
  }, [navigate, userRole]);

  const handleSearchSubmit = useCallback(() => {
    setPage(0);
    navigate(`/${userRole === 'Admin' ? 'admin/Users' : 'Users'}?pageNumber=1&pageSize=${pageSize}&search=${searchQuery.trim()}`);
    getTeamData(0, pageSize, searchQuery);
  }, [getTeamData, navigate, pageSize, searchQuery, userRole]);

  const handleBanToggle = useCallback(async (id, currentStatus) => {
    try {
      const updatedStatus = !currentStatus;
      await updateUserBanStatus(id, updatedStatus);
      setTeamData((prevData) => prevData.map((user) => (user.id === id ? { ...user, banned: updatedStatus } : user)));
    } catch (error) {
      console.error('Failed to update user ban status:', error);
    }
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleCreateNew = useCallback(() => {
    setOpenCreateModal(true);
  }, []);

  const handleViewUser = useCallback((id) => {
    navigate(`/${userRole === 'Admin' ? 'admin/Users' : 'Users'}/${id}`);
  }, [navigate, userRole]);

  const handleCreateUserChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({ ...prevState, [name]: value }));
  
    if (name === 'fullName') {
      setUsernameValidation(validateFullName(value));
    } else if (name === 'password') {
      setPasswordValidation(validatePassword(value));
    } else if (name === 'confirmPassword') {
      setConfirmPasswordValidation(validateConfirmPassword(newUser.password, value));
    }
  }, [newUser.password]);
  

  const handleCreateUserSubmit = useCallback(async (e) => {
    e.preventDefault();

    const fullNameValidation = validateFullName(newUser.fullName);
    const emailValidation = await validateEmail(newUser.email);
    const passwordValidation = validatePassword(newUser.password);
    const confirmPasswordValidation = validateConfirmPassword(newUser.password, newUser.confirmPassword);

    setUsernameValidation(fullNameValidation);
    setEmailValidation(emailValidation);
    setPasswordValidation(passwordValidation);
    setConfirmPasswordValidation(confirmPasswordValidation);

    if (!fullNameValidation.isValid || !emailValidation.isValid || !passwordValidation.isValid || !confirmPasswordValidation.isValid) {
      return;
    }

    try {
      await registerStaffApi(newUser.fullName, newUser.email, newUser.password, newUser.confirmPassword);
      setOpenCreateModal(false);
      getTeamData(page, pageSize, searchQuery);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  }, [newUser, getTeamData, page, pageSize, searchQuery]);

  const handleCreateModalClose = useCallback(() => {
    setOpenCreateModal(false);
  }, []);

  return (
    <Box m="20px">
      <Header title="USER" subtitle="Managing Users" />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search by User Email"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit() }}
              />
              <IconButton type="button" sx={{ p: 1 }} onClick={handleSearchSubmit}>
                <SearchIcon />
              </IconButton>
            </Box>
            {userRole === 'Admin' && (
              <Button
                variant="contained"
                onClick={handleCreateNew}
                style={{
                  backgroundColor: colors.greenAccent[400],
                  color: colors.primary[900],
                  marginLeft: 8
                }}
              >
                Create New Staff
              </Button>
            )}
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  {['ID', 'User Name', 'Email', 'Phone Number', 'Phone Confirmed', '2FA Enabled', 'Role']
                    .concat(userRole === 'Admin' ? ['Action', 'Access'] : [])
                    .map(header => (
                      <TableCell key={header} style={{ color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000' }}>
                        {header}
                      </TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {teamData.length > 0 ? (
                  teamData.map((row) => (
                    <TableRow key={row.id} style={row.banned ? { backgroundColor: colors.redAccent[100] } : null}>
                      <TableCell style={{ color: row.banned ? colors.redAccent[600] : theme.palette.text.primary }}>{row.rowNumber}</TableCell>
                      <TableCell style={{ color: row.banned ? colors.redAccent[600] : theme.palette.text.primary }}>{row.userName}</TableCell>
                      <TableCell style={{ color: row.banned ? colors.redAccent[600] : theme.palette.text.primary }}>{row.email}</TableCell>
                      <TableCell style={{ color: row.banned ? colors.redAccent[600] : theme.palette.text.primary }}>{row.phoneNumber || 'N/A'}</TableCell>
                      <TableCell style={{ color: row.banned ? colors.redAccent[600] : theme.palette.text.primary }}>{row.phoneNumberConfirmed ? 'Yes' : 'No'}</TableCell>
                      <TableCell style={{ color: row.banned ? colors.redAccent[600] : theme.palette.text.primary }}>{row.twoFactorEnabled ? 'Yes' : 'No'}</TableCell>
                      <TableCell style={{ color: row.banned ? colors.redAccent[600] : theme.palette.text.primary }}>{row.role}</TableCell>
                      {userRole === 'Admin' && (
                        <>
                          <TableCell>
                            <IconButton onClick={() => handleViewUser(row.id)} style={{ color: colors.greenAccent[400] }}>
                              <GrView />
                            </IconButton>
                          </TableCell>
                          <TableCell align="left">
                            <Button
                              onClick={() => handleBanToggle(row.id, row.banned)}
                              variant="contained"
                              size="small"
                              style={{
                                marginLeft: 8,
                                backgroundColor: row.banned ? colors.redAccent[400] : colors.greenAccent[400],
                                color: colors.primary[900]
                              }}
                            >
                              {row.banned ? 'Unban' : 'Ban'}
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={userRole === 'Admin' ? 9 : 7} align="center" style={{ color: theme.palette.text.primary }}>
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt="20px">
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              {[10, 15, 20].map(size => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
            <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={Math.ceil(rowCount / pageSize)}
              previousLabel="< previous"
              renderOnZeroPageCount={null}
              containerClassName={"pagination"}
              activeClassName={"active"}
            />
          </Box>
        </Box>
      )}
      <Modal open={openCreateModal} onClose={handleCreateModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb="20px">Create New Staff</Typography>
          <form onSubmit={handleCreateUserSubmit}>
            <TextField
              label="Full Name"
              name="fullName"
              value={newUser.fullName}
              onChange={handleCreateUserChange}
              fullWidth
              margin="normal"
              error={!usernameValidation.isValid}
              helperText={usernameValidation.message}
            />
            <TextField
              label="Email"
              name="email"
              value={newUser.email}
              onChange={handleCreateUserChange}
              fullWidth
              margin="normal"
              error={!emailValidation.isValid}
              helperText={emailValidation.message}
            />
            <TextField
              label="Password"
              name="password"
              value={newUser.password}
              onChange={handleCreateUserChange}
              fullWidth
              margin="normal"
              error={!passwordValidation.isValid}
              helperText={passwordValidation.message}
              type="password"
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              value={newUser.confirmPassword}
              onChange={handleCreateUserChange}
              fullWidth
              margin="normal"
              error={!confirmPasswordValidation.isValid}
              helperText={confirmPasswordValidation.message}
              type="password"
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
            >
              Create
            </Button>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default Users;
