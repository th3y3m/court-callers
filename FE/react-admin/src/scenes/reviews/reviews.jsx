import React, { useEffect, useState } from "react";
import { 
  Box, Button, InputBase, IconButton, Typography, useTheme, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TextField, Select, MenuItem, Modal 
} from "@mui/material";
import ReactPaginate from "react-paginate";
import { useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { fetchReviews, updateReview, deleteReview, fetchUserEmailById } from "../../api/reviewApi";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { validateRating, validateRequired } from "../formValidation";

const Reviews = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [reviewsData, setReviewsData] = useState([]);
  const [userEmails, setUserEmails] = useState({});
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentReview, setCurrentReview] = useState({ reviewId: "", reviewText: "", rating: 5, id: "", branchId: "" });
  const [searchParams, setSearchParams] = useSearchParams();
  const [errors, setErrors] = useState({});

  const page = parseInt(searchParams.get("pageNumber")) || 1;
  const pageSize = parseInt(searchParams.get("pageSize")) || 10;

  const [rowCount, setRowCount] = useState(0);

  useEffect(() => {
    const getData = async () => {
      try {
        const reviewsData = await fetchReviews(page, pageSize, searchQuery);
        setReviewsData(reviewsData.items);
        setRowCount(reviewsData.totalCount);

        const emailPromises = reviewsData.items.map(async (review) => {
          if (review.id) {
            const email = await fetchUserEmailById(review.id);
            return { id: review.id, email };
          }
          return { id: review.id, email: 'N/A' };
        });

        const emails = await Promise.all(emailPromises);
        const emailMap = emails.reduce((acc, { id, email }) => {
          acc[id] = email;
          return acc;
        }, {});
        setUserEmails(emailMap);
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}`);
      }
    };
    getData();
  }, [page, pageSize, searchQuery]);

  const handleEditToggle = (review) => {
    setCurrentReview({
      reviewId: review.reviewId,
      reviewText: review.reviewText,
      rating: review.rating,
      id: review.id,
      branchId: review.branchId
    });
    setOpenEditModal(true);
  };

  const handleFieldChange = (field, value) => {
    setCurrentReview((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "reviewText") {
      const validation = validateRequired(value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        reviewText: validation.isValid ? "" : validation.message,
      }));
    }

    if (field === "rating") {
      const validation = validateRating(value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        rating: validation.isValid ? "" : validation.message,
      }));
    }
  };

  const handleSave = async () => {
    const validationErrors = {};
  
    const reviewTextValidation = validateRequired(currentReview.reviewText);
    if (!reviewTextValidation.isValid) {
      validationErrors.reviewText = reviewTextValidation.message;
    }
  
    const ratingValidation = validateRating(currentReview.rating);
    if (!ratingValidation.isValid) {
      validationErrors.rating = ratingValidation.message;
    }
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      const payload = {
        reviewText: currentReview.reviewText,
        rating: currentReview.rating,
        userId: currentReview.id,
        branchId: currentReview.branchId,
      };
  
      await updateReview(currentReview.reviewId, payload);
      setOpenEditModal(false);
      const reviewsData = await fetchReviews(page, pageSize, searchQuery);
      setReviewsData(reviewsData.items);
      setRowCount(reviewsData.totalCount);
    } catch (err) {
      setError(`Failed to update review: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReview(id);
      setReviewsData((prev) => prev.filter((item) => item.reviewId !== id));
      const reviewsData = await fetchReviews(page, pageSize, searchQuery);
      setReviewsData(reviewsData.items);
      setRowCount(reviewsData.totalCount);
    } catch (err) {
      setError(`Failed to delete review: ${err.message}`);
    }
  };

  const handleSearch = async () => {
    setSearchParams({ pageNumber: 1, pageSize, searchQuery });
  };

  const handlePageClick = (event) => {
    const newPage = event.selected + 1;
    setSearchParams({ pageNumber: newPage, pageSize, searchQuery });
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setSearchParams({ pageNumber: 1, pageSize: newSize, searchQuery });
  };

  return (
    <Box m="20px">
      <Header title="REVIEWS" subtitle="List of Reviews" />
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
                placeholder="Search" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }} 
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
                  <TableCell>Review ID</TableCell>
                  <TableCell>Review Text</TableCell>
                  <TableCell>Review Date</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Branch ID</TableCell>
                  <TableCell>User Email</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviewsData.length > 0 ? (
                  reviewsData.map((row) => (
                    <TableRow key={row.reviewId}>
                      <TableCell>{row.reviewId}</TableCell>
                      <TableCell>{row.reviewText}</TableCell>
                      <TableCell>{new Date(row.reviewDate).toLocaleDateString()}</TableCell>
                      <TableCell>{row.rating}</TableCell>
                      <TableCell>{row.branchId}</TableCell>
                      <TableCell>{userEmails[row.id]}</TableCell>
                      <TableCell align="center">
                        <Button 
                          variant="contained" 
                          size="small" 
                          color="secondary"
                          onClick={() => handleEditToggle(row)} 
                          style={{ marginRight: 8 }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="contained" 
                          size="small" 
                          color="error" 
                          onClick={() => handleDelete(row.reviewId)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {rowCount > 0 && (
            <Box display="flex" justifyContent="space-between" alignItems="center" mt="20px">
              <Select value={pageSize} onChange={handlePageSizeChange}>
                {[10, 15, 20].map((size) => (
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
          )}
        </Box>
      )}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
              }}>
          <Typography variant="h6" mb={2}>
            Edit Review
          </Typography>
          <TextField 
            fullWidth 
            variant="outlined" 
            label="Review Text" 
            value={currentReview.reviewText} 
            onChange={(e) => handleFieldChange("reviewText", e.target.value)} 
            margin="normal" 
            error={!!errors.reviewText}
            helperText={errors.reviewText}
          />
          <TextField 
            fullWidth 
            variant="outlined" 
            label="Rating" 
            type="number" 
            value={currentReview.rating} 
            onChange={(e) => handleFieldChange("rating", parseInt(e.target.value))} 
            margin="normal"
            error={!!errors.rating}
            helperText={errors.rating}
          />
          <TextField 
            fullWidth 
            variant="outlined" 
            label="Branch ID" 
            value={currentReview.branchId} 
            onChange={(e) => handleFieldChange("branchId", e.target.value )} 
            margin="normal" 
            disabled
          />
          <TextField 
            fullWidth 
            variant="outlined" 
            label="User ID" 
            value={currentReview.id} 
            onChange={(e) => handleFieldChange("id", e.target.value )} 
            margin="normal" 
            disabled 
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button variant="contained" color="secondary" onClick={() => setOpenEditModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Reviews;
