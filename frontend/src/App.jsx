import React, { useState, useEffect, useRef } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  CssBaseline,
  Container,
  TextField,
  IconButton,
  Paper,
  Typography,
  Box,
  Skeleton,
  Stack,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [partialMessage, setPartialMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, partialMessage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingPage(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput("");
      setLoading(true);

      try {
        const response = await axios.post(`${backendUrl}/get-respon`, {
          text: input,
        });
        const botMessageWords = response.data.split(" ");
        let currentMessage = "";

        for (let word of botMessageWords) {
          currentMessage += word + " ";
          setPartialMessage(currentMessage.trim());
          await new Promise((resolve) => setTimeout(resolve, 15)); // 15ms delay for each word
        }

        const botMessage = { text: currentMessage.trim(), sender: "bot" };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setPartialMessage("");
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !loading) {
      handleSendMessage();
    }
  };

  return loadingPage ? (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "background.default",
        }}
      >
        <CircularProgress />
      </Container>
    </ThemeProvider>
  ) : (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          paddingTop: 2,
          backgroundColor: "background.default",
        }}
      >
        <Paper
          sx={{
            flexGrow: 1,
            padding: 2,
            overflowY: "auto",
            marginBottom: 2,
            backgroundColor: "background.paper",
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                marginBottom: 1,
                textAlign: message.sender === "user" ? "right" : "left",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  display: "inline-block",
                  backgroundColor:
                    message.sender === "user" ? "#4caf50" : "#424242",
                  color: "white",
                  padding: 1,
                  marginBottom: 2,
                  borderRadius: 1,
                }}
              >
                {message.text}
              </Typography>
            </Box>
          ))}
          {partialMessage ? (
            <Box
              sx={{
                marginBottom: 1,
                textAlign: "left",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  display: "inline-block",
                  backgroundColor: "#424242",
                  color: "white",
                  padding: 1,
                  borderRadius: 1,
                }}
              >
                {partialMessage}
              </Typography>
            </Box>
          ) : (
            loading && (
              <Box
                sx={{
                  marginBottom: 1,
                  textAlign: "left",
                }}
              >
                <Stack spacing={1}>
                  {Array.from(new Array(10)).map((_, index) => (
                    <Skeleton
                      key={index}
                      variant="rectangular"
                      width="100%"
                      height={20}
                      sx={{ backgroundColor: "#424242" }}
                    />
                  ))}
                </Stack>
              </Box>
            )
          )}
          <div ref={messagesEndRef} />
        </Paper>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: 1,
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "background.paper",
          }}
        >
          <TextField
            variant="outlined"
            fullWidth
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            sx={{
              input: { color: "white" },
              ".MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "gray",
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
                },
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={loading}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
