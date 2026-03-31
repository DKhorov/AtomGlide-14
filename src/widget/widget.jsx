import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../system/axios'; 
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarsIcon from '@mui/icons-material/Stars';

import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../system/redux/slices/getme';
import { togglePlay } from '../system/redux/playerSlice';

const ACCENT_COLOR = 'rgb(237, 93, 25)';

const WidgetMain = React.memo(() => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // Данные для плеера
  const { activePlaylist = [], currentIndex = null, isPlaying = false } = useSelector((state) => state.player || {});
  
  // Данные для рейтинга
  const [topUsers, setTopUsers] = useState([]);
  const [loadingRating, setLoadingRating] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const { data } = await axios.get('/rating/active-users');
        if (Array.isArray(data)) setTopUsers(data.slice(0, 3));
      } catch (err) {
        console.error("Ошибка рейтинга:", err);
      } finally {
        setLoadingRating(false);
      }
    };
    fetchRating();
  }, []);

  const currentTrack = useMemo(() => {
    if (currentIndex !== null && activePlaylist[currentIndex]) {
      return activePlaylist[currentIndex];
    }
    return {
      title: 'Не проигрывается',
      artist: 'Atom Music',
      cover: 'https://media.tenor.com/RGnhWtHmJpoAAAAM/queen-queen-band.gif',
    };
  }, [currentIndex, activePlaylist]);

  // ПОРЯДОК: Профиль, Плеер, Рейтинг (Категории выкинули)
  const [panelsOrder, setPanelsOrder] = useState(['profile', 'music', 'ranking']);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragEnd = () => {
    const newOrder = [...panelsOrder];
    const draggedItem = newOrder[dragItem.current];
    newOrder.splice(dragItem.current, 1);
    newOrder.splice(dragOverItem.current, 0, draggedItem);
    dragItem.current = null;
    dragOverItem.current = null;
    setPanelsOrder(newOrder);
  };

  const getMediaUrl = (url) => {
    if (!url || url.includes('undefined')) return undefined; 
    return url.startsWith('http') ? url : `https://atomglidedev.ru${url}`;
  };

  const widgets = {
    profile: (
      <Paper elevation={0} sx={{
        p: 2, position: 'relative', borderRadius: '15px', 
        bgcolor: 'rgb(41,42,46)', border: '2px solid rgba(55, 57, 61)',
      }}>
        <DragIndicatorIcon sx={{ position: 'absolute', top: 12, right: 12, color: '#4b5563' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar src={getMediaUrl(user?.avatarUrl)} sx={{ width: 74, height: 74, border: '3px solid #374151' }} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', lineHeight: 1.2 }}>
              {user?.fullName || user?.username || 'Guest'}
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#9ca3af', mt: 0.2 }}>
            {user?.username || 'login'}
            </Typography>
          </Box>
        </Box>
        <Button 
          fullWidth
          onClick={() => navigate(`/account/${user?.id || user?._id}`)}
          sx={{
            bgcolor: 'rgb(46,50,54)', color: '#fff', textTransform: 'none', fontWeight: 800,
            borderRadius: '100px', py: 0.8, '&:hover': { bgcolor: '#4b5563' }
          }}>
          Открыть профиль
        </Button>
      </Paper>
    ),

    music: (
      <Paper elevation={0} sx={{
        position: 'relative', height: '180px', borderRadius: '15px', overflow: 'hidden',
        backgroundImage: `url('${currentTrack.cover}')`, backgroundSize: 'cover', backgroundPosition: 'center',
        border: '2px solid rgba(55, 57, 61)', transition: 'background-image 0.5s ease-in-out'
      }}>
        <Box sx={{
          position: 'absolute', bottom: 0, width: '100%', p: 2, boxSizing: 'border-box',
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden', flexGrow: 1 }}>
            <Avatar variant="rounded" src={currentTrack.cover} sx={{ width: 44, height: 44, borderRadius: '5px' }} />
            <Box sx={{ overflow: 'hidden' }}>
              <Typography noWrap sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>{currentTrack.title}</Typography>
              <Typography noWrap sx={{ color: '#bbb', fontSize: '0.75rem' }}>Играет из AtomGlide Music</Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => dispatch(togglePlay())}
            sx={{ bgcolor: '#fff', color: '#000', '&:hover': { bgcolor: ACCENT_COLOR, color: '#fff' } }}>
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Box>
      </Paper>
    ),

    ranking: (
      <Paper elevation={0} sx={{
        p: 2, borderRadius: '15px', bgcolor: 'rgb(41,42,46)', border: '2px solid rgba(55, 57, 61)',
        minHeight: '200px', display: 'flex', flexDirection: 'column'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>Топ по постам</Typography>
          <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: '1.2rem' }} />
        </Box>

        {loadingRating ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={20} sx={{ color: ACCENT_COLOR }} /></Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 0.5, mt: 'auto' }}>
            {[1, 0, 2].map((posIndex) => {
              const pUser = topUsers[posIndex];
              if (!pUser) return <Box key={posIndex} sx={{ flex: 1 }} />;
              const isFirst = posIndex === 0;
              const color = isFirst ? '#FFD700' : posIndex === 1 ? '#C0C0C0' : '#CD7F32';
              const h = isFirst ? 75 : posIndex === 1 ? 50 : 35;

              return (
                <Box key={pUser._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '90px' }}>
                  <Box sx={{ position: 'relative', mb: 0.5 }}>
                    {isFirst && <StarsIcon sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', color: 'gold', fontSize: 16 }} />}
                    <Avatar src={getMediaUrl(pUser.avatarUrl)} sx={{ width: isFirst ? 40 : 32, height: isFirst ? 40 : 32, border: `2px solid ${color}` }} />
                  </Box>
                  <Typography noWrap sx={{ color: 'white', fontWeight: 700, fontSize: '0.6rem', mb: 0.3 }}>{pUser.username}</Typography>
                  <Box sx={{ 
                    width: '100%', height: h, background: `linear-gradient(180deg, ${color}33 0%, rgba(30,30,30,1) 100%)`,
                    borderTopLeftRadius: 8, borderTopRightRadius: 8, border: `1px solid ${color}22`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5
                  }}>
                    <Typography sx={{ color: color, fontWeight: 900, fontSize: '0.7rem' }}>{posIndex + 1}</Typography>
                    <Typography sx={{ color: '#9ca3af', fontSize: '0.55rem', mt: 'auto', pb: 0.5 }}>{pUser.postsCount} п.</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    )
  };

  if (!user) return null;

  return (
    <Box sx={{ position: 'sticky', top: '150px', width: '350px', display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
      {panelsOrder.map((panelKey, index) => (
        <Box
          key={panelKey}
          draggable
          onDragStart={() => (dragItem.current = index)}
          onDragEnter={() => (dragOverItem.current = index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
          sx={{ cursor: 'grab' }}
        >
          {widgets[panelKey]}
        </Box>
      ))}
    </Box>
  );
});

export default WidgetMain;