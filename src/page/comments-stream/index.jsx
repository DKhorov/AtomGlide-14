import React, { useEffect, useState, useMemo } from 'react';
import { Box, Avatar, Typography, CircularProgress, Divider, Button, useMediaQuery } from '@mui/material';
import axios from '../../system/axios';
import { useNavigate } from 'react-router-dom';

const CommentCard = ({ comment }) => {
  const navigate = useNavigate();
  const user = comment.user || {};
  const post = comment.postId || {};
  const isMobile = useMediaQuery('(max-width:900px)');

  const avatarUrl = useMemo(() => {
    if (!user?.avatarUrl) return undefined;
    if (user.avatarUrl.startsWith('http')) return user.avatarUrl;
    if (user.avatarUrl.startsWith('/')) return `https://atomglidedev.ru${user.avatarUrl}`;
    return undefined;
  }, [user]);

  const createdAt = useMemo(() => {
    try {
      const date = new Date(comment.createdAt);
      return date.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  }, [comment.createdAt]);

  return (
    <Box sx={{
      border: '1px solid rgba(209,209,209,0.1)',
      borderRadius: 2,
      p: 1.5,
      backgroundColor: 'rgba(23, 23, 23, 0.68)'
    }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Avatar
          src={avatarUrl}
          sx={{ width: 32, height: 32, bgcolor: avatarUrl ? 'transparent' : 'rgba(209,209,209,0.2)', cursor: 'pointer' }}
          onClick={() => user?._id && navigate(`/account/${user._id}`)}
        >
          {!avatarUrl && (user.fullName?.[0]?.toUpperCase() || '?')}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(209,209,209,1)', cursor: 'pointer' }}
                onClick={() => user?._id && navigate(`/account/${user._id}`)}
              >
                {user.fullName || 'Аноним'}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '10px', color: 'rgba(155,155,155,0.8)', ml: 0.5 }}>
                {user.username || 'user'}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ fontSize: '10px', color: 'rgba(155,155,155,0.7)' }}>
              {createdAt}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: 'rgba(209,209,209,0.9)', mt: 0.5, whiteSpace: 'pre-wrap' }}>
            {comment.text}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Button size="small" variant="text" sx={{ color: 'rgba(209,209,209,0.8)' }} onClick={() => post?._id && navigate(`/post/${post._id}`)}>
              К посту
            </Button>
            {comment.parentComment && (
              <Typography variant="caption" sx={{ color: 'rgba(155,155,155,0.8)' }}>
                Это ответ
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const CommentsStreamPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:900px)');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/comment');
      const list = Array.isArray(data?.comments) ? data.comments : [];
      setItems(list);
    } catch (e) {
      setError('Не удалось загрузить поток комментариев');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Box sx={{
        width: isMobile ? '100vw' : '550px',
        maxWidth: isMobile ? '100vw' : '550px',
        minWidth: isMobile ? '0' : '200px',
        height: isMobile ? '100vh' : '100vh',
        flex: isMobile ? 1 : 'none',
        overflowY: 'auto',
      
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none', 
        '&::-webkit-scrollbar': {
          width: '0px', 
          background: 'transparent',
        },
        paddingBottom: isMobile ? '70px' : 0, 
        pl: 0, 
                pr: 0, 

        pt: isMobile ? 1 : 0,
        mt: isMobile ? 0 : 0, 
      }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 0.8 }}>Поток комментариев</Typography>
      <Divider sx={{ borderColor: 'rgba(209,209,209,0.1)', mb: 2 }} />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!loading && error && (
        <Typography sx={{ color: 'salmon', mb: 2 }}>{error}</Typography>
      )}

      {!loading && !error && items.length === 0 && (
        <Typography sx={{ color: 'rgba(209,209,209,0.7)' }}>Пока нет комментариев</Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {items.map((c) => (
          <CommentCard key={c._id} comment={c} />
        ))}
      </Box>
    </Box>
  );
};

export default CommentsStreamPage;
/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
