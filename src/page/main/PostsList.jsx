import { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Box, Button, CircularProgress, Typography, Paper, Avatar } from '@mui/material';
import PostWithComments from './post/PostWithComments';
import PostSkeleton from './post/PostSkeleton';

const JournalItemCard = ({ journal }) => {
  const authorName = typeof journal.author === 'object' ? (journal.author.fullName || journal.author.username || 'Автор') : (journal.author || 'Автор');
  const avatar = typeof journal.author === 'object' && journal.author.avatarUrl 
    ? (journal.author.avatarUrl.startsWith('http') ? journal.author.avatarUrl : `https://atomglidedev.ru${journal.author.avatarUrl}`) 
    : '';

  return (
    <Paper 
      elevation={0} 
      onClick={() => window.location.href = `/journal/${journal._id}`} 
      sx={{ 
        p: 2.5, mb: 1, 
        borderRadius: '24px', 
        bgcolor: 'rgba(255,255,255,0.03)', 
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)', 
        cursor: 'pointer', 
        transition: 'transform 0.2s',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', transform: 'translateY(-2px)' } 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Avatar src={avatar} sx={{ width: 28, height: 28 }}>{authorName?.[0] || 'A'}</Avatar>
        <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{authorName}</Typography>
        <Typography sx={{ ml: 'auto', fontSize: '0.75rem', color: '#000000', fontWeight: 700, bgcolor: 'rgba(255, 255, 255, 0.48)', px: 1.5, py: 0.5, borderRadius: '100px' }}>
          Journal
        </Typography>
      </Box>
      <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '1.2rem', mb: 1, lineHeight: 1.3 }}>
        {journal.title}
      </Typography>
      <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
        {journal.topic || 'Без темы'}
      </Typography>
    </Paper>
  );
};

const PostsList = memo(({ 
  posts = [], 
  journals = [],
  activeFilter = 'Все',
  loading, 
  onDelete, 
  onPostUpdate, 
  onLoadMore, 
  hasMore, 
  onRefresh 
}) => {
  const [pullOffset, setPullOffset] = useState(0); 
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  // ФИКС 1: Убираем дубликаты через Map по _id
  const visibleItems = useMemo(() => {
    const uniquePosts = Array.from(new Map((posts || []).map(p => [p._id, p])).values());
    const uniqueJournals = Array.from(new Map((journals || []).map(j => [j._id, j])).values());

    const pItems = uniquePosts.map(p => ({ 
      ...p, 
      _type: 'post',
      _sortDate: new Date(p.createdAt || 0).getTime() 
    }));
    
    const jItems = uniqueJournals.map(j => ({ 
      ...j, 
      _type: 'journal',
      _sortDate: new Date(j.createdAt || j.updatedAt || 0).getTime() 
    }));

    if (activeFilter === 'Посты') return pItems;
    if (activeFilter === 'Статьи') return jItems;
    
    return [...pItems, ...jItems].sort((a, b) => b._sortDate - a._sortDate);
  }, [posts, journals, activeFilter]);

  const handleStart = (e) => {
    if (window.scrollY > 0 || refreshing) return;
    startY.current = e.pageY || e.touches?.[0].pageY;
    isPulling.current = true;
  };

  const handleMove = useCallback((e) => {
    if (!isPulling.current || refreshing) return;
    const currentY = e.pageY || e.touches?.[0].pageY;
    const diff = currentY - startY.current;

    if (diff > 0 && window.scrollY <= 0) {
      const resistance = 0.4;
      const offset = Math.min(diff * resistance, 100); 
      setPullOffset(offset);
      if (e.cancelable) e.preventDefault();
    }
  }, [refreshing]);

  const handleEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullOffset > 60 && onRefresh) {
      setPullOffset(60); 
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullOffset(0); 
      }
    } else {
      setPullOffset(0); 
    }
  }, [pullOffset, onRefresh]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (window.scrollY <= 0 && e.deltaY < -100 && !refreshing && !isPulling.current) {
        handleStart({ pageY: 0 });
        setPullOffset(60);
        handleEnd();
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [refreshing, handleEnd]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [handleMove, handleEnd]);

  const renderItem = useCallback((item, index) => {
    if (item._type === 'journal') {
      return (
        <Box key={`j-${item._id || index}`} sx={{ mb: 1 }}>
          <JournalItemCard journal={item} />
        </Box>
      );
    }
    return (
      <Box key={`p-${item._id || index}`} sx={{ mb: 0 }}>
        <PostWithComments post={item} onDelete={onDelete} onPostUpdate={onPostUpdate} />
      </Box>
    );
  }, [onDelete, onPostUpdate]);

  if (loading && visibleItems.length === 0) {
    return <Box sx={{ p: 2 }}>{[1, 2, 3].map((i) => <PostSkeleton key={i} />)}</Box>;
  }

  return (
    <Box
      ref={containerRef}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      sx={{
        width: '100%',
        position: 'relative',
        transform: `translateY(${pullOffset}px)`,
        transition: isPulling.current ? 'none' : 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
        willChange: 'transform',
        userSelect: pullOffset > 0 ? 'none' : 'auto',
        zIndex: 1
      }}
    >
      {/* ФИКС 2: pointerEvents: 'none' убирает "невидимую стену" */}
      <Box sx={{
        position: 'absolute', top: -60, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60,
        opacity: pullOffset > 20 ? 1 : 0, transition: 'opacity 0.2s',
        pointerEvents: 'none', zIndex: 0
      }}>
        {refreshing ? (
          <CircularProgress size={24} />
        ) : (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {pullOffset > 55 ? 'Отпустите для обновления' : 'Потяните ниже'}
          </Typography>
        )}
      </Box>

      {/* ФИКС 3: Обычный Box вместо VirtualizedFeed, чтобы скроллилась вся страница */}
      <Box sx={{ p: { xs: 0, sm: 1 }, position: 'relative', zIndex: 2 }}>
        {visibleItems.map((item, index) => renderItem(item, index))}
        {hasMore && (
          <Box sx={{ textAlign: 'center', mt: 4, mb: 15 }}>
            <Button variant="contained" onClick={onLoadMore} sx={{ borderRadius: '25px', px: 6 }}>
              Загрузить еще
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
});

export default PostsList;