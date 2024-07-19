import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, TextField, Card, CardContent, CardMedia, Grid, Select, MenuItem } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../theme';
import { fetchNewsDetail, updateNews } from '../../api/newsApi';
import Header from '../../components/Header';
import { storageDb } from '../../firebase';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { v4 } from 'uuid';

const NewsViewDetail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [imageRef, setImageRef] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const getNewsDetail = async () => {
      try {
        const data = await fetchNewsDetail(id);
        setNews(data);
      } catch (err) {
        setError(`Failed to fetch news details: ${err.message}`);
      }
    };
    getNewsDetail();
  }, [id]);

  const handleFieldChange = (field, value) => {
    setNews((prevNews) => ({
      ...prevNews,
      [field]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      if (file.size > 5 * 1024 * 1024) { // Giới hạn 5MB
        console.error('File size exceeds 5MB');
        return;
      }
      setImage(file);
      setImageRef(ref(storageDb, `NewsImages/${v4()}`));
      const previewImage1 = URL.createObjectURL(file);
      setPreviewImage(previewImage1);
    } else {
      console.error('File is not a PNG, JPEG, or JPG image');
    }
  };

  const handleSave = async () => {
    try {
      console.log('News ID:', id); // Thêm log để kiểm tra id
      let imageUrl = news.image; // Giữ URL ảnh cũ
  
      // Nếu có ảnh mới được cung cấp
      if (image && imageRef) {
        // Nếu có ảnh hiện tại, xóa ảnh cũ
        if (news.image) {
          const oldPath = news.image.split('court-callers.appspot.com/o/')[1].split('?')[0];
          const imagebefore = ref(storageDb, decodeURIComponent(oldPath));
          await deleteObject(imagebefore);
          console.log('Deleted old image from storage:', oldPath);
        }
  
        // Tải lên ảnh mới
        const snapshot = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
        console.log('Uploaded new image and got URL:', imageUrl);
  
        // Cập nhật chi tiết tin tức với ảnh mới
        await updateNews(id, {
          newId: news.newId,
          title: news.title,
          content: news.content,
          publicationDate: news.publicationDate,
          status: news.status === 'Active' || news.status === 'Deleted' ? news.status : 'Active',
          isHomepageSlideshow: news.isHomepageSlideshow,
          image: imageUrl,
          imageFile: image
        });
  
        // Cập nhật trạng thái với URL ảnh mới ngay lập tức
        setNews((prevNews) => ({
          ...prevNews,
          image: imageUrl
        }));
      } else {
        // Cập nhật chi tiết tin tức mà không thay đổi ảnh
        await updateNews(id, {
          newId: news.newId,
          title: news.title,
          content: news.content,
          publicationDate: news.publicationDate,
          status: news.status === 'Active' || news.status === 'Deleted' ? news.status : 'Active',
          isHomepageSlideshow: news.isHomepageSlideshow,
          image: imageUrl,
          imageFile: null
        });
      }
  
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
  
      setEditMode(false);
    } catch (err) {
      setError(`Failed to update news details: ${err.message}`);
      console.error('Failed to update news details:', err);
    }
  };
  
  

  const handleEditToggle = () => {
    setEditMode((prevState) => !prevState);
  };

  const handleBack = () => {
    navigate(-1); // Quay lại trang trước
  };

  if (!news) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box m="20px">
      <Header title="NEWS DETAILS" subtitle={`Details for News ID: ${id}`} />
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Button
                variant="contained"
                onClick={handleBack}
                style={{
                  backgroundColor: colors.blueAccent[500],
                  color: colors.primary[900],
                }}
              >
                Back
              </Button>
              <Box>
                <Button
                  variant="contained"
                  onClick={handleEditToggle}
                  style={{
                    backgroundColor: colors.greenAccent[400],
                    color: colors.primary[900],
                    marginRight: 8
                  }}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
                {editMode && (
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    style={{
                      backgroundColor: colors.greenAccent[400],
                      color: colors.primary[900],
                    }}
                  >
                    Save
                  </Button>
                )}
              </Box>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4} display="flex" justifyContent="center" alignItems="center">
                <CardMedia
                  component="img"
                  image={previewImage || news.image}
                  alt="News Image"
                  sx={{ width: 150, height: 150 }}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Box mb={2}>
                  <Typography variant="h6">Title</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={news.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      size="small"
                    />
                  ) : (
                    <Typography>{news.title || 'N/A'}</Typography>
                  )}
                </Box>
                <Box mb={2}>
                  <Typography variant="h6">Content</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      value={news.content || ''}
                      onChange={(e) => handleFieldChange('content', e.target.value)}
                      size="small"
                      multiline
                      rows={4}
                    />
                  ) : (
                    <Typography>{news.content || 'N/A'}</Typography>
                  )}
                </Box>
                <Box mb={2}>
                  <Typography variant="h6">Publication Date</Typography>
                  <Typography>{new Date(news.publicationDate).toLocaleDateString() || 'N/A'}</Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="h6">Status</Typography>
                  {editMode ? (
                    <Select
                      fullWidth
                      value={news.status || 'Active'}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Deleted">Deleted</MenuItem>
                    </Select>
                  ) : (
                    <Typography>{news.status || 'N/A'}</Typography>
                  )}
                </Box>
                <Box mb={2}>
                  <Typography variant="h6">Is Homepage Slideshow</Typography>
                  {editMode ? (
                    <Select
                      fullWidth
                      value={news.isHomepageSlideshow || true}
                      onChange={(e) => handleFieldChange('isHomepageSlideshow', e.target.value)}
                      size="small"
                    >
                      <MenuItem value={true}>True</MenuItem>
                      <MenuItem value={false}>False</MenuItem>
                    </Select>
                  ) : (
                    <Typography>{news.isHomepageSlideshow ? 'Yes' : 'No'}</Typography>
                  )}
                </Box>
                {editMode && (
                  <Box mb={2}>
                    <Typography variant="h6">Image</Typography>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default NewsViewDetail;
