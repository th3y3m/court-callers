// src/staff/Payment/LoadingPage.jsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#F5F5F5',
      }}
    >
      <CircularProgress />
      <Typography variant="h6" color="black" sx={{ marginTop: '20px' }}>
        Processing your payment, please wait...
      </Typography>
    </Box>
  );
};

export default LoadingPage;
