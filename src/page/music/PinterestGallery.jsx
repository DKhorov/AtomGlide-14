import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Typography, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import Masonry from 'react-masonry-css';
import axios from '../../system/axios';
import './PinterestGrid.css';

const POSTS_LIMIT = 50; 
const MIN_MEDIA_ON_SCREEN = 15; // Минимальное кол-во фото, которое мы хотим видеть сразу

const PinterestGallery = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Исправляем isMobile через MUI Theme
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const breakpointColumnsObj = {
    default: 5,
    1600: 4,
    1200: 3,
    800: 2,
    500: 2 // На мобилках 2 колонки выглядят лучше
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://atomglidedev.ru${url.startsWith('/') ? url : `/${url}`}`;
  };

  const fetchMediaPosts = useCallback(async (pageNum) => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/posts', {
        params: { page: pageNum, limit: POSTS_LIMIT },
      });

      const { posts: fetchedPosts } = response.data;

      if (!fetchedPosts || fetchedPosts.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Оставляем только посты с картинками или видео
      const mediaOnly = fetchedPosts.filter(post => post.imageUrl || post.videoUrl);

      setPosts(prev => {
        const combined = [...prev, ...mediaOnly];
        // Убираем дубликаты
        return combined.filter((v, i, a) => a.findIndex(t => t._id === v._id) === i);
      });

      // РЕКУРСИВНАЯ ДОГРУЗКА:
      // Если отфильтрованных фото слишком мало, а на сервере еще есть посты — грузим следующую страницу не дожидаясь скролла
      if (mediaOnly.length < 5 && fetchedPosts.length === POSTS_LIMIT) {
        setPage(prev => prev + 1);
      }

      if (fetchedPosts.length < POSTS_LIMIT) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Ошибка загрузки галереи:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  // Следим за изменением страницы
  useEffect(() => {
    fetchMediaPosts(page);
  }, [page]);

  // Бесконечный скролл
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Если дошли почти до конца (300px до края)
    if (scrollHeight - scrollTop <= clientHeight + 300 && !loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <Box 
      onScroll={handleScroll}
      sx={{
        width: '700px',
        height: '100vh',
        overflowY: 'auto',
        px: isMobile ? 1 : 2,
        pb: 10
      }}
    >
      <Typography variant="h4" sx={{ 
        mb: 3, mt: 2, fontWeight: 800, color: 'white', ml: 1, 
        fontFamily: 'sf', fontSize: isMobile ? '24px' : '32px' 
      }}>
        Галерея
      </Typography>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {posts.map((post) => (
          <Box key={post._id} className="pin-card" sx={{ mb: 2, position: 'relative' }}>
            {post.videoUrl ? (
              <video 
                src={getFullUrl(post.videoUrl)} 
                muted loop playsInline
                onMouseOver={(e) => e.target.play()}
                onMouseOut={(e) => e.target.pause()}
                style={{ width: '100%', display: 'block', borderRadius: '16px' }}
              />
            ) : (
              <img 
                src={getFullUrl(post.imageUrl)} 
                alt=""
                style={{ width: '100%', display: 'block', borderRadius: '16px' }} 
                loading="lazy"
              />
            )}
            
            {post.title && (
              <Box className="pin-overlay">
                <Typography sx={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>
                  {post.title}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Masonry>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress sx={{ color: '#866023ff' }} />
        </Box>
      )}
    </Box>
  );
};

export default PinterestGallery;