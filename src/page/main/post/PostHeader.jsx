import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Avatar, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText
} from '@mui/material';
import { 
  FiMoreHorizontal, 
  FiTrash2,
  FiCopy
} from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import axios from '../../../system/axios';
import { ReactComponent as StoreIcon } from './14.svg';

const PostHeaderAcc = ({ 
  post = {
    _id: null,
    user: {},
    likes: { count: 0, users: [] },
    dislikes: { count: 0, users: [] },
    commentsCount: 0,
    createdAt: new Date().toISOString()
  }, 
  onDelete = () => {},
  onPostUpdate = () => {}
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const safePost = {
    ...post,
    user: post.user || {},
  };

  const user = safePost.user;
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const { data } = await axios.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUserId(data._id);
      } catch (e) {
        console.error("Ошибка проверки юзера", e);
      }
    };
    fetchMe();
  }, []);

  const isAuthor = user._id === currentUserId;

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Логика копирования ссылки
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${safePost._id}`);
    handleMenuClose();
  };

  // Логика удаления
  const handleDelete = async () => {
    handleMenuClose();
    try {
      const token = localStorage.getItem('token');
      if (!token || !safePost._id) return;
      
      await axios.delete(`posts/${safePost._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onDelete(safePost._id);
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };


  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); 
    if (diff < 60) return "только что";
    if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
    return `${Math.floor(diff / 86400)} дн. назад`;
  };

  const VerifiedBadgeSVG = ({ size = 16 }) => (
    <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 3 }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width={size} height={size}>
        <polygon fill="#42a5f5" points="29.62,3 33.053,8.308 39.367,8.624 39.686,14.937 44.997,18.367 42.116,23.995 45,29.62 39.692,33.053 39.376,39.367 33.063,39.686 29.633,44.997 24.005,42.116 18.38,45 14.947,39.692 8.633,39.376 8.314,33.063 3.003,29.633 5.884,24.005 3,18.38 8.308,14.947 8.624,8.633 14.937,8.314 18.367,3.003 23.995,5.884"/>
        <polygon fill="#fff" points="21.396,31.255 14.899,24.76 17.021,22.639 21.428,27.046 30.996,17.772 33.084,19.926"/>
      </svg>
    </span>
  );

  const AdminBadgeSVG = ({ size = 16 }) => (
    <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 3 }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="url(#paint0_linear)"/>
        <line x1="18" y1="7" x2="18" y2="19" stroke="#FFCC00" strokeWidth="2"/>
        <line x1="23" y1="21" x2="23" y2="33" stroke="#FFE100" strokeWidth="2"/>
        <defs>
          <linearGradient id="paint0_linear" x1="26" y1="1.5" x2="10" y2="37.5">
            <stop stopColor="#F6A800"/><stop offset="1" stopColor="#CC9910"/>
          </linearGradient>
        </defs>
      </svg>
    </span>
  );

const AtomProPlusBadgeSVG = ({ size = 16 }) => (
  <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 3 }}>
    <StoreIcon style={{ width: size, height: size }} />
  </span>
);

  const StatusBadge = ({ user }) => {
    if (!user) return null;
    const hasAtomProPlus = user.atomProPlus?.isActive && (!user.atomProPlus?.expiresAt || new Date(user.atomProPlus.expiresAt) > new Date());
    return (
      <>
        {user.accountType === 'admin' && <><VerifiedBadgeSVG /><AdminBadgeSVG /></>}
        {(user.accountType === 'verified_user' || user.verified === 'verified') && user.accountType !== 'admin' && <VerifiedBadgeSVG />}
        {hasAtomProPlus && <AtomProPlusBadgeSVG />}
      </>
    );
  };

  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return undefined;
    if (user.avatarUrl.startsWith('http')) return user.avatarUrl;
    return `https://atomglidedev.ru${user.avatarUrl}`;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, ml: 1, mt: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Avatar
          src={getAvatarUrl()}
          sx={{ width: 45, height: 45, mr: 1, cursor: 'pointer', backgroundColor: 'rgb(78, 78, 78)', border: 'solid rgba(86, 86, 86, 1px)' }}
          onClick={() => user._id && navigate(`/account/${user._id}`)}
        >
          {!getAvatarUrl() && (user.fullName?.[0]?.toUpperCase() || '?')}
        </Avatar>

        <Box sx={{ ml: 0.2 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontSize: '15px', fontWeight: '700', color: 'rgba(218, 218, 218, 1)', cursor: 'pointer', fontFamily: 'sf' }}
            onClick={() => user._id && navigate(`/account/${user._id}`)}
          >
            {user.fullName || 'Аноним'}
            <StatusBadge user={user} />
          </Typography>
          <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
            {user.username} • {formatTimeAgo(safePost.createdAt)}
          </Typography>
        </Box>
      </Box>

      {/* Меню с тремя точками теперь доступно всем */}
      <Box>
        <IconButton onClick={handleMenuOpen} sx={{ color: 'rgba(218, 218, 218, 0.7)' }}>
          <FiMoreHorizontal />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white' } }}
        >
          {/* Пункт копирования ссылки доступен всем */}
          <MenuItem onClick={handleCopyLink} sx={{ color: '#fff' }}>
            <ListItemIcon><FiCopy size={18} color="#fff" /></ListItemIcon>
            <ListItemText primary="Скопировать ссылку" />
          </MenuItem>

          {/* Пункт удаления поста доступен только автору */}
          {isAuthor && (
            <MenuItem onClick={handleDelete} sx={{ color: '#ff4444' }}>
              <ListItemIcon><FiTrash2 size={18} color="#ff4444" /></ListItemIcon>
              <ListItemText primary="Удалить пост" />
            </MenuItem>
          )}
        </Menu>
      </Box>
    </Box>
  );
};

export default PostHeaderAcc;