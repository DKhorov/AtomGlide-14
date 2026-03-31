import React, { useRef, useState, useMemo } from 'react';
import { Box, IconButton, Typography, Skeleton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

// Утилита для формирования URL
const getMediaFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://atomglidedev.ru${url.startsWith('/') ? url : `/${url}`}`;
};

const PostPhoto = ({ post, postIndex = 0 }) => {
  const mediaRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Состояние загрузки и ошибок для каждой картинки в посте
  const [loaded, setLoaded] = useState({});
  const [errors, setErrors] = useState({});

  const images = useMemo(() => {
    if (post?.images?.length > 0) return post.images;
    if (post?.imageUrl) return [post.imageUrl];
    return [];
  }, [post]);

  const isVideo = Boolean(post?.videoUrl);

  const handleLoad = (idx) => {
    setLoaded((prev) => ({ ...prev, [idx]: true }));
  };

  const handleError = (idx) => {
    setErrors((prev) => ({ ...prev, [idx]: true }));
  };

  if (!isVideo && images.length === 0) return null;

  // Функция рендера отдельного изображения (общая для сетки и одиночного фото)
  const renderMediaItem = (img, idx, isSingle = false) => {
    const url = getMediaFullUrl(img);
    const isImageLoaded = loaded[idx];
    const hasError = errors[idx];

    return (
      <Box
        key={idx}
        onClick={() => {
          setModalImageSrc(url);
          setOpenModal(true);
        }}
        sx={{
          position: 'relative',
          width: '100%',
          height: isSingle ? 'auto' : '200px',
          minHeight: isSingle ? '250px' : '200px',
          bgcolor: '#1a1a1a',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        {/* Скелетон: показываем пока не загрузилось и нет ошибки */}
        {!isImageLoaded && !hasError && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ bgcolor: '#222', position: 'absolute', top: 0, left: 0 }}
          />
        )}

        {hasError ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', p: 2 }}>
            <Typography variant="caption" color="grey.600">Ошибка загрузки</Typography>
          </Box>
        ) : (
          <img
            src={url}
            alt={`post-media-${idx}`}
            onLoad={() => handleLoad(idx)}
            onError={() => handleError(idx)}
            // Для первых постов в ленте грузим сразу, для остальных — лениво
            loading={postIndex < 2 ? "eager" : "lazy"}
            style={{
              width: '100%',
              height: isSingle ? 'auto' : '100%',
              maxHeight: isSingle ? '600px' : 'none',
              objectFit: 'cover',
              display: 'block',
              // Магия здесь: картинка всегда в DOM, но проявляется только после загрузки
              opacity: isImageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
        )}
      </Box>
    );
  };

  // Рендер ВИДЕО
  if (isVideo) {
    return (
      <Box sx={{ width: '100%', mt: 1, position: 'relative', borderRadius: '20px', overflow: 'hidden', bgcolor: '#111', height: '440px' }}>
        <video
          ref={mediaRef}
          src={getMediaFullUrl(post.videoUrl)}
          loop
          muted
          playsInline
          autoPlay
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <IconButton 
          onClick={(e) => { 
            e.stopPropagation(); 
            if (isPlaying) { mediaRef.current.pause(); } else { mediaRef.current.play(); }
            setIsPlaying(!isPlaying);
          }} 
          sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
      </Box>
    );
  }

  // Рендер ФОТО (сетка или одна картинка)
  return (
    <>
      <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
        {images.length === 1 ? (
          <Box sx={{ borderRadius: '20px', overflow: 'hidden' }}>
            {renderMediaItem(images[0], 0, true)}
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gap: 1, 
            gridTemplateColumns: images.length === 2 ? '1fr 1fr' : '1fr 1fr', 
            borderRadius: '20px', 
            overflow: 'hidden' 
          }}>
            {images.slice(0, 4).map((img, idx) => renderMediaItem(img, idx, false))}
          </Box>
        )}
      </Box>

      {/* Модальное окно просмотра */}
      {openModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.95)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }} onClick={() => setOpenModal(false)}>
          <IconButton 
            onClick={() => setOpenModal(false)} 
            sx={{ position: 'absolute', top: 20, right: 20, color: 'white', zIndex: 10 }}
          >
            <CloseIcon fontSize="large" />
          </IconButton>
          
          <Box
            component="img"
            src={modalImageSrc}
            sx={{ 
              maxWidth: '95%', 
              maxHeight: '95%', 
              objectFit: 'contain',
              boxShadow: 24 
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default PostPhoto;