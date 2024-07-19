import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { fetchBookingById } from '../../api/bookingApi';
import moment from 'moment';
import { fetchTimeSlotByBookingId } from '../../api/timeSlotApi';
import CancelIcon from '@mui/icons-material/Cancel';

export const PaymentConfirmed = ({
  userInfo = {}, branchId = 'N/A', courtId = 'N/A',
}) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlot] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('vnp_TxnRef');

    if (bookingId) {
      const fetchBookingAndTimeSlot = async () => {
        try {
          const bookingData = await fetchBookingById(bookingId);

          setBooking(bookingData);

          const timeSlotData = await fetchTimeSlotByBookingId(bookingId);

          setTimeSlot(timeSlotData);
        } catch (error) {
          console.error('Error fetching booking or time slot:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchBookingAndTimeSlot();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }


  
  return (
    <Box sx={{ padding: '40px', textAlign: 'center' }}>
      <Box sx={{ backgroundColor: "#F0F0F0", padding: '40px', borderRadius: 2 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'green' }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'green', marginTop: '10px' }}>
          Payment confirmed
        </Typography>
        <Typography variant="body1" color="black" sx={{ marginBottom: '20px' }}>
          Thank you, your payment has been successful and your booking is now confirmed. A confirmation email has been sent to {userInfo.email || 'N/A'}.
        </Typography>
        {booking && (
          <Paper elevation={3} sx={{ padding: '20px', marginTop: '20px', backgroundColor: '#fff', maxWidth: '600px', margin: '0 auto' }}>
            <Typography variant="h6" color="black" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>
              Order summary
            </Typography>
            <Box sx={{ textAlign: 'left' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  {/* <Typography variant="body1" color="black">
                    <strong>Email:</strong>
                  </Typography> */}
                </Grid>
                <Grid item xs={6}>
                  {/* <Typography variant="body1" color="black" sx={{ textAlign: 'right' }}>
                    {userInfo.email || 'N/A'}
                  </Typography> */}
                </Grid>
                <Grid item xs={6}>
                  {/* <Typography variant="body1" color="black">
                    <strong>Branch ID:</strong>
                  </Typography> */}
                </Grid>
                <Grid item xs={6}>
                  {/* <Typography variant="body1" color="black" sx={{ textAlign: 'right' }}>
                    {branchId}
                  </Typography> */}
                </Grid>
                <Grid item xs={6}>
                  {/* <Typography variant="body1" color="black">
                    <strong>Court ID:</strong>
                  </Typography> */}
                </Grid>
                <Grid item xs={6}>
                  {/* <Typography variant="body1" color="black" sx={{ textAlign: 'right' }}>
                    {courtId}
                  </Typography> */}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" color="black">
                    <strong>Time Slot:</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" color="black" sx={{ textAlign: 'right' }}>
                    {timeSlots ? (  timeSlots.map ((slot,index) => (
                      <div key={index}>
                     { `${slot.slotStartTime} - ${slot.slotEndTime} ` }
                      </div>))): 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" color="black">
                    <strong>Payment Date:</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" color="black" sx={{ textAlign: 'right' }}>
                    {moment(booking.bookingDate).format('DD/MM/YYYY')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" color="black">
                    <strong>Total Price:</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" color="black" sx={{ textAlign: 'right' }}>
                    {booking.totalPrice} USD
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export const PaymentRejected = () => {
  return (
    <Box sx={{ padding: '40px', textAlign: 'center' }}>
      <Box sx={{ backgroundColor: "#F0F0F0", padding: '40px', borderRadius: 2 }}>
        <CancelIcon sx={{ fontSize: 80, color: 'red' }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'red', marginTop: '10px' }}>
          Payment rejected
        </Typography>
        <Typography variant="body1" color="black" sx={{ marginBottom: '20px' }}>
          Your payment was declined. Please try again or use a different payment method.
        </Typography>
      </Box>
    </Box>
  );
};
