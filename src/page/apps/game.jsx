import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  useMediaQuery,
  Drawer,
  Paper,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import CircleIcon from "@mui/icons-material/Circle";
import { FiHome } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from '../../system/axios.js';
import MobileChat from "./MobileChat.jsx"; 

export default function AtomsClicker() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [createChatOpen, setCreateChatOpen] = useState(false);
  const [newChatUsername, setNewChatUsername] = useState('');
  const [myId, setMyId] = useState(null);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:900px)");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("https://atomglidedev.ru/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setMyId(data._id || data.id);
      } catch (err) {
        console.error("Ошибка получения /auth/me:", err);
      }
    };
    if (token) fetchMe();
  }, [token]);

  useEffect(() => {
    if (token) {
      const newSocket = io('https://atomglidedev.ru', {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      newSocket.on('connect', () => setSocket(newSocket));
      newSocket.on('disconnect', () => setOnlineUsers([]));
      newSocket.on('connect_error', console.error);

      newSocket.on('new_message', (message) => {
        setMessages(prev => {
          const exists = prev.some(msg =>
            msg._id && message._id && msg._id.toString() === message._id.toString()
          );
          return exists ? prev : [...prev, message];
        });
        scrollToBottom();
      });

      newSocket.on('online_users', setOnlineUsers);
      newSocket.on('user_online', (user) => setOnlineUsers(prev => [...prev.filter(u => u.userId !== user.userId), user]));
      newSocket.on('user_offline', (user) => setOnlineUsers(prev => prev.filter(u => u.userId !== user.userId)));

      return () => newSocket.disconnect();
    }
  }, [token]);

  useEffect(() => {
    if (token) loadChats();
  }, [token]);

  useEffect(() => {
    if (currentChat) loadMessages(currentChat._id);
  }, [currentChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const loadChats = async () => {
    try {
      const res = await axios.get('/chats');
      setChats(res.data);
    } catch (e) { console.error(e); }
  };

  const loadMessages = async (chatId) => {
    try {
      const res = await axios.get(`/chats/${chatId}/messages`);
      setMessages(res.data);
    } catch (e) { console.error(e); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChat || !socket) return;
    socket.emit('send_message', { chatId: currentChat._id, content: newMessage.trim() });
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectChat = (chat) => {
    setCurrentChat(chat);
    loadMessages(chat._id);
    if (socket) socket.emit('join_chat', chat._id);
    if (isMobile) setMobileOpen(false);
  };

  const createNewChat = async () => {
    try {
      const username = newChatUsername.startsWith('@') ? newChatUsername : `@${newChatUsername}`;
      const res = await axios.post('/chats/by-username', { username });
      loadChats();
      selectChat(res.data.chat);
      setCreateChatOpen(false);
      setNewChatUsername('');
    } catch (e) {
      alert(e.response?.data?.error || 'Ошибка создания чата');
    }
  };

  const drawer = (
    <Box sx={{ bgcolor: "#121212", mt: 1, height: 'calc(100vh - 15px)', minWidth: 310, color: "#ddd", border: "1px solid #1f1f1f", borderRadius: '15px', mr: 1 }}>
      <Box sx={{ px: 2, py: 2, borderBottom: "1px solid #1f1f1f", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>AtomGlide Sendy (Beta)</Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton onClick={() => navigate('/')} sx={{ color: 'rgb(237,89,26)' }}><FiHome /></IconButton>
          <IconButton onClick={() => setCreateChatOpen(true)} sx={{ color: 'rgb(237,89,26)' }}><AddIcon /></IconButton>
        </Box>
      </Box>

      <List>
        {chats.map((chat, i) => {
          const other = chat.participants?.find(p => p.userId !== myId);
          const isOnline = other ? onlineUsers.some(u => u.userId === other.userId) : false;
          return (
            <React.Fragment key={chat._id || i}>
              <ListItem onClick={() => selectChat(chat)} sx={{ "&:hover": { bgcolor: "#1e1e1e" }, bgcolor: currentChat?._id === chat._id ? "#1e1e1e" : "transparent" }}>
                <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={isOnline ? <CircleIcon sx={{ color: "#4CAF50", fontSize: 12 }} /> : null}>
                  <Avatar alt={other?.fullName || 'User'} src={other?.avatarUrl || ''} sx={{ width: 50, height: 50 }} />
                </Badge>
                <Box sx={{ ml: 1, flex: 1 }}>
                  <ListItemText
                    primary={<Typography sx={{ color: "#eee", fontSize: "15px" }}>{other?.fullName || 'Пользователь'}</Typography>}
                    secondary={<Typography sx={{ color: "#777", fontSize: "0.70rem", ml: 1 }}>{chat.lastMessage?.content || "Нет сообщений"}</Typography>}
                  />
                </Box>
              </ListItem>
              <Divider sx={{ borderColor: "#1f1f1f" }} />
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <MobileChat
        drawer={drawer}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        currentChat={currentChat}
        setCurrentChat={setCurrentChat}
        chats={chats}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        handleKeyPress={handleKeyPress}
        onlineUsers={onlineUsers}
        myId={myId}
        messagesEndRef={messagesEndRef}
        createChatOpen={createChatOpen}
        setCreateChatOpen={setCreateChatOpen}
        newChatUsername={newChatUsername}
        setNewChatUsername={setNewChatUsername}
        createNewChat={createNewChat}
      />
    );
  }
  return (
    <>
      <Box sx={{ display: 'flex',height: 'calc(100vh - 15px)'
, width: '100%', bgcolor: "#000" }}>
        {isMobile ? (
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: 260, bgcolor: "#121212", color: "#fff" } }}>{drawer}</Drawer>
        ) : (
          <Box sx={{ width: 300 }}>{drawer}</Box>
        )}

        <Box sx={{ ml: 2.5, flexGrow: 1, display: "flex", flexDirection: "column", borderRadius: "20px", mt: 1, height: 'calc(100vh - 15px)', border: "1px solid #1f1f1f", bgcolor: "#121212", overflow: "hidden" }}>
          {currentChat && (
            <Box sx={{ borderBottom: "1px solid #1f1f1f", p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {(() => {
                const other = currentChat.participants?.find(p => p.userId !== myId);
                const isOnline = other ? onlineUsers.some(u => u.userId === other.userId) : false;
                return (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar alt={other?.fullName} src={other?.avatarUrl || ''} sx={{ width: 40, height: 40 }} />
                      <Box>
                        <Typography sx={{ fontWeight: 'bold', fontSize: "13px" }}>{other?.fullName}</Typography>
                        <Typography sx={{ color: "#888", fontSize: "10px" }}>{other?.username}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
                      {isOnline && <CircleIcon sx={{ color: "#4CAF50", fontSize: 12 }} />}
                      <Typography sx={{ color: "#666", fontSize: "0.8rem" }}>{isOnline ? 'В сети' : 'Не в сети'}</Typography>
                    </Box>
                  </>
                );
              })()}
            </Box>
          )}

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflowY: "auto", p: 2, gap: 2 }}>
            {currentChat ? messages.map((msg) => {
              const isMine =
                msg.senderId?.toString?.() === myId?.toString?.() ||
                msg.sender?._id?.toString?.() === myId?.toString?.();

              const messageDate = new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
              return (
                <Box key={msg._id} sx={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "80%", mb: 1 }}>
                  {!isMine && (
                    <Typography sx={{ color: "#888", fontSize: "12px", mb: 0.5 }}>
                      {msg.sender?.fullName || msg.sender?.username || "Пользователь"}
                    </Typography>
                  )}
                  <Box sx={{
                    bgcolor: isMine ? "rgb(237,89,26)" : "#1f1f1f",
                    color: "#fff",
                    p: 1.5,
                   
                    borderRadius: isMine ? '15px 15px 0 15px' : '15px 15px 15px 0',
                    position: 'relative'
                  }}>
                    <Typography sx={{ fontSize: "15px", fontSize:"20px",fontFamily:'sf' }}>{msg.content}</Typography>
                    
                  </Box>
                  <Typography sx={{ fontSize: "0.7rem", color: "#ccc", mt: 0.5, textAlign: isMine ? "right" : "left" }}>{messageDate}</Typography>
                </Box>
              );
            }) : (
              <Typography sx={{ textAlign: 'center', color: '#666', mt: 'auto', mb: 'auto' }}>Выберите чат для начала общения</Typography>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Paper component="form" sx={{ display: "flex", alignItems: "center", borderRadius: "12px", p: 1.2, border: "1px solid #1f1f1f", bgcolor: "#181818", mt: 1.5, mb: 1.5 ,ml:1,mr:1 }} onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <TextField variant="outlined" placeholder="Написать сообщение..." size="small" fullWidth value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleKeyPress} disabled={!currentChat}
              sx={{ bgcolor: "transparent", borderRadius: 2, input: { color: "#eee" }, "& .MuiOutlinedInput-notchedOutline": { border: "none" } }} />
            <IconButton type="submit" disabled={!newMessage.trim() || !currentChat} sx={{ color: 'rgb(237,93,25)', ml: 1 }}><SendIcon /></IconButton>
          </Paper>
        </Box>
      </Box>

      <Dialog open={createChatOpen} onClose={() => setCreateChatOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#eee', bgcolor: '#121212' }}>Создать новый чат</DialogTitle>
        <DialogContent sx={{ bgcolor: '#121212' }}>
          <TextField autoFocus margin="dense" label="Никнейм пользователя" placeholder="@durov" fullWidth variant="outlined" value={newChatUsername} onChange={(e) => setNewChatUsername(e.target.value)}
            sx={{ mt: 2, '& .MuiOutlinedInput-root': { color: '#eee', '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: 'rgb(237,89,26)' } } }} />
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#121212', p: 2 }}>
          <Button onClick={() => setCreateChatOpen(false)} sx={{ color: '#999' }}>Отмена</Button>
          <Button onClick={createNewChat} disabled={!newChatUsername.trim()} sx={{ bgcolor: 'rgb(237,89,26)', color: 'white' }}>Создать чат</Button>
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
