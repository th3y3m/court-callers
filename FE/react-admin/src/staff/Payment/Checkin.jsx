import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import QrScanner from 'react-qr-scanner';
import axios from 'axios';
import QRCode from 'qrcode';

const Checkin = () => {
    const [qrData, setQrData] = useState(null);
    const [result, setResult] = useState('');
    const [checkinSuccess, setCheckinSuccess] = useState(false);
    const [bookingId, setBookingId] = useState('');
    const [qrCodeBase64, setQrCodeBase64] = useState('');

    const handleScan = async (data) => {
        if (data) {
            try {
                const bookingData = JSON.parse(data.text);
                setQrData(data.text);
                setBookingId(bookingData.BookingId);

                const qrCodeDataUrl = await QRCode.toDataURL(data.text);
                const base64Data = qrCodeDataUrl.split(',')[1]; 
                setQrCodeBase64(base64Data);

                console.log('QR Code Data:', data.text);
                console.log('Booking ID:', bookingData.BookingId);
                console.log('QR Code Base64:', base64Data);
                
                const response = await axios.post('https://courtcaller.azurewebsites.net/api/TimeSlots/checkin/qr', {
                    QRCodeData: data.text 
                });
                setResult(response.data);
                setCheckinSuccess(true);
            } catch (error) {
                setResult('Check-in failed.');
                setCheckinSuccess(false);
            }
        }
    };

    const handleError = (err) => {
        console.error('Error scanning QR Code:', err);
    };

    const previewStyle = {
        height: 300, 
        width: 400, 
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} style={{ padding: '2rem', marginTop: '2rem' }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Check-In
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                    <QrScanner
                        delay={300}
                        onError={handleError}
                        onScan={handleScan}
                        style={previewStyle}
                    />
                    {qrData && (
                        <Box
                            component="div"
                            sx={{
                                marginTop: '1rem',
                                border: checkinSuccess ? '5px solid green' : '5px solid red',
                                borderRadius: '10px',
                                width: '200px', 
                                height: '200px', 
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#f0f0f0'
                            }}
                        >
                            <BookingQRCode qrCodeBase64={qrCodeBase64} />
                        </Box>
                    )}
                    {result && (
                        <Typography 
                            variant="body1" 
                            color={checkinSuccess ? 'textSecondary' : 'error'} 
                            style={{ marginTop: '1rem' }}
                        >
                            {result}
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

function BookingQRCode({ qrCodeBase64 }) {
    return (
        <img 
            src={`data:image/png;base64,${qrCodeBase64}`} 
            alt="QR Code" 
            style={{ width: '150px', height: '150px' }} 
        />
    );
}

export default Checkin;
