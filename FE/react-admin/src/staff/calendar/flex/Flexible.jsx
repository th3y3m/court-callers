import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, FormControl, Select, MenuItem } from "@mui/material";
import { validateRequired, validateNumber, flexValidation } from "../../../scenes/formValidation";
import { fetchBranches, fetchBranchById } from '../../../api/branchApi';
import { fetchUserDetailByEmail, fetchUserDetail ,fetchUserDetailByEmailVer2} from "../../../api/userApi";
import { useNavigate } from "react-router-dom";
import { checkBookingTypeFlex } from "../../../api/bookingApi";

const Flexible = () => {
  const [email, setEmail] = useState('');
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [numberOfSlot, setNumberOfSlot] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [userInfo, setUserInfo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [availableSlot, setAvailableSlot] = useState(null);
  const[bookingId, setBookingId] = useState(null);
  const [errors, setErrors] = useState({
    email: '',
    numberOfSlot: '',
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [flexValidate, setFlexValidate] = useState({
    isValid: true,
    message: "",
});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranchesData = async () => {
      try {
        const response = await fetchBranches(1, 10);
        setBranches(response.items);
      } catch (error) {
        console.error('Error fetching branches data:', error);
      }
    };

    fetchBranchesData();
  }, []);

  const handleChange = (field, value) => {
    let error = '';
    if (field === 'numberOfSlot') {
      const validation = validateNumber(value);
      error = validation.isValid ? '' : validation.message;
    } else if (field === 'email') {
      const validation = validateRequired(value);
      error = validation.isValid ? '' : validation.message;
    }
    setErrors(prevErrors => ({ ...prevErrors, [field]: error }));

    if (field === 'email') setEmail(value);
    if (field === 'numberOfSlot') setNumberOfSlot(value);
  };

  const handleSubmit = async () => {
    const emailValidation = validateRequired(email);
    const numberOfSlotValidation = validateNumber(numberOfSlot);
    const branchIdValidation = validateRequired(selectedBranch);

    if (!emailValidation.isValid ||   !branchIdValidation.isValid) {
      setErrors({
        email: emailValidation.message,
        numberOfSlot: numberOfSlotValidation.message,
      });
      return;
    }

    const flexValidate = flexValidation(numberOfSlot)

    setFlexValidate(flexValidate);

    if(!flexValidate.isValid){
      setMessage("Please try again");
      setMessageType("error");
      return;
    }

    try {
      const userResponse = await fetchUserDetailByEmail(email);
      const user = userResponse[0];
      const branchResponse = await fetchBranchById(selectedBranch);
      if (userResponse && branchResponse) {
        const userId = user.userId;

        console.log('userId:', userId);

        navigate("/flexible-booking", {
          state: {
            userChecked: true,
            userId,
            email,
            numberOfSlot,
            branchId: selectedBranch,
            userInfo,
            availableSlot,
            bookingId,
          }
        });
      } else {
        setErrors({
          email: user ? '' : 'Invalid email',
          numberOfSlot: '',
        });
      }
    } catch (error) {
      console.error('Error during validation:', error);
      setErrors({
        email: 'Error validating email',
        numberOfSlot: '',
      });
    }
  };

  const handleCheck = async () => {
    if (!email) {
      setErrorMessage('Please enter an email.');
      return;
    }
    try {
      const userData = await fetchUserDetailByEmail(email);
      if (userData && userData.length > 0) {
        const user = userData[0];
        const detailedUserInfo = await fetchUserDetail(user.id);

        const availableSlot = await checkBookingTypeFlex(user.id, selectedBranch);
        console.log('availableSlot:', availableSlot);

        setAvailableSlot(availableSlot.numberOfSlot); // Update the state
        setBookingId(availableSlot.bookingId);
        if (detailedUserInfo) {
          setUserExists(true);
          setUserInfo({
            userId: user.id,
            userName: user.userName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            fullName: detailedUserInfo.fullName,
            balance: detailedUserInfo.balance,
            address: detailedUserInfo.address,
          });
          setErrorMessage('');
        } else {
          setUserExists(false);
          setUserInfo(null);
          setErrorMessage('User details not found.');
        }
      } else {
        setUserExists(false);
        setUserInfo(null);
        setErrorMessage('User does not exist. Please register.');
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
      setErrorMessage('Error checking user existence. Please try again.');
    }
  };

  return (
    <Box
      m="70px auto"
      sx={{
        backgroundColor: "#CEFCEC",
        borderRadius: 2,
        p: 4,
        maxWidth: "800px",
      }}
    >
      <Typography
        fontWeight="bold"
        mb="30px"
        variant="h2"
        color="black"
        textAlign="center"
      >
        Flexible Court Booking
      </Typography>

      <Box m="20px" className="max-width-box" sx={{ backgroundColor: "#F5F5F5", borderRadius: 2, p: 2 }}>
        <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
          <FormControl sx={{ minWidth: 200, backgroundColor: "#0D1B34", borderRadius: 1 }}>
            <Select
              labelId="branch-select-label"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              displayEmpty
              sx={{ color: "#FFFFFF" }}
            >
              <MenuItem value="">
                <em>--Select Branch--</em>
              </MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch.branchId} value={branch.branchId}>
                  {branch.branchId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {selectedBranch && (
          <Box>
            <Box sx={{ padding: '20px', borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom color="black">
                Customer Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                
                  label="Email"
              
                  variant="outlined"
                  fullWidth
                  sx={{ marginBottom: '10px', marginRight: '10px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    sx: {
                      '& .MuiInputBase-input': {
                        color: 'black',
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      color: 'black',
                    },
                  }}
                  
               />
                <Button variant="contained" color="primary" onClick={handleCheck}>
                  Check
                </Button>
              </Box>
              {errorMessage && (
                <Typography variant="body2" color="error">
                  {errorMessage}
                </Typography>
              )}
              {userExists && userInfo && (
                <Box sx={{ padding: '10px', borderRadius: 2, marginTop: '5px' }}>
                  <Typography variant="h6" color="black">
                    <strong>Username:</strong> {userInfo.userName ? userInfo.userName : 'N/A'}
                  </Typography>
                  <Typography variant="h6" color="black">
                    <strong>Full Name:</strong> {userInfo.fullName ? userInfo.fullName : 'N/A'}
                  </Typography>
                  <Typography variant="h6" color="black">
                    <strong>Phone:</strong> {userInfo.phoneNumber ? userInfo.phoneNumber : 'N/A'}
                  </Typography>
                  <Typography variant="h6" color="black">
                    <strong>Coin:</strong> {userInfo.balance ? userInfo.balance : 'N/A'}
                  </Typography>
                </Box>
              )}
              {availableSlot !== 0 && availableSlot !== null && (
                <Box sx={{ backgroundColor: "#e0f7fa", padding: '10px', borderRadius: 1, marginTop: '10px' }}>
                  <Typography variant="h6" color="black">
                    Currently, the customer's account has <strong>{availableSlot}</strong> remaining booking slots.
                  </Typography>
                </Box>
              )}
            </Box>

            {availableSlot === 0 && (
              <>
                <Typography mb="10px" mt="10px" variant="h5" color="black" fontWeight="bold">
                  Number of Slots
                </Typography>
                <TextField
                className={
                  flexValidate.isValid ? "" : "error-input"
                }
                  placeholder="Enter Number of Slots"
                  fullWidth
                  type="number"
                  required
                  value={numberOfSlot}
                  onChange={(e) => setNumberOfSlot(e.target.value)}
                  error={Boolean(errors.numberOfSlot)}
                  helperText={errors.numberOfSlot}
                  InputProps={{
                    style: {
                      color: "#000000",
                    },
                  }}
                  sx={{
                    mb: "20px",
                    backgroundColor: "#ffffff",
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                  }}
                />
                {flexValidate.message && (
                <p className="errorVal">{flexValidate.message}</p>
              )}
              </>
            )}

            <Box display="flex" justifyContent="flex-end" mt="30px">
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  padding: "10px 30px",
                  fontSize: "16px",
                }}
                onClick={handleSubmit}
              >
                Book
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Flexible;
