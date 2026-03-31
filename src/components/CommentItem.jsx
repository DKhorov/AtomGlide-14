import React, { useState, memo, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse
} from '@mui/material';
import { 
  FiMessageCircle, 
  FiTrash2, 
  FiMoreHorizontal,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import CommentForm from './CommentForm';
import ReplyItem from './ReplyItem';
const CommentItem = memo(({ comment, postAuthorId, onDelete, onAddReply }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const isAuthor = comment?.user?._id === userId;
  const isPostAuthor = postAuthorId === userId;
  const open = Boolean(anchorEl);
  const getAvatarUrl = () => {
    if (!comment.user?.avatarUrl) return undefined;
    if (comment.user.avatarUrl.startsWith('http')) return comment.user.avatarUrl;
    if (comment.user.avatarUrl.startsWith('/')) return `https://atomglidedev.ru${comment.user.avatarUrl}`;
    return undefined;
  };  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'только что';
    if (diffInHours < 24) return `${diffInHours}ч назад`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}д назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  const StatusBadge = ({ user }) => {
    if (user.isVerified) {
      return (
        <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 3 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width={12} height={12}>
            <polygon fill="#42a5f5" points="29.62,3 33.053,8.308 39.367,8.624 39.686,14.937 44.997,18.367 42.116,23.995 45,29.62 39.692,33.053 39.376,39.367 33.063,39.686 29.633,44.997 24.005,42.116 18.38,45 14.947,39.692 8.633,39.376 8.314,33.063 3.003,29.633 5.884,24.005 3,18.38 8.308,14.947 8.624,8.633 14.937,8.314 18.367,3.003 23.995,5.884"/>
            <polygon fill="#fff" points="21.396,31.255 14.899,24.76 17.021,22.639 21.428,27.046 30.996,17.772 33.084,19.926"/>
          </svg>
        </span>
      );
    }
    if (user.isAdmin) {
      return (
        <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 3 }}>
          <svg width={12} height={12} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="url(#paint0_linear_25_31)"/>
            <line x1="18" y1="7" x2="18" y2="19" stroke="#FFCC00" strokeWidth="2"/>
            <line x1="23" y1="21" x2="23" y2="33" stroke="#FFE100" strokeWidth="2"/>
            <line x1="34" y1="18" x2="22" y2="18" stroke="#FFCC00" strokeWidth="2"/>
            <line x1="19" y1="22" x2="7" y2="22" stroke="#FFCC00" strokeWidth="2"/>
            <defs>
              <linearGradient id="paint0_linear_25_31" x1="26" y1="1.5" x2="10" y2="37.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F6A800"/>
                <stop offset="1" stopColor="#CC9910"/>
              </linearGradient>
            </defs>
          </svg>
        </span>
      );
    }
    
    return null;
  };
  const handleMenuClose = () => setAnchorEl(null);
  const handleDelete = () => {
    onDelete(comment._id);
    handleMenuClose();
  };
  const handleAddReply = async (text) => {
    const result = await onAddReply(comment._id, text);
    if (result.success) {
      setShowReplyForm(false);
      setReplies(prev => [...prev, result.comment]);
    }
    return result;
  };
  const handleReplyDelete = (replyId) => {
    setReplies(prev => prev.filter(reply => reply._id !== replyId));
  };
  return (
    <Box sx={{ 
      border: '1px solid rgba(209, 209, 209, 0.1)',
      borderRadius: 2,
      p: 1.5,
      backgroundColor: 'rgba(38, 38, 38, 1)'
    }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Avatar
          src={getAvatarUrl()}
          sx={{
            width: 32,
            height: 32,
            fontSize: '12px',
            bgcolor: getAvatarUrl() ? 'transparent' : 'rgba(209, 209, 209, 0.2)',
            cursor: 'pointer'
          }}
          onClick={() => comment?.user?._id && navigate(`/account/${comment.user._id}`)}
        >
          {!getAvatarUrl() && (comment.user.fullName?.[0]?.toUpperCase() || '?')}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'rgba(209, 209, 209, 1)',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={() => comment?.user?._id && navigate(`/account/${comment.user._id}`)}
              >
                {comment?.user?.fullName || 'Аноним'}
                <StatusBadge user={comment?.user} />
              </Typography>
              <Typography
                variant="caption"
                sx={{ 
                  fontSize: '10px', 
                  color: 'rgba(155, 155, 155, 1)',
                  ml: 0.5
                }}
              >
                {comment?.user?.username || 'user'}
              </Typography>
              <Typography
                variant="caption"
                sx={{ 
                  fontSize: '10px', 
                  color: 'rgba(155, 155, 155, 0.7)',
                  ml: 1
                }}
              >
                {formatDate(comment.createdAt)}
              </Typography>
            </Box>
            {(isAuthor || isPostAuthor) && (
              <>
                <IconButton
                  size="small"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ 
                    padding: '2px',
                    color: 'rgba(209, 209, 209, 0.6)',
                    '&:hover': { backgroundColor: 'rgba(209, 209, 209, 0.1)' }
                  }}
                >
                  <FiMoreHorizontal size={12} />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      background: 'rgb(227, 227, 227)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                    }
                  }}
                >
                  <MenuItem onClick={handleDelete}>
                    <ListItemIcon><FiTrash2 size={14} /></ListItemIcon>
                    <ListItemText>Удалить комментарий</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(209, 209, 209, 0.9)',
              lineHeight: 1.4,
              wordBreak: 'break-word'
            }}
          >
            {comment.text}
          </Typography>

        </Box>
      </Box>

      <Collapse in={showReplyForm}>
        <Box sx={{ mt: 1, ml: 4 }}>
          <CommentForm
            onSubmit={handleAddReply}
            onCancel={() => setShowReplyForm(false)}
            placeholder="Написать ответ..."
            size="small"
          />
        </Box>
      </Collapse>
      {replies.length > 0 && (
        <Collapse in={showReplies}>
          <Box sx={{ mt: 1, ml: 4 }}>
            <Divider sx={{ mb: 1, borderColor: 'rgba(209, 209, 209, 0.1)' }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {replies.map((reply) => (
                <ReplyItem
                  key={reply._id}
                  reply={reply}
                  postAuthorId={postAuthorId}
                  onDelete={handleReplyDelete}
                />
              ))}
            </Box>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.comment._id === nextProps.comment._id &&
    prevProps.comment.text === nextProps.comment.text &&
    prevProps.comment.replies?.length === nextProps.comment.replies?.length &&
    prevProps.postAuthorId === nextProps.postAuthorId
  );
});

CommentItem.displayName = 'CommentItem';

export default CommentItem;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
