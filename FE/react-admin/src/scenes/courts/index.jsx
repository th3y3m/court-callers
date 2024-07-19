import React, { useEffect, useState } from "react";
import { Box, Button, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, TextField, InputBase, IconButton, Modal } from "@mui/material";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import { fetchCourtByBranchId, createCourt, updateCourtById, deleteCourtById } from "../../api/courtApi";
import Header from "../../components/Header";
import SearchIcon from "@mui/icons-material/Search";
import { validateRequired } from "../formValidation";

const useQuery = () => new URLSearchParams(useLocation().search);

const Courts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [courtsData, setCourtsData] = useState([]);
  const query = useQuery();
  const navigate = useNavigate();
  const branchIdQuery = query.get("branchId");

  const pageQuery = parseInt(query.get("pageNumber")) || 1;
  const sizeQuery = parseInt(query.get("pageSize")) || 10;

  const [page, setPage] = useState(pageQuery - 1);
  const [pageSize, setPageSize] = useState(sizeQuery);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourtId, setCurrentCourtId] = useState(null);
  const [errors, setErrors] = useState({});
  const [courtData, setCourtData] = useState({
    branchId: branchIdQuery,
    courtName: "",
    courtPicture: "",
    status: "Active",
  });

  useEffect(() => {
    if (!branchIdQuery) {
      setError("Branch ID is required to view courts.");
      return;
    }
  
    const getCourtsData = async () => {
      try {
        const data = await fetchCourtByBranchId(branchIdQuery, page + 1, pageSize, searchId);
        const filteredData = data.filter(
          (court) => court.branchId === branchIdQuery
        );
        const numberedData = filteredData.map((item, index) => ({
          ...item,
          rowNumber: index + 1 + page * pageSize,
        }));
        setCourtsData(numberedData);
        setRowCount(filteredData.length);
      } catch (err) {
        setError(`Failed to fetch courts data: ${err.message}`);
      }
    };
    getCourtsData();
  }, [page, pageSize, branchIdQuery, searchId]);
  

  const handlePageClick = (event) => {
    const newPage = event.selected;
    setPage(newPage);
    navigate(
      `/admin/Courts?pageNumber=${
        newPage + 1
      }&pageSize=${pageSize}&branchId=${branchIdQuery}`
    );
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0);
    navigate(
      `/admin/Courts?pageNumber=1&pageSize=${newSize}&branchId=${branchIdQuery}`
    );
  };

  const handleView = (courtId) => {
    navigate(`/admin/TimeSlots?courtId=${courtId}&branchId=${branchIdQuery}`);
  };
  
  const handleEdit = (court) => {
    setCourtData(court);
    setCurrentCourtId(court.courtId);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (courtId) => {
    try {
      await deleteCourtById(courtId);
      const data = await fetchCourtByBranchId(branchIdQuery, page + 1, pageSize, searchId);
      const filteredData = data.filter(
        (court) => court.branchId === branchIdQuery
      );
      const numberedData = filteredData.map((item, index) => ({
        ...item,
        rowNumber: index + 1 + page * pageSize,
      }));
      setCourtsData(numberedData);
      setRowCount(filteredData.length);
    } catch (err) {
      setError(`Failed to delete court: ${err.message}`);
    }
  };
  

  const handleSearch = async () => {
    try {
      const data = await fetchCourtByBranchId(branchIdQuery, page + 1, pageSize, searchId);
      const filteredData = data.filter(
        (court) => court.branchId === branchIdQuery
      );
      const numberedData = filteredData.map((item, index) => ({
        ...item,
        rowNumber: index + 1 + page * pageSize,
      }));
      setCourtsData(numberedData);
      setRowCount(filteredData.length);
    } catch (err) {
      setError(`Failed to fetch court data: ${err.message}`);
    }
  };
  

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setCourtData({ ...courtData, [name]: value });

     // Kiểm tra và xóa lỗi tương ứng nếu có
    if (errors[name]) {
    const updatedErrors = { ...errors };
    if (validateRequired(value).isValid) {
      delete updatedErrors[name];
    } else {
      updatedErrors[name] = validateRequired(value).message;
    }
    setErrors(updatedErrors);
  }
  };

  const handleModalSave = async () => {
    const validationErrors = {};

    if (!validateRequired(courtData.courtName).isValid) {
      validationErrors.courtName = validateRequired(courtData.courtName).message;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (isEditing) {
        await updateCourtById(currentCourtId, courtData);
      } else {
        await createCourt(courtData);
      }
      setModalOpen(false);
      const data = await fetchCourtByBranchId(branchIdQuery, page + 1, pageSize, searchId);
      const filteredData = data.filter(
        (court) => court.branchId === branchIdQuery
      );
      const numberedData = filteredData.map((item, index) => ({
        ...item,
        rowNumber: index + 1 + page * pageSize,
      }));
      setCourtsData(numberedData);
      setRowCount(filteredData.length);
      setCourtData({
        branchId: branchIdQuery,
        courtName: "",
        courtPicture: "",
        status: "Active",
      });
      setIsEditing(false);
      setCurrentCourtId(null);
    } catch (err) {
      setError(`Failed to save court: ${err.message}`);
    }
  };
  

  return (
    <Box m="20px">
      <Header
        title="COURTS"
        subtitle={`List of Courts for Branch ${branchIdQuery}`}
      />
      {error ? (
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box
              display="flex"
              backgroundColor={colors.primary[400]}
              borderRadius="3px"
            >
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search by Court ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <IconButton type="button" sx={{ p: 1 }} onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              style={{
                backgroundColor: colors.greenAccent[400],
                color: colors.primary[900],
                marginLeft: 8,
              }}
              onClick={() => {
                setIsEditing(false);
                setCourtData({
                  branchId: branchIdQuery,
                  courtName: "",
                  courtPicture: "",
                  status: "Active",
                });
                setModalOpen(true);
              }}
            >
              Create New
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>Court ID</TableCell>
                  <TableCell>Branch ID</TableCell>
                  <TableCell>Court Name</TableCell>
                  {/* <TableCell>Court Picture</TableCell> */}
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courtsData.length > 0 ? (
                  courtsData.map((row) => (
                    <TableRow key={row.courtId}>
                      <TableCell>{row.courtId}</TableCell>
                      <TableCell>{row.branchId}</TableCell>
                      <TableCell>{row.courtName}</TableCell>
                      {/* <TableCell>{row.courtPicture}</TableCell> */}
                      <TableCell>{row.status}</TableCell>
                      <TableCell align="center">
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Button
                            onClick={() => handleView(row.courtId)}
                            variant="contained"
                            size="small"
                            style={{
                              marginRight: 8,
                              backgroundColor: colors.greenAccent[400],
                              color: colors.primary[900],
                            }}
                          >
                            View
                          </Button>
                          <Button
                            onClick={() => handleEdit(row)}
                            variant="contained"
                            size="small"
                            style={{
                              marginRight: 8,
                              backgroundColor: colors.greenAccent[400],
                              color: colors.primary[900],
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(row.courtId)}
                            variant="contained"
                            size="small"
                            style={{
                              backgroundColor: colors.redAccent[400],
                              color: colors.primary[900],
                            }}
                          >
                            Inactive
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt="20px"
          >
            <Select value={pageSize} onChange={handlePageSizeChange}>
              {[10, 15, 20, 25, 50].map((size) => (
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
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            {isEditing ? "Edit Court" : "Create New Court"}
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Court Name"
            name="courtName"
            value={courtData.courtName}
            onChange={handleModalChange}
            error={!!errors.courtName}
            helperText={errors.courtName}
          />
          {/* <TextField
            fullWidth
            margin="normal"
            label="Court Picture"
            name="courtPicture"
            value={courtData.courtPicture}
            onChange={handleModalChange}
          /> */}
          <TextField
            fullWidth
            margin="normal"
            label="Status"
            name="status"
            value={courtData.status}
            onChange={handleModalChange}
          />
          <Button
            variant="contained"
            style={{
              backgroundColor: colors.greenAccent[400],
              color: colors.primary[900],
              marginTop: 16,
            }}
            onClick={handleModalSave}
          >
            Save
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Courts;
