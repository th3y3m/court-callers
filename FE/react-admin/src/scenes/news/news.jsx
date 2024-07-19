import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select,
  MenuItem, IconButton, InputBase, Modal, TextField
} from '@mui/material';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { fetchNews, createNews, deleteNews } from '../../api/newsApi';
import SearchIcon from '@mui/icons-material/Search';
import { storageDb } from '../../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 } from 'uuid';

const useQuery = () => new URLSearchParams(useLocation().search);

const News = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const query = useQuery();
  const navigate = useNavigate();

  const [newsData, setNewsData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(parseInt(query.get('pageNumber')) - 1 || 0);
  const [pageSize, setPageSize] = useState(parseInt(query.get('pageSize')) || 10);
  const [searchQuery, setSearchQuery] = useState(query.get('searchQuery') || "");
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('Active');
  const [isHomepageSlideshow, setIsHomepageSlideshow] = useState(true);
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const getNewsData = async () => {
      try {
        const data = await fetchNews(page + 1, pageSize, searchQuery);
        setNewsData(data.items);
        setRowCount(data.totalCount);
      } catch (err) {
        console.error('Failed to fetch news data', err);
      }
    };
    getNewsData();
  }, [page, pageSize, searchQuery]);

  const handlePageClick = useCallback((event) => {
    const newPage = event.selected;
    setPage(newPage);
    navigate(`/admin/News?pageNumber=${newPage + 1}&pageSize=${pageSize}&searchQuery=${searchQuery}`);
  }, [navigate, pageSize, searchQuery]);

  const handlePageSizeChange = useCallback((event) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0);
    navigate(`/admin/News?pageNumber=1&pageSize=${newSize}&searchQuery=${searchQuery}`);
  }, [navigate, searchQuery]);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setPage(0);
    navigate(`/admin/News?pageNumber=1&pageSize=${pageSize}&searchQuery=${searchQuery}`);
  }, [navigate, pageSize, searchQuery]);

  const handleViewDetail = (news) => {
    navigate(`/admin/NewsViewDetail/${news.newId}`);
  };

  const handleDelete = async (newsId) => {
    try {
      await deleteNews(newsId);
      const data = await fetchNews(page + 1, pageSize, searchQuery);
      setNewsData(data.items);
      setRowCount(data.totalCount);
    } catch (error) {
      console.error('Failed to delete news:', error);
      alert('Failed to delete news. Please try again.');
    }
  };

  const handleCreateOpen = () => {
    setOpenModal(true);
  };

  const handleCreateClose = () => {
    setOpenModal(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      const previewImage1 = URL.createObjectURL(file);
      setPreviewImage(previewImage1);
    }
  };

  const handleCreateSubmit = async () => {
    if (!title || !content || !image) {
      alert('Please fill in all fields and select an image.');
      return;
    }

    try {
      const imageRef = ref(storageDb, `NewsImages/${v4()}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      const newsData = {
        title,
        content,
        image: image,
        imageUrl: imageUrl, // thêm URL của hình ảnh
        status,
        isHomepageSlideshow
      };

      console.log('Submitting news data:', newsData);

      await createNews(newsData);
      setOpenModal(false);
      setTitle('');
      setContent('');
      setStatus('Active');
      setIsHomepageSlideshow(true);
      setImage(null);
      setPreviewImage(null);

      const data = await fetchNews(page + 1, pageSize, searchQuery);
      setNewsData(data.items);
      setRowCount(data.totalCount);
    } catch (error) {
      console.error('Error creating news:', error);
      alert('Failed to create news. Please try again.');
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h4" mb="20px">News</Typography>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
          <InputBase
            sx={{ ml: 2, flex: 1 }}
            placeholder="Search by Title"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit() }}
          />
          <IconButton type="button" sx={{ p: 1 }} onClick={handleSearchSubmit}>
            <SearchIcon />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateOpen}
          style={{ marginLeft: 8 }}
        >
          Create
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
              <TableCell>News ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Publication Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {newsData.length > 0 ? (
              newsData.map((news) => (
                <TableRow key={news.newId}>
                  <TableCell>{news.newId}</TableCell>
                  <TableCell>{news.title}</TableCell>
                  <TableCell>{news.content}</TableCell>
                  <TableCell>{new Date(news.publicationDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleViewDetail(news)}
                    >
                      View Detail
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleDelete(news.newId)}
                      style={{ marginLeft: 8 }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
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
          margin="dense"
        >
          {[10, 15, 20, 25, 50].map(size => (
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
      <Modal open={openModal} onClose={handleCreateClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb={2}>Create News</Typography>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <Typography variant="h6" m={1}>Status</Typography>
          <Select
            fullWidth
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            margin="dense"
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Deleted">Deleted</MenuItem>
          </Select>
          <Typography variant="h6" m={1}>Homepage Slideshow</Typography>
          <Select
            fullWidth
            value={isHomepageSlideshow}
            onChange={(e) => setIsHomepageSlideshow(e.target.value === 'true')}
            margin="dense"
          >
            <MenuItem value={true}>True</MenuItem>
            <MenuItem value={false}>False</MenuItem>
          </Select>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginTop: 16 }}
          />
          {previewImage && (
            <Box mt={2} display="flex" justifyContent="center">
              <img src={previewImage} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
            </Box>
          )}
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button variant="contained" onClick={handleCreateClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleCreateSubmit}>
              Create
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default News;
