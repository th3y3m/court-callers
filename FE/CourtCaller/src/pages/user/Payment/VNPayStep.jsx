import React from 'react';
import { Box, Typography } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

const VNPayStep = () => {
  return (
    <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom color="black" display="flex" alignItems="center">
        <VpnKeyIcon sx={{ marginRight: '8px' }} /> VNPay
      </Typography>
      <Typography variant="h6" color="black">
        Please enter your VNPay details to proceed with the payment.
      </Typography>
      {/* Add VNPay form fields here */}
    </Box>
  );
};

export default VNPayStep;
