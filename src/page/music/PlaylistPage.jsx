import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, Typography, Avatar, Button, CircularProgress, IconButton, 
  useMediaQuery, 
  TextField, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
  AppBar, Toolbar, Slide, Tooltip, Snackbar, Alert, Grow
} from "@mui/material";
import { 
  PlayArrow, Edit, ArrowBack, Delete, Add as AddIcon, 
  Close as CloseIcon, Save as SaveIcon, CameraAlt,
  Favorite as FavoriteIcon, Lock as LockIcon,
  ContentCopy as CopyIcon
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../system/redux/slices/getme"; 
import { setTrack } from "../../system/redux/playerSlice";
import axios from "../../system/axios";

// Transition removed - no longer needed for DIV-based modals

/**
 * Страница плейлиста:
 * Поддерживает системный плейлист "Мне нравится", приватные листы пользователя 
 * и публичные подборки. Реализовано управление треками и метаданными.
 */
const PlaylistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Данные глобального состояния авторизации
  const user = useSelector(selectUser);
  const isMobile = useMediaQuery('(max-width:900px)');

  // Основные стейты данных
  const [playlist, setPlaylist] = useState(null);
  const [allTracks, setAllTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Стейты управления интерфейсом (модалки и уведомления)
  const [isAddTrackOpen, setIsAddTrackOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Стейты форм редактирования
  const [searchQuery, setSearchQuery] = useState("");
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);

  // 1. Эффект загрузки данных при монтировании или смене ID
  useEffect(() => {
    fetchPlaylistData();
  }, [id, user]);

  // --- PlaylistPage.jsx ---

const fetchPlaylistData = () => {
  setLoading(true);
  if (id === "liked") {
    axios.get("/music/liked")
      .then(({ data }) => {
        setPlaylist({
          _id: "liked",
          title: "Мне нравится",
          description: "Ваши любимые треки, собранные в одном месте",
          // ТУТ ИЗМЕНЕНИЕ: переворачиваем массив, чтобы последние лайки были сверху
          tracks: [...data].reverse(), 
          isSystem: true,
          author: user,
          cover: null
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching liked:", err);
        navigate("/music");
      });
  } else {
    axios.get(`/playlists/${id}`)
      .then(({ data }) => {
        // Если хочешь, чтобы и в обычных плейлистах новые были сверху:
        const sortedPlaylist = {
          ...data,
          tracks: [...data.tracks].reverse() 
        };
        setPlaylist(sortedPlaylist);
        setEditForm({ title: data.title, description: data.description });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching playlist:", err);
        navigate("/music");
      });
  }
};

  // 2. Предзагрузка всех треков при открытии поиска (Lazy Load)
  useEffect(() => {
    if (isAddTrackOpen && allTracks.length === 0) {
      axios.get('/tracks').then(({ data }) => setAllTracks(data));
    }
  }, [isAddTrackOpen, allTracks.length]);

  // --- ЛОГИКА ПРОВЕРКИ ПРАВ ДОСТУПА ---
  const isAuthor = useMemo(() => {
    if (playlist?.isSystem) return false;
    if (!user?._id || !playlist?.author) return false;
    const authorId = playlist.author._id || playlist.author;
    return String(user._id) === String(authorId);
  }, [user, playlist]);

  // --- ФУНКЦИЯ КОПИРОВАНИЯ ССЫЛКИ ---
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
    });
  };

  // --- УПРАВЛЕНИЕ ТРЕКАМИ ---
  const handleAddTrack = async (trackId) => {
    if (!isAuthor) return;
    try {
      const currentTrackIds = playlist.tracks.map(t => t._id);
      if (currentTrackIds.includes(trackId)) return;

      // ИЗМЕНЕНИЕ: [trackId, ...old] вместо [...old, trackId]
      // Новые треки добавляются в НАЧАЛО списка
      const newTracks = [trackId, ...currentTrackIds];
      
      const { data } = await axios.patch(`/playlists/${id}`, { tracks: newTracks });
      setPlaylist(data);
    } catch (err) {
      console.error("Add track error:", err);
      alert("Не удалось добавить трек");
    }
  };

  const handleRemoveTrack = async (trackId) => {
    if (!isAuthor) return;
    if(!window.confirm("Удалить трек из плейлиста?")) return;
    try {
      await axios.delete(`/playlists/${id}/tracks/${trackId}`);
      setPlaylist(prev => ({
        ...prev,
        tracks: prev.tracks.filter(t => t._id !== trackId)
      }));
    } catch (err) {
      alert("Ошибка удаления");
    }
  };

  // --- ПОИСК И ФИЛЬТРАЦИЯ ---
  const availableTracks = useMemo(() => {
    if (!playlist || !allTracks) return [];
    const currentIds = new Set(playlist.tracks.map(t => t._id));
    return allTracks.filter(t => 
      !currentIds.has(t._id) && 
      (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       t.authorName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allTracks, playlist, searchQuery]);

  // --- РЕДАКТИРОВАНИЕ ДАННЫХ ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCoverFile(file);
      setPreviewCover(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async () => {
    if (!isAuthor) return;
    try {
      let coverUrl = playlist.cover;
      if (newCoverFile) {
        const formData = new FormData();
        formData.append('image', newCoverFile);
        const uploadRes = await axios.post('/upload/playlist-cover', formData);
        coverUrl = uploadRes.data.url;
      }

      const { data } = await axios.patch(`/playlists/${id}`, {
        title: editForm.title,
        description: editForm.description,
        cover: coverUrl
      });

      setPlaylist(data);
      setIsEditOpen(false);
      setNewCoverFile(null);
    } catch (err) {
      console.error("Save edit error:", err);
      alert("Ошибка при сохранении.");
    }
  };

  const handlePlayAll = () => {
    if (playlist?.tracks?.length > 0) {
      dispatch(setTrack({ playlist: playlist.tracks, index: 0 }));
    }
  };

  if (loading) return (
    <Box sx={{display:'flex', justifyContent:'center', mt: 10}}>
      <CircularProgress sx={{color:'rgb(237,93,25)'}}/>
    </Box>
  );

  return (
    <Box sx={{
          minWidth: isMobile ? '0' : '200px',
          height: '100vh',
          flex: isMobile ? 1 : 'none',
          overflowY: 'auto',
          px: 1,
          position: 'relative'
        }}>
      
      {/* Верхняя навигация */}
      <IconButton onClick={() => navigate(-1)} sx={{ color: 'white', mb: 2 }}>
        <ArrowBack />
      </IconButton>
      
      {/* --- ШАПКА ПЛЕЙЛИСТА --- */}
      <Box sx={{ 
        display: 'flex', 
        gap: 4, 
        mb: 5, 
        flexDirection: { xs: 'column', md: 'row' }, 
        alignItems: { xs: 'center', md: 'flex-start' } 
      }}>
        
        <Box sx={{ position: 'relative' }}>
          {playlist.isSystem ? (
             <Box sx={{ 
               width: { xs: 250, md: 130 }, 
               height: { xs: 250, md: 130 }, 
               mt: { xs: 0, md: 1 },
               borderRadius: 4, 
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               background: 'linear-gradient(135deg, #450af5 0%, #c4efd9 100%)',
               boxShadow: '0 8px 40px rgba(0,0,0,0.5)'
             }}>
                <FavoriteIcon sx={{ fontSize: { xs: 100, md: 60 }, color: 'white' }} />
             </Box>
          ) : (
            <Avatar 
              src={
  playlist.cover?.startsWith('http') 
    ? playlist.cover 
    : `https://atomglidedev.ru${playlist.cover}`
}
              variant="rounded" 
              sx={{ 
                width: { xs: 250, md: 130 }, 
                height: { xs: 250, md: 130 }, 
                mt: { xs: 0, md: 1 },
                borderRadius: 4, 
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                cursor: isAuthor ? 'pointer' : 'default'
              }}
              onClick={() => isAuthor && setIsEditOpen(true)}
            />
          )}
        </Box>

        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mt: { xs: 0, md: 2 }, flex: 1 }}>
          <Typography variant="overline" sx={{ color: 'rgb(237,93,25)', fontWeight: 'bold', letterSpacing: 2 }}>
            {playlist.isPublic === false ? (
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <LockIcon fontSize="inherit"/> ПРИВАТНЫЙ
              </Box>
            ) : "ПЛЕЙЛИСТ"}
          </Typography>
          
          <Typography 
            variant="h4" 
            fontWeight="900" 
            sx={{ mb: 1, lineHeight: 1.2, wordBreak: 'break-word' }}
          >
            {playlist.title}
          </Typography>

          <Typography sx={{ 
            opacity: 0.7, 
            pr: { xs: 0, md: 4 }, 
            mb: 3, 
            maxWidth: 600, 
            mx: { xs: 'auto', md: 0 }, 
            wordBreak: 'break-word'
          }}>
            {playlist.description || "Нет описания"}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap', 
            justifyContent: { xs: 'center', md: 'flex-start' },
            alignItems: 'center'
          }}>
            <Button 
              variant="contained" 
              startIcon={<PlayArrow />} 
              onClick={handlePlayAll} 
              sx={{ 
                bgcolor: 'rgb(237,93,25)', 
                borderRadius: 50, 
                px: 4, 
                py: 1.5, 
                fontWeight: 'bold', 
                "&:hover": { bgcolor: "rgb(200,70,10)" } 
              }}
            >
              Слушать
            </Button>
            
            <Tooltip title="Скопировать ссылку">
              <IconButton 
                onClick={handleCopyLink}
                sx={{ 
                  color: 'white', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  "&:hover": { bgcolor: 'rgba(255,255,255,0.1)' } 
                }}
              >
                <CopyIcon />
              </IconButton>
            </Tooltip>

            {isAuthor && (
              <>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  onClick={() => setIsAddTrackOpen(true)} 
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.3)', 
                    borderRadius: 50, 
                    px: 3, 
                    "&:hover": { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } 
                  }}
                >
                  Добавить
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Edit />} 
                  onClick={() => setIsEditOpen(true)} 
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.3)', 
                    borderRadius: 50, 
                    px: 3, 
                    "&:hover": { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } 
                  }}
                >
                  Изменить
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* --- СПИСОК ТРЕКОВ --- */}
      <Box sx={{ maxWidth: '100%' }}>
        {playlist.tracks.length === 0 ? (
          <Typography sx={{ opacity: 0.5, textAlign: 'center', mt: 5 }}>
            В этом плейлисте пока нет треков
          </Typography>
        ) : (
          playlist.tracks.map((track, idx) => (
            // ИЗМЕНЕНИЕ: Обертка Grow для анимации появления по очереди
            <Grow 
              in={!loading} 
              key={`${track._id}-${idx}`}
              timeout={(idx + 1) * 50} // 50мс задержка для каждого следующего элемента
            >
              <Box 
                onClick={() => dispatch(setTrack({ playlist: playlist.tracks, index: idx }))}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1.5, 
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  "&:hover": { bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2 },
                  transition: 'background-color 0.2s' // Убрал глобальную транзицию, чтобы не конфликтовала с Grow
                }}
              >
                <Typography sx={{ width: 12, opacity: 0.5, textAlign: 'center' }}>
                  {idx + 1}
                </Typography>
                
                <Avatar 
                  src={track.cover} 
                  variant="rounded" 
                  sx={{ width: 45, height: 45, mx: 2, borderRadius: 1.5 }} 
                />
                
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <Typography fontWeight="bold" noWrap>
                    {track.title}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.5 }} noWrap>
                    {track.genre}
                  </Typography>
                </Box>
                
                {isAuthor && (
                  <IconButton 
                    size="small" 
                    sx={{ color: 'rgba(255,255,255,0.3)', "&:hover": { color: "#ff4444" } }} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTrack(track._id);
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Grow>
          ))
        )}
      </Box>

      {/* Отступ для скролла */}
      <Box sx={{ height: 150 }} />

      {/* --- МОДАЛКИ И ДИАЛОГИ --- */}
      {isAuthor && (
        <>
          {/* Модалка добавления треков */}
          {isAddTrackOpen && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'flex-start',
              zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: isMobile ? 'none' : 'blur(4px)'
            }} onClick={isMobile ? undefined : () => setIsAddTrackOpen(false)}>
              <AppBar sx={{ position: 'relative', bgcolor: '#121212', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Toolbar>
                  <IconButton edge="start" color="inherit" onClick={() => setIsAddTrackOpen(false)}><CloseIcon /></IconButton>
                  <Typography sx={{ ml: 2, flex: 1, fontWeight: 'bold' }} variant="h6">Поиск музыки</Typography>
                </Toolbar>
              </AppBar>
              <Box sx={{ p: 2, bgcolor: '#121212', flex: 1, overflow: 'auto', maxHeight: isMobile ? 'calc(100vh - 64px)' : 'auto' }}>
                <TextField
                  fullWidth placeholder="Введите название..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ mb: 2, bgcolor: '#222', borderRadius: 2, input: { color: 'white' }, '& fieldset': { border: 'none' } }}
                />
                <List>
                  {availableTracks.map((track) => (
                    <ListItem key={track._id} button onClick={() => handleAddTrack(track._id)}>
                      <ListItemAvatar><Avatar src={track.cover} variant="rounded" /></ListItemAvatar>
                      <ListItemText primary={track.title} secondary={<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{track.genre}</Typography>} />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleAddTrack(track._id)} sx={{ color: 'rgb(237,93,25)' }}><AddIcon /></IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </div>
          )}

          {/* Модалка редактирования плейлиста */}
          {isEditOpen && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)'
            }} onClick={() => setIsEditOpen(false)}>
              <Box sx={{
                bgcolor: '#181818', 
                color: 'white', 
                maxWidth: isMobile ? '100%' : 500, 
                width: isMobile ? '100%' : '90%',
                maxHeight: '90vh',
                overflow: 'auto',
                borderRadius: isMobile ? 0 : 2,
                p: 3
              }} onClick={(e) => e.stopPropagation()}>
                <Typography sx={{ fontWeight: 'bold', pb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Детали плейлиста</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ position: 'relative', width: 180, height: 180 }}>
                      <Avatar 
                        src={previewCover || (playlist.cover ? `https://atomglidedev.ru${playlist.cover}` : "/default.png")} 
                        variant="rounded" 
                        sx={{ width: 180, height: 180, borderRadius: 4, filter: 'brightness(0.6)' }} 
                      />
                      <IconButton 
                        component="label" 
                        sx={{ 
                          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                          color: 'white', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
                        }}
                      >
                        <CameraAlt />
                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                      </IconButton>
                    </Box>
                  </Box>

                  <TextField 
                    label="Название" fullWidth value={editForm.title} 
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} 
                    sx={{ 
                      bgcolor: '#282828', borderRadius: 1,
                      '& .MuiOutlinedInput-root': { color: 'white' },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                    }} 
                  />
                  <TextField 
                    label="Описание" fullWidth multiline rows={3} value={editForm.description} 
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} 
                    sx={{ 
                      bgcolor: '#282828', borderRadius: 1,
                      '& .MuiOutlinedInput-root': { color: 'white' },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                    }} 
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Button onClick={() => setIsEditOpen(false)} sx={{ flex: 1, color: 'rgba(255,255,255,0.7)' }}>Отмена</Button>
                  <Button 
                    variant="contained" onClick={handleSaveEdit} 
                    sx={{ flex: 1, bgcolor: 'rgb(237,93,25)', '&:hover': { bgcolor: 'rgb(200,80,20)' }, borderRadius: 10 }}
                  >
                    Сохранить
                  </Button>
                </Box>
              </Box>
            </div>
          )}
        </>
      )}

      <Snackbar 
        open={copySuccess} 
        autoHideDuration={3000} 
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', bgcolor: 'rgb(237,93,25)', color: 'white' }}>
          Ссылка скопирована в буфер обмена!
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default PlaylistPage;