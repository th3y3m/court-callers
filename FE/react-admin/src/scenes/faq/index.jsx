import React, { useState } from 'react';
import { Box, useTheme, TextField, Button } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [comments, setComments] = useState({
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  });

  const handleCommentChange = (id, value) => {
    setComments(prevComments => ({
      ...prevComments,
      [id]: value,
    }));
  };

  const handleSendComment = (id) => {
    // Xử lý logic gửi comment ở đây
    console.log(`Comment for ${id}:`, comments[id]);
    setComments(prevComments => ({
      ...prevComments,
      [id]: '',
    }));
  };

  return (
    <Box m="20px">
      <Header title="FAQ" subtitle="Frequently Asked Questions Page" />

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Username 1
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lovely Court
          </Typography>
          <Box display="flex" alignItems="center" mt={2}>
            <TextField
              label="Reply box"
              variant="outlined"
              fullWidth
              value={comments[1]}
              onChange={(e) => handleCommentChange(1, e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSendComment(1)}
            >
              Send
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Username 2
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            I really like it
          </Typography>
          <Box display="flex" alignItems="center" mt={2}>
            <TextField
              label="Reply box"
              variant="outlined"
              fullWidth
              value={comments[2]}
              onChange={(e) => handleCommentChange(2, e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSendComment(2)}
            >
              Send
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Username 3
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            This will be my favorite website
          </Typography>
          <Box display="flex" alignItems="center" mt={2}>
            <TextField
              label="Reply box"
              variant="outlined"
              fullWidth
              value={comments[3]}
              onChange={(e) => handleCommentChange(3, e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSendComment(3)}
            >
              Send
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Username 4
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Good
          </Typography>
          <Box display="flex" alignItems="center" mt={2}>
            <TextField
              label="Reply box"
              variant="outlined"
              fullWidth
              value={comments[4]}
              onChange={(e) => handleCommentChange(4, e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSendComment(4)}
            >
              Send
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Jack 5tr
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            hahahahaha
          </Typography>
          <Box display="flex" alignItems="center" mt={2}>
            <TextField
              label="Reply box"
              variant="outlined"
              fullWidth
              value={comments[5]}
              onChange={(e) => handleCommentChange(5, e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSendComment(5)}
            >
              Send
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default FAQ;
