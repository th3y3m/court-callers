import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Button, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select,
  MenuItem, IconButton, InputBase
} from "@mui/material";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import { fetchBookings, deleteBooking, fetchUserEmailById } from "../../api/bookingApi";
import Header from "../../components/Header";
import SearchIcon from "@mui/icons-material/Search";

const useQuery = () => new URLSearchParams(useLocation().search);

const Bookings = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const query = useQuery();
  const navigate = useNavigate();

  const userRole = useMemo(() => localStorage.getItem("userRole"), []);
  const [bookingsData, setBookingsData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(parseInt(query.get('pageNumber')) - 1 || 0);
  const [pageSize, setPageSize] = useState(parseInt(query.get('pageSize')) || 10);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(query.get('searchQuery') || "");

  useEffect(() => {
    const getBookingsData = async () => {
      try {
        const data = await fetchBookings(page + 1, pageSize, searchQuery);

        const bookingsWithEmail = await Promise.all(data.items.map(async (booking) => {
          const email = await fetchUserEmailById(booking.id);
          return { ...booking, email };
        }));

        setBookingsData(bookingsWithEmail);
        setRowCount(data.totalCount);
      } catch (err) {
        setError('Failed to fetch bookings data');
      }
    };
    getBookingsData();
  }, [page, pageSize, searchQuery]);

  const handlePageClick = useCallback((event) => {
    const newPage = event.selected;
    setPage(newPage);
    navigate(`/${userRole === 'Admin' ? 'admin/Bookings' : 'Bookings'}?pageNumber=${newPage + 1}&pageSize=${pageSize}&searchQuery=${searchQuery}`);
  }, [navigate, pageSize, searchQuery, userRole]);

  const handlePageSizeChange = useCallback((event) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0);
    navigate(`/${userRole === 'Admin' ? 'admin/Bookings' : 'Bookings'}?pageNumber=1&pageSize=${newSize}&searchQuery=${searchQuery}`);
  }, [navigate, searchQuery, userRole]);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setPage(0);
    navigate(`/${userRole === 'Admin' ? 'admin/Bookings' : 'Bookings'}?pageNumber=1&pageSize=${pageSize}&searchQuery=${searchQuery.trim()}`);
  }, [navigate, pageSize, searchQuery, userRole]);

  const handleDelete = async (id) => {
    try {
      await deleteBooking(id);
      setBookingsData((prevData) =>
        prevData.filter((booking) => booking.bookingId !== id)
      );
      const data = await fetchBookings(page + 1, pageSize, searchQuery);
      const bookingsWithEmail = await Promise.all(data.items.map(async (booking) => {
        const email = await fetchUserEmailById(booking.id);
        return { ...booking, email };
      }));
      setBookingsData(bookingsWithEmail);
      setRowCount(data.totalCount);
    } catch (error) {
      console.error(`Failed to delete booking with id ${id}:`, error);
      setError(`Failed to delete booking with id ${id}: ${error.message}`);
    }
  };

  return (
    <Box m="20px">
      <Header title="BOOKINGS" subtitle="List of Bookings" />
      {error ? (
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search by Booking ID"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit() }}
              />
              <IconButton type="button" sx={{ p: 1 }} onClick={handleSearchSubmit}>
                <SearchIcon />
              </IconButton>
            </Box>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User Email</TableCell>
                  <TableCell>Booking Date</TableCell>
                  <TableCell>Booking Type</TableCell>
                  <TableCell>Number of Slots</TableCell>
                  <TableCell>Total Price</TableCell>
                  <TableCell>Status</TableCell>
                  {userRole !== 'Staff' && <TableCell align="center">Action</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {bookingsData.length > 0 ? (
                  bookingsData.map((row) => (
                    <TableRow key={row.bookingId}>
                      <TableCell>{row.bookingId}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{new Date(row.bookingDate).toLocaleString()}</TableCell>
                      <TableCell>{row.bookingType}</TableCell>
                      <TableCell>{row.numberOfSlot}</TableCell>
                      <TableCell>{row.totalPrice}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      {userRole !== 'Staff' && (
                        <TableCell align="center">
                          <Box display="flex" justifyContent="center" alignItems="center">
                            <Button
                              onClick={() => handleDelete(row.bookingId)}
                              variant="contained"
                              size="small"
                              style={{ backgroundColor: colors.redAccent[400], color: colors.primary[900] }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </TableCell>
                      )}
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
    </Box>
  );
};

export default Bookings;
