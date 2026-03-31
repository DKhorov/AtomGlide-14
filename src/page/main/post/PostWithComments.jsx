"use client";
import React, { useState, useEffect, memo } from 'react';
import { 
  Box, Paper, Typography, IconButton, Stack, Popover, 
  InputBase, Button, CircularProgress, Avatar
} from '@mui/material';
import { 
  AddReactionOutlined, ChatBubbleOutline, ShareOutlined,
  ContentCopyOutlined, CheckOutlined, CloseOutlined 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

import { selectUser } from '../../../system/redux/slices/getme'; 
import PostHeader from './PostHeader';
import PostText from './PostText';
import PostPhoto from './PostPhoto';

const hideScrollbar = { scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } };
const AVAILABLE_EMOJIS = ['👍', '👎', '🔥', '❤️', '🤯', '😢', '🎀','🍓'];
const CDN_URL = 'https://atomglidedev.ru';

const PostWithComments = memo(({ post, onDelete, onPostUpdate,isFullPost }) => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const userId = user?._id;

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || []);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [previewIndex, setPreviewIndex] = useState(0);
  const [isFading, setIsFading] = useState(true);

  const handleOpenAuthModal = () => setIsAuthModalOpen(true);
  const handleCloseAuthModal = () => setIsAuthModalOpen(false);
  const handleOpenShareModal = () => setIsShareModalOpen(true);
  const handleCloseShareModal = () => setIsShareModalOpen(false);

  const getAvatarUrl = (url) => url ? (url.startsWith('http') ? url : `${CDN_URL}${url}`) : '';
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Недавно';

  const handleToggleComments = async () => {
    if (!userId) { handleOpenAuthModal(); return; }
    if (!isCommentsOpen && comments.length === 0) {
      setIsLoadingComments(true);
      try {
        const { data } = await axios.get(`https://atomglidedev.ru/comment/post/${post._id}`);
        if (data.success) setComments(data.comments.reverse());
      } catch (e) { console.error(e); } finally { setIsLoadingComments(false); }
    }
    setIsCommentsOpen(!isCommentsOpen);
  };

  const handleSendComment = async () => {
    if (!newCommentText.trim()) return;
    setIsSending(true);
    try {
      const token = window.localStorage.getItem('token');
      const { data } = await axios.post(`https://atomglidedev.ru/comment`, 
        { text: newCommentText.trim(), postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success && data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setNewCommentText('');
        if (onPostUpdate) onPostUpdate({ ...post, commentsCount: (post.commentsCount || 0) + 1 });
      }
    } catch (e) { console.error(e); } finally { setIsSending(false); }
  };

  const handleOpenPicker = (event) => setAnchorEl(event.currentTarget);
  const handleClosePicker = () => setAnchorEl(null);

  const toggleReaction = async (emoji) => {
    if (!userId) { handleOpenAuthModal(); return; }
    try {
      const token = window.localStorage.getItem('token');
      const { data } = await axios.post(`https://atomglidedev.ru/posts/${post._id}/reaction`, { emoji }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) setReactions(data.reactions);
    } catch (err) { console.error(err); }
    handleClosePicker();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://atomglide.com/posts/${post._id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    if (comments.length === 0 || isCommentsOpen) return;
    const interval = setInterval(() => {
      setIsFading(false);
      setTimeout(() => {
        setPreviewIndex((prev) => (prev + 1) % Math.min(comments.length, 5));
        setIsFading(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [comments, isCommentsOpen]);

  const goToProfile = (userId) => userId && navigate(`/profile/${userId}`);

  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: '24px', mb: 1, bgcolor: '#1a1b1e', border: '1px solid #2a2a2a' }}>
      <PostHeader post={post} onDelete={onDelete} onPostUpdate={onPostUpdate} onCommentClick={handleToggleComments} />

     <PostPhoto post={post} isFullPost={isFullPost} />
      <PostText postId={post._id}>{post.title || post.text || 'Без текста'}</PostText>

      {/* Панель управления */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={handleOpenPicker} sx={{ bgcolor: '#25262b', borderRadius: '12px', color: '#fff', '&:hover': { bgcolor: '#333' } }}>
            <AddReactionOutlined sx={{ fontSize: 20 }} />
          </IconButton>
          
          {reactions.length > 0 && (
            <Stack direction="row" spacing={0.5}>
              {reactions.map((r) => (
                <Box key={r.emoji} onClick={() => toggleReaction(r.emoji)} sx={{ px: 1.3, py: 0.8, borderRadius: '10px', bgcolor: '#25262b', border: '1px solid #333', cursor: 'pointer', display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.8rem' }}>{r.emoji}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{r.users?.length || 0}</Typography>
                </Box>
              ))}
            </Stack>
          )}

          <Box onClick={handleToggleComments} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.8, borderRadius: '10px', cursor: 'pointer', bgcolor: isCommentsOpen ? '#fff' : '#25262b', color: isCommentsOpen ? '#000' : '#fff', transition: '0.2s' ,ml:3}}>
            <ChatBubbleOutline sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 900 }}>
              {/* Исправленное отображение количества */}
              {post.commentsCount > 0 ? post.commentsCount : comments.length}
            </Typography>
          </Box>
        </Stack>

      </Stack>

      {/* Суфлер */}
      {!isCommentsOpen && comments.length > 0 && (
        <Box sx={{ mt: 2, pl: 1.5, borderLeft: '2px solid #555' }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic', opacity: isFading ? 1 : 0, transition: '0.4s' }}>
            "{comments[previewIndex]?.text}"
          </Typography>
        </Box>
      )}

      {/* Комментарии */}
      {isCommentsOpen && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #2a2a2a' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
            <InputBase fullWidth placeholder="Что ты думаешь про данный пост?" value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} sx={{ bgcolor: '#111', px: 2, py: 0.8, borderRadius: '12px', color: '#fff', border: '1px solid #2a2a2a' }} />
            {/* Исправленная кнопка */}
            <Button 
              onClick={handleSendComment} 
              disabled={!newCommentText.trim() || isSending} 
              sx={{ 
                bgcolor: '#ffffff', 
                color: '#000000', 
                borderRadius: '12px', 
                fontWeight: 900, 
                px: 3,
                '&:hover': { bgcolor: '#e0e0e0' },
                '&.Mui-disabled': { bgcolor: '#555', color: '#888' }
              }}
            >
              {isSending ? <CircularProgress size={20} sx={{ color: '#000' }} /> : 'ОК'}
            </Button>
          </Stack>

          <Stack spacing={2} sx={{ maxHeight: '400px', overflowY: 'auto', ...hideScrollbar }}>
            {isLoadingComments ? <CircularProgress size={24} sx={{ color: '#fff', alignSelf: 'center' }} /> : 
              comments.length === 0 ? <Typography sx={{ color: '#555', textAlign: 'center' }}>Пока нет мнений</Typography> :
              comments.map((c, index) => (
                <Stack key={c._id} direction="row" spacing={1.5}>
                  <Avatar src={getAvatarUrl(c.user?.avatarUrl)} onClick={() => goToProfile(c.user?._id)} sx={{ width: 34, height: 34, border: '1px solid #333', cursor: 'pointer' }} />
                  <Box sx={{ flex: 1, bgcolor: '#25262b', p: 1.5, borderRadius: '16px', border: '1px solid #2a2a2a', position: 'relative' }}>
                    <Typography sx={{ position: 'absolute', top: 12, right: 14, fontSize: '0.75rem', color: '#888', fontWeight: 700 }}>
                      {comments.length - index}
                    </Typography>
                    <Box onClick={() => goToProfile(c.user?._id)} sx={{ cursor: 'pointer', mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>{c.user?.fullName}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '1rem', color: '#ccc', mt: 0.5 }}>{c.text}</Typography>
                  </Box>
                </Stack>
              ))
            }
          </Stack>
        </Box>
      )}

      {/* Поповер, Модалки Share и Auth остаются без изменений...   https://atomglide.com/posts/${post._id}*/}
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClosePicker} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Stack direction="row" spacing={0.5} sx={{ p: 1, bgcolor: '#1a1b1e' }}>
          {AVAILABLE_EMOJIS.map((emoji) => (
            <IconButton key={emoji} onClick={() => toggleReaction(emoji)} sx={{ fontSize: '1.3rem' }}>{emoji}</IconButton>
          ))}
        </Stack>
      </Popover>

      {isShareModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)'
        }} onClick={handleCloseShareModal}>
          <Box sx={{ width: { xs: '90%', sm: 480 }, borderRadius: '24px', p: 3, outline: 'none', bgcolor: '#1a1b1e', border: '1px solid #2a2a2a', boxShadow: 24 }} onClick={(e) => e.stopPropagation()}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Поделиться</Typography>
              <IconButton onClick={handleCloseShareModal} sx={{ color: '#888' }}><CloseOutlined /></IconButton>
            </Stack>
            <Box sx={{ bgcolor: '#25262b00', borderRadius: '16px', p: 2, mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={getAvatarUrl(post.user?.avatarUrl)} sx={{ width: 44, height: 44, border: '1px solid #333' }} />
                <Box sx={{bgcolor:'transparent'}}>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{post.user?.fullName || 'Аноним'}</Typography>
                  <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>{post.user?.username} • {formatDate(post.createdAt)}</Typography>
                </Box>
              </Stack>
            </Box>
            <Box sx={{ bgcolor: '#111', borderRadius: '16px', display: 'flex', alignItems: 'center', p: 0.5, mb: 2, border: '1px solid #2a2a2a' }}>
              <InputBase fullWidth value={`Не доступно в beta`} readOnly sx={{ px: 2, color: '#ccc', fontSize: '0.85rem' }} />
              <Button onClick={handleCopyLink} sx={{ bgcolor: isCopied ? '#4caf50' : '#fff', color: isCopied ? '#fff' : '#000', borderRadius: '12px', px: 2, py: 1, fontWeight: 800, textTransform: 'none', minWidth: '140px' }} startIcon={isCopied ? <CheckOutlined /> : <ContentCopyOutlined />}>
                {isCopied ? 'Скопировано' : 'Копировать'}
              </Button>
            </Box>
            <Box sx={{ bgcolor: '#25262b', borderRadius: '16px', p: 2, border: '1px solid #2a2a2a' }}>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem', mb: 0.5 }}>Про поделиться постом</Typography>
              <Typography sx={{ color: '#888', fontSize: '0.8rem', lineHeight: 1.4 }}>Каждый ваш репост продвигает проект, помогает автору. Подробнее в AtomGlide Fitness или Атом Банк.</Typography>
            </Box>
          </Box>
        </div>
      )}

      {isAuthModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)'
        }} onClick={handleCloseAuthModal}>
          <Box sx={{ width: { xs: '90%', sm: 400 }, borderRadius: '24px', p: 4, textAlign: 'center', bgcolor: '#000', backgroundImage: `url(/PICO1.png), url(/PICO2.png)`, backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }} onClick={(e) => e.stopPropagation()}>
            <Typography sx={{ fontSize: '22px', fontWeight: 800, mb: 1, color: '#fff' }}>Нужен аккаунт</Typography>
            <Typography sx={{ fontSize: '15px', mb: 3, opacity: 0.9, color: '#fff' }}>Войдите, чтобы взаимодействовать с постом.</Typography>
            <Button fullWidth variant="contained" onClick={() => navigate('/login')} sx={{ bgcolor: '#866023ff', borderRadius: '12px', py: 1.5, mb: 1.5, fontWeight: 'bold' }}>Войти</Button>
            <Button fullWidth onClick={handleCloseAuthModal} sx={{ color: '#fff', opacity: 0.7 }}>Позже</Button>
          </Box>
        </div>
      )}
    </Paper>
  );
});

PostWithComments.displayName = 'PostWithComments';
export default PostWithComments;
