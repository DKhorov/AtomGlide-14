import React, { useEffect } from "react";
import {
  Box,
  Drawer,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  AppBar,
  Toolbar
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SendIcon from "@mui/icons-material/Send";

export default function MobileChat({
  drawer,
  mobileOpen,
  setMobileOpen,
  currentChat,
  messages = [],
  newMessage,
  setNewMessage,
  sendMessage,
  handleKeyPress,
  onlineUsers = [],
  myId,
  messagesEndRef,
  createChatOpen,
  setCreateChatOpen,
  newChatUsername,
  setNewChatUsername,
  createNewChat,
}) {
  useEffect(() => {
    if (!currentChat) setMobileOpen(true);
  }, [currentChat, setMobileOpen]);

  const other = currentChat?.participants?.find(p => p.userId !== myId);
  const isOnline = other && onlineUsers.some(u => u.userId === other.userId);

  return (
    <>
      <Box
        sx={{
          height: "100dvh", 
          display: "flex",
          flexDirection: "column",
          bgcolor: "#000",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <Drawer
          variant="temporary"
          open={Boolean(mobileOpen) || !currentChat}
          onClose={() => setMobileOpen(false)}
          PaperProps={{
            sx: {
              width: 300,
              bgcolor: "#121212",
              color: "#fff",
              borderTopLeftRadius: "12px",
              borderBottomLeftRadius: "12px",
              paddingBottom: "env(safe-area-inset-bottom)",
            },
          }}
        >
          {drawer}
        </Drawer>

        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "#121212",
            borderBottom: "1px solid #1f1f1f",
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          <Toolbar variant="dense" sx={{ minHeight: 56 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ color: "#fff", mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            {currentChat ? (
              <>
                <Avatar
                  src={other?.avatarUrl || ""}
                  alt={other?.fullName || "Пользователь"}
                  sx={{ width: 36, height: 36, mr: 1 }}
                />
                <Box sx={{ flex: 1, overflow: "hidden" }}>
                  <Typography
                    noWrap
                    sx={{ fontWeight: 600, fontSize: 15, color: "#fff" }}
                  >
                    {other?.fullName || other?.username || "Чат"}
                  </Typography>
                  <Typography
                    noWrap
                    sx={{ fontSize: 12, color: "#999" }}
                  >
                    {isOnline ? "В сети" : "Не в сети"}
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography sx={{ color: "#ccc", fontSize: 16 }}>
                AtomGlide Sendy
              </Typography>
            )}
          </Toolbar>
        </AppBar>

        {currentChat ? (
          <>
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2,
                pb: "calc(70px + env(safe-area-inset-bottom))", 
                display: "flex",
                flexDirection: "column",
                gap: 1.2,
                bgcolor: "#121212",
              }}
            >
              {messages.map((msg) => {
                const isMine =
                  msg.senderId?.toString?.() === myId?.toString?.() ||
                  msg.sender?._id?.toString?.() === myId?.toString?.();

                return (
                  <Box
                    key={msg._id}
                    sx={{
                      alignSelf: isMine ? "flex-end" : "flex-start",
                      maxWidth: "80%",
                    }}
                  >
                    {!isMine && (
                      <Typography
                        sx={{ color: "#888", fontSize: 12, mb: 0.5 }}
                      >
                        {msg.sender?.fullName || msg.sender?.username}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        bgcolor: isMine ? "rgb(237,89,26)" : "#1f1f1f",
                        color: "#fff",
                        p: 1.2,
                        borderRadius: isMine
                          ? "14px 14px 2px 14px"
                          : "14px 14px 14px 2px",
                        fontSize: 15,
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#aaa",
                        mt: 0.5,
                        textAlign: isMine ? "right" : "left",
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            <Paper
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1,
                px: 1.5,
                bgcolor: "#0f0f0f",
                borderTop: "1px solid #1f1f1f",
                borderBottomLeftRadius: "env(safe-area-inset-bottom)",
                pb: "calc(8px + env(safe-area-inset-bottom))",
              }}
            >
              <TextField
                variant="standard"
                fullWidth
                placeholder="Сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    color: "#eee",
                    fontSize: 15,
                    px: 1,
                  },
                }}
                sx={{
                  bgcolor: "#1a1a1a",
                  borderRadius: 2,
                  p: "6px 10px",
                  mr: 1,
                }}
              />
              <IconButton
                type="submit"
                disabled={!newMessage.trim()}
                sx={{
                  bgcolor: newMessage.trim()
                    ? "rgb(237,89,26)"
                    : "transparent",
                  color: "#fff",
                }}
              >
                <SendIcon />
              </IconButton>
            </Paper>
          </>
        ) : (
          <Box sx={{ flex: 1, bgcolor: "#121212" }} />
        )}
      </Box>

      <Dialog
        open={createChatOpen}
        onClose={() => setCreateChatOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { bgcolor: "#121212", color: "#fff" },
        }}
      >
        <DialogTitle>Создать новый чат</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Никнейм пользователя"
            placeholder="@username"
            value={newChatUsername}
            onChange={(e) => setNewChatUsername(e.target.value)}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                color: "#eee",
                "& fieldset": { borderColor: "#333" },
                "&:hover fieldset": { borderColor: "rgb(237,89,26)" },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateChatOpen(false)} sx={{ color: "#999" }}>
            Отмена
          </Button>
          <Button
            onClick={createNewChat}
            disabled={!newChatUsername.trim()}
            sx={{ bgcolor: "rgb(237,89,26)", color: "white" }}
          >
            Создать чат
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
