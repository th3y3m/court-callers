import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, InputBase } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { fetchPayments, fetchPaymentById } from '../../api/paymentApi'; // Updated import
import SearchIcon from '@mui/icons-material/Search';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Payments = () => {
  const [paymentsData, setPaymentsData] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const query = useQuery();
  const navigate = useNavigate();
  
  const [error, setError] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const getPaymentsData = async () => {
      try {
        const data = await fetchPayments();
        console.log('Fetched payments data:', data); // Log fetched data

        if (data.items && Array.isArray(data.items)) {
          setPaymentsData(data.items);
        } else {
          throw new Error('Invalid data structure');
        }
      } catch (err) {
        setError(`Failed to fetch payments data: ${err.message}`);
      }
    };
    getPaymentsData();
  }, []);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSearch = async () => {
    if (searchValue.trim() === '') {
      setSearchResult(null);
      const getPaymentsData = async () => {
        try {
          const data = await fetchPayments();
          console.log('Fetched payments data:', data); // Log fetched data

          if (data.items && Array.isArray(data.items)) {
            setPaymentsData(data.items);
          } else {
            throw new Error('Invalid data structure');
          }
        } catch (err) {
          setError(`Failed to fetch payments data: ${err.message}`);
        }
      };
      getPaymentsData();
    } else {
      try {
        const result = await fetchPaymentById(searchValue);
        setSearchResult(result);
      } catch (err) {
        setError(`Failed to fetch payment by ID: ${err.message}`);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box m="20px">
      <Header title="PAYMENTS" subtitle="List of Payments" />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search by Payment ID"
                value={searchValue}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress} // Add onKeyPress event
              />
              <IconButton type="button" sx={{ p: 1 }} onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            </Box>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Payment Amount</TableCell>
                  <TableCell>Payment Date</TableCell>
                  <TableCell>Payment Message</TableCell>
                  <TableCell>Payment Signature</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResult ? (
                  <TableRow key={searchResult.paymentId}>
                    <TableCell>{searchResult.paymentId}</TableCell>
                    <TableCell>{searchResult.bookingId}</TableCell>
                    <TableCell>{searchResult.paymentAmount}</TableCell>
                    <TableCell>{new Date(searchResult.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{searchResult.paymentMessage}</TableCell>
                    <TableCell>{searchResult.paymentSignature}</TableCell>
                  </TableRow>
                ) : paymentsData.length > 0 ? (
                  paymentsData.map((row) => (
                    <TableRow key={row.paymentId}>
                      <TableCell>{row.paymentId}</TableCell>
                      <TableCell>{row.bookingId}</TableCell>
                      <TableCell>{row.paymentAmount}</TableCell>
                      <TableCell>{new Date(row.paymentDate).toLocaleDateString()}</TableCell>
                      <TableCell>{row.paymentMessage}</TableCell>
                      <TableCell>{row.paymentSignature}</TableCell>
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
        </Box>
      )}
    </Box>
  );
};

export default Payments;
