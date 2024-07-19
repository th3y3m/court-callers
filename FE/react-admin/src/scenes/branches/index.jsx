import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box, Button, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select,
  MenuItem, IconButton, InputBase, Modal, TextField
} from '@mui/material';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { fetchBranches, createBranch, postPrice } from '../../api/branchApi';
import Header from '../../components/Header';
import SearchIcon from '@mui/icons-material/Search';
import '../users/style.css';
import { storageDb } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from "firebase/storage";
import { v4 } from 'uuid';
import {
  validateFullName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePhone,
  validateTime,
  validateRequired,
  validateNumber
} from '../formValidation';

const useQuery = () => new URLSearchParams(useLocation().search);

const Branches = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const query = useQuery();
  const navigate = useNavigate();

  const [branchesData, setBranchesData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(parseInt(query.get('pageNumber')) - 1 || 0);
  const [pageSize, setPageSize] = useState(parseInt(query.get('pageSize')) || 10);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(query.get('searchQuery') || "");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});

  const [newBranch, setNewBranch] = useState({
    branchAddress: "",
    branchName: "",
    branchPhone: "",
    description: "",
    branchPictures: [],
    openTime: "",
    closeTime: "",
    openDay: { day1: "", day2: "" },
    status: "Active",
    weekdayPrice: "",
    weekendPrice: "",
    fixPrice: "",
    flexPrice: ""
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const getBranchesData = async () => {
      try {
        const data = await fetchBranches(page + 1, pageSize, searchQuery);
        setBranchesData(data.items);
        setRowCount(data.totalCount);
      } catch (err) {
        setError('Failed to fetch branches data');
      }
    };
    getBranchesData();
  }, [page, pageSize, searchQuery]);

  const handlePageClick = useCallback((event) => {
    const newPage = event.selected;
    setPage(newPage);
    navigate(`/admin/Branches?pageNumber=${newPage + 1}&pageSize=${pageSize}&searchQuery=${searchQuery}`);
  }, [navigate, pageSize, searchQuery]);

  const handlePageSizeChange = useCallback((event) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0);
    navigate(`/admin/Branches?pageNumber=1&pageSize=${newSize}&searchQuery=${searchQuery}`);
  }, [navigate, searchQuery]);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setPage(0);
    navigate(`/admin/Branches?pageNumber=1&pageSize=${pageSize}&searchQuery=${searchQuery.trim()}`);
  }, [navigate, pageSize, searchQuery]);

  const handleView = (branchId) => {
    navigate(`/admin/Courts?branchId=${branchId}`);
  };

  const handleViewDetail = (branchId) => {
    navigate(`/admin/BranchDetail/${branchId}`);
  };

  const handleCreateNew = async () => {
    const validationErrors = {};

    if (!validateRequired(newBranch.branchAddress).isValid) {
      validationErrors.branchAddress = validateRequired(newBranch.branchAddress).message;
    }
    if (!validateRequired(newBranch.branchName).isValid) {
      validationErrors.branchName = validateRequired(newBranch.branchName).message;
    }
    if (!validatePhone(newBranch.branchPhone).isValid) {
      validationErrors.branchPhone = validatePhone(newBranch.branchPhone).message;
    }
    if (!validateTime(newBranch.openTime).isValid) {
      validationErrors.openTime = validateTime(newBranch.openTime).message;
    }
    if (!validateTime(newBranch.closeTime).isValid) {
      validationErrors.closeTime = validateTime(newBranch.closeTime).message;
    }
    if (!validateNumber(newBranch.weekdayPrice).isValid) {
      validationErrors.weekdayPrice = validateNumber(newBranch.weekdayPrice).message;
    }
    if (!validateNumber(newBranch.weekendPrice).isValid) {
      validationErrors.weekendPrice = validateNumber(newBranch.weekendPrice).message;
    }
    if (!validateNumber(newBranch.fixPrice).isValid) {
      validationErrors.fixPrice = validateNumber(newBranch.fixPrice).message;
    }
    if (!validateNumber(newBranch.flexPrice).isValid) {
      validationErrors.flexPrice = validateNumber(newBranch.flexPrice).message;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const uploadimage = newBranch.branchPictures.map(async (image) => {
        const imageRef = ref(storageDb, `BranchImage/${v4()}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        return url;
      });

      const imageUrls = await Promise.all(uploadimage);

      const branchData = {
        ...newBranch,
        branchPicture: JSON.stringify(imageUrls),
      };

      const formData = new FormData();
      Object.keys(branchData).forEach(key => {
        if (key === 'openDay') {
          formData.append(key, `${branchData.openDay.day1} to ${branchData.openDay.day2}`);
        } else if (key === 'branchPictures') {
          branchData.branchPictures.forEach(file => {
            formData.append('BranchPictures', file);
          });
        } else {
          formData.append(key, branchData[key]);
        }
      });

      const createdBranch = await createBranch(formData);

      const priceData = [
        {
          branchId: createdBranch.branchId,
          type: 'Fix',
          isWeekend: null,
          slotPrice: newBranch.fixPrice
        },
        {
          branchId: createdBranch.branchId,
          type: 'Flex',
          isWeekend: null,
          slotPrice: newBranch.flexPrice
        },
        {
          branchId: createdBranch.branchId,
          type: 'By day',
          isWeekend: true,
          slotPrice: newBranch.weekendPrice
        },
        {
          branchId: createdBranch.branchId,
          type: 'By day',
          isWeekend: false,
          slotPrice: newBranch.weekdayPrice
        }
      ];

      for (const price of priceData) {
        await postPrice(price);
      }

      setOpenCreateModal(false);

      const data = await fetchBranches(page + 1, pageSize, searchQuery);
      setBranchesData(data.items);
      setRowCount(data.totalCount);
    } catch (error) {
      setError('Failed to create branch');
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewBranch(prevState => {
      const updatedBranch = {
        ...prevState,
        [name]: value
      };

      if (errors[name]) {
        const updatedErrors = { ...errors };
        delete updatedErrors[name];
        setErrors(updatedErrors);
      }

      return updatedBranch;
    });
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);

    const validPictureTypes = files.filter((file) => {
      const isValidType = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg';
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isValidSize || !isValidType) {
        console.error('File is not a correct type of image or exceeds the size limit');
      }
      return isValidType && isValidSize;
    });

    const previewUrls = validPictureTypes.map(file => URL.createObjectURL(file));

    setNewBranch(prevState => ({
      ...prevState,
      branchPictures: prevState.branchPictures ? [...prevState.branchPictures, ...validPictureTypes] : [...validPictureTypes]
    }));

    setPreviewImages(prevState => prevState ? [...prevState, ...previewUrls] : [...previewUrls]);
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setNewBranch(prevState => {
      const updatedBranch = {
        ...prevState,
        openDay: {
          ...prevState.openDay,
          [name]: value
        }
      };

      if (errors[name]) {
        const updatedErrors = { ...errors };
        delete updatedErrors[name];
        setErrors(updatedErrors);
      }

      return updatedBranch;
    });
  };

  const handleImageRemove = (index) => {
    setNewBranch(prevState => ({
      ...prevState,
      branchPictures: prevState.branchPictures.filter((_, i) => i !== index)
    }));
    setPreviewImages(prevState => prevState.filter((_, i) => i !== index));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateModalClose = () => {
    setOpenCreateModal(false);
  };

  return (
    <Box m="20px">
      <Header title="BRANCHES" subtitle="List of Branches" />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search by Branch Name"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit() }}
              />
              <IconButton type="button" sx={{ p: 1 }} onClick={handleSearchSubmit}>
                <SearchIcon />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              onClick={() => setOpenCreateModal(true)}
              style={{
                backgroundColor: colors.greenAccent[400],
                color: colors.primary[900],
                marginLeft: 8
              }}
            >
              Create New
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>Branch ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Open Time</TableCell>
                  <TableCell>Close Time</TableCell>
                  <TableCell>Open Day</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {branchesData.length > 0 ? (
                  branchesData.map((branch) => (
                    <TableRow key={branch.branchId}>
                      <TableCell>{branch.branchId}</TableCell>
                      <TableCell>{branch.branchName}</TableCell>
                      <TableCell>{branch.branchAddress}</TableCell>
                      <TableCell>{branch.openTime}</TableCell>
                      <TableCell>{branch.closeTime}</TableCell>
                      <TableCell>{branch.openDay}</TableCell>
                      <TableCell>{branch.status}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" alignItems="center">
                          <Button
                            variant="contained"
                            style={{ backgroundColor: colors.greenAccent[500], color: 'black' }}
                            onClick={() => handleView(branch.branchId)}
                          >
                            View Court
                          </Button>
                          <Button
                            variant="contained"
                            style={{ backgroundColor: colors.greenAccent[500], color: 'black', marginLeft: '8px' }}
                            onClick={() => handleViewDetail(branch.branchId)}
                          >
                            View Detail
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
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
              {[10, 15, 20, 25, 50].map(size => (
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
          <Modal open={openCreateModal} onClose={handleCreateModalClose}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                maxHeight: '90vh',
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
                overflowY: 'auto',
              }}
            >
              <Typography variant="h6" mb="20px">Create New Branch</Typography>
              <Box display="flex" justifyContent="space-between">
                <Box width="48%">
                  <TextField
                    label="Branch Address"
                    name="branchAddress"
                    value={newBranch.branchAddress}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.branchAddress}
                    helperText={errors.branchAddress}
                  />
                  <TextField
                    label="Branch Name"
                    name="branchName"
                    value={newBranch.branchName}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.branchName}
                    helperText={errors.branchName}
                  />
                  <TextField
                    label="Branch Phone"
                    name="branchPhone"
                    value={newBranch.branchPhone}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.branchPhone}
                    helperText={errors.branchPhone}
                  />
                  <TextField
                    label="Description"
                    name="description"
                    value={newBranch.description}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.description}
                    helperText={errors.description}
                  />
                  <Typography mt={2} mb={2} variant="subtitle1">Branch picture</Typography>
                  <input type="file" accept='image/' multiple onChange={handleFileChange} ref={fileInputRef} className="hidden-file-input" />
                  <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
                    {previewImages && previewImages.map((image, index) => (
                      <Box key={index} position="relative" display="inline-block">
                        <img src={image} alt={`Preview ${index}`} style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} />
                        <Button
                          size="small"
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            color: 'red',
                            minWidth: '24px',
                            minHeight: '24px',
                            padding: 0
                          }}
                          onClick={() => handleImageRemove(index)}
                        >
                          X
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box width="48%">
                  <TextField
                    label="Open Time"
                    name="openTime"
                    value={newBranch.openTime}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.openTime}
                    helperText={errors.openTime}
                  />
                  <TextField
                    label="Close Time"
                    name="closeTime"
                    value={newBranch.closeTime}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.closeTime}
                    helperText={errors.closeTime}
                  />
                  <TextField
                    label="Weekday Price"
                    name="weekdayPrice"
                    value={newBranch.weekdayPrice}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.weekdayPrice}
                    helperText={errors.weekdayPrice}
                  />
                  <TextField
                    label="Weekend Price"
                    name="weekendPrice"
                    value={newBranch.weekendPrice}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.weekendPrice}
                    helperText={errors.weekendPrice}
                  />
                  <TextField
                    label="Fix Price"
                    name="fixPrice"
                    value={newBranch.fixPrice}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.fixPrice}
                    helperText={errors.fixPrice}
                  />
                  <TextField
                    label="Flex Price"
                    name="flexPrice"
                    value={newBranch.flexPrice}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.flexPrice}
                    helperText={errors.flexPrice}
                  />
                  <Box mt={2} mb={2}>
                    <Typography variant="subtitle1">Open Day</Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Select
                        label="Day 1"
                        name="day1"
                        value={newBranch.openDay.day1}
                        onChange={handleSelectChange}
                        fullWidth
                      >
                        {daysOfWeek.map(day => (
                          <MenuItem key={day} value={day}>
                            {day}
                          </MenuItem>
                        ))}
                      </Select>
                      <Select
                        label="Day 2"
                        name="day2"
                        value={newBranch.openDay.day2}
                        onChange={handleSelectChange}
                        fullWidth
                      >
                        {daysOfWeek.map(day => (
                          <MenuItem key={day} value={day}>
                            {day}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: colors.greenAccent[700], color: 'white' }}
                  onClick={handleCreateNew}
                >
                  Create
                </Button>
              </Box>
              </Box>
      </Modal>
    </Box>
  )}
</Box>
);
};

export default Branches;
