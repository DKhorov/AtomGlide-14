import React, { useState, useEffect, useMemo } from "react";
import axios from "../../system/axios";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
  Avatar,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Lyrics as LyricsIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Shuffle as ShuffleIcon,
  Lock as LockIcon,
  Public as PublicIcon,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux"; 
import { selectUser } from "../../system/redux/slices/getme";
import { useNavigate } from "react-router-dom";
import { setTrack } from "../../system/redux/playerSlice"; 

const COVER = "https://images.unsplash.com/photo-1549492167-27e1f4869c0d?w=800&auto=format&fit=crop&q=60";

const VIDEO_CLIPS = [
  { id: 1, title: "The Beatles - Hey Jude", videoId: "A_MjCqQoLLA", lang: 'en' },
  { id: 2, title: "Наутилус Помпилиус - Я хочу быть с тобой", videoId: "Kcmb-K_I5To", lang: 'ru' },
  { id: 3, title: "Игорь Скляр - Комарово ", videoId: "YPw9sZbFEeo", lang: 'ru' },
  { id: 4, title: "Joost Klein - Europapa", videoId: "IiHFnmI8pxg", lang: 'en' },
  { id: 5, title: "Elton John - Rocket Man", videoId: "r_QZe8Z66x8", lang: 'en' },
  { id: 6, title: "Алла Пугачёва - Арлекино", videoId: "itzde0VrzFU", lang: 'ru' },
  { id: 7, title: "John Lennon - IMAGINE", videoId: "YkgkThdzX-8", lang: 'en' },
  { id: 8, title: "Rick Astley - Together Forever", videoId: "yPYZpwSpKmA", lang: 'en' },
  { id: 9, title: "Алла Пугачёва - Волшебник-недоучка", videoId: "VrZ1CqJhmsc", lang: 'ru' },
  { id: 10, title: "The Beatles - Strawberry Fields Forever", videoId: "HtUH9z_Oey8", lang: 'en' },
  { id: 11, title: "Tommy Cash - Espresso Macchiato", videoId: "9b9Z5HSCXOI", lang: 'en' },
  { id: 12, title: "Nemo - The Code", videoId: "CO_qJf-nW0k", lang: 'en' },
  { id: 13, title: "Валерий Леонтьев - Полет на дельтаплане", videoId: "AWjr5fMgYSY", lang: 'ru' },
  { id: 14, title: "Алла Пугачёва - Миллион алых роз", videoId: "BQV0TrlB0gA", lang: 'ru' },
  { id: 15, title: "Elton John - Sacrifice", videoId: "NrLkTZrPZA4", lang: 'en' },
  { id: 16, title: "Queen – Bohemian Rhapsody", videoId: "fJ9rUzIMcZQ", lang: 'en' },
];

const STREAM_EXCLUDED = ["6ix9ine", "shaman"];

const Music = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const user = useSelector(selectUser);
  const { currentIndex, activePlaylist } = useSelector((state) => state.player); 

  const [allTracks, setAllTracks] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [likedTrackIds, setLikedTrackIds] = useState(new Set());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVideosModalOpen, setIsVideosModalOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [videoFilter, setVideoFilter] = useState("all");

  // Состояние для создания плейлиста
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const streamTracks = useMemo(() => {
    if (!allTracks.length) return [];
    return allTracks.filter((track) => {
      const meta = `${(track.artist || track.author || "").toLowerCase()} ${(track.title || "").toLowerCase()}`;
      return !STREAM_EXCLUDED.some((ban) => meta.includes(ban));
    });
  }, [allTracks]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Запрос всех треков и публичных плейлистов доступен всегда
        const promises = [axios.get("/tracksq"), axios.get("/playlists")];
        
        // Если юзер авторизован, тянем его лайки и его личные плейлисты
        if (user) {
          promises.push(axios.get("/music/liked"));
          promises.push(axios.get("/playlists/my"));
        }
        
        const results = await Promise.allSettled(promises);
        
        if (results[0].status === "fulfilled") setAllTracks(results[0].value.data.map(processTrackData));
        if (results[1].status === "fulfilled") setPublicPlaylists(results[1].value.data);
        
        if (user) {
          // В Music.jsx внутри useEffect
if (results[2]?.status === "fulfilled") {
  const likedData = results[2].value.data;
  // Сортируем ID, чтобы если ты выводил список здесь, он тоже был верным
  const ids = [...likedData].reverse().map((t) => typeof t === "object" ? t._id : t);
  setLikedTrackIds(new Set(ids));
}
          if (results[3]?.status === "fulfilled") {
            setMyPlaylists(results[3].value.data);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const processTrackData = (track) => ({
    ...track,
    cover: track.cover || COVER,
    title: track.title || "Без названия",
    genre: track.genre || "Без жанра",
  });

  const handlePlay = (track, index, sourceList) => {
    if (!user) return setIsAuthModalOpen(true);
    dispatch(setTrack({ playlist: sourceList, index: index }));
  };

  const handleStartFlow = () => {
    if (!streamTracks.length) return;
    const randomIndex = Math.floor(Math.random() * streamTracks.length);
    handlePlay(streamTracks[randomIndex], randomIndex, streamTracks);
  };

 const handleCreatePlaylist = async () => {
  if (!newPlaylistName.trim()) return;
  try {
    const { data } = await axios.post("/playlists", { 
      title: newPlaylistName,
      isPublic: !isPrivate,  // Для схемы где есть isPublic
      isPrivate: isPrivate   // Для схемы где есть isPrivate
    });
    
    setMyPlaylists((prev) => [data, ...prev]);
    if (!isPrivate) setPublicPlaylists((prev) => [data, ...prev]);
    
    setNewPlaylistName("");
    setIsPrivate(false);
    setIsCreatePlaylistOpen(false);
  } catch (err) {
    console.error(err);
    if (err.response?.status === 401) {
      alert("Сессия истекла. Пожалуйста, войдите в аккаунт снова.");
      navigate("/login");
    } else {
      alert("Ошибка при создании плейлиста: " + (err.response?.data?.message || "авторизуйтесь"));
    }
  }
};

  const toggleLike = async (e, trackId) => {
    e.stopPropagation();
    if (!user) return setIsAuthModalOpen(true);
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      next.has(trackId) ? next.delete(trackId) : next.add(trackId);
      return next;
    });
    await axios.post(`/music/like/${trackId}`);
  };

  const filteredVideos = useMemo(() => {
    if (videoFilter === "all") return VIDEO_CLIPS;
    return VIDEO_CLIPS.filter(v => v.lang === videoFilter);
  }, [videoFilter]);

const lyricsTracks = useMemo(() => {
const keywords = [
      "с тобой", "быть!", "step", "strawberry", "standing", 
      "чучело", "slightly mad", "безумен", "europapa", "abba",
      "careless", "whisper", "шепот", "imagine", "champions", 
      "rhapsody", "рапсодия", "pretender", "притворщик", "rocket man",
      "no tomorrow", "комбинация", "and i love her", "люблю её",
      "montmartre", "монмартр", "asphalt", "асфальт", "сила", "богатырская",
      // Новые треки
      "выходи", "vlonе", "не надо", "24 на 7", "face", // Face
      "деньги", "footjob", "полпятого", "paris",      // ParisLove
      "tears", "слезы", "weeknd",                    // Save Your Tears
      "trust me", "help me", "down"                  // E-Rotic
    ];
    return allTracks.filter((track) => {
      const title = (track.title || "").toLowerCase();
      return keywords.some(key => title.includes(key));
    });
  }, [allTracks]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh",width:'700px'}}>
        <CircularProgress sx={{ color: "rgb(237,93,25)" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, py: 2, pb: currentIndex !== null ? 14 : 4, height: "100vh", overflowY: "auto", color: '#fff', width:'750px' }}>
      
  

      {/* МОЯ МЕДИАТЕКА (ПРИВАТНЫЕ И ПОНРАВИВШИЕСЯ) */}
      {user && (
        <Box sx={{ mb:2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">Моя медиатека</Typography>
            <Button 
              startIcon={<AddIcon />} 
              onClick={() => setIsCreatePlaylistOpen(true)}
              sx={{ color: "rgb(237,93,25)", fontWeight: "bold" }}
            >
              Создать
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
            
            {/* КАРТОЧКА ИЗБРАННОГО */}
            <Box onClick={() => navigate(`/playlist/liked`)} sx={{ cursor: 'pointer' }}>
               <Box sx={{ 
                 width: 140, height: 140, borderRadius: 3, mb: 1, 
                 background: 'linear-gradient(135deg, #450af5 0%, #c4efd9 100%)',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
               }}>
                 <FavoriteIcon sx={{ fontSize: 50, color: '#fff' }} />
               </Box>
               <Typography noWrap fontWeight="bold" variant="subtitle2">Мне нравится</Typography>
               <Typography variant="caption" sx={{ opacity: 0.5 }}>{likedTrackIds.size} треков</Typography>
            </Box>

            {/* ВАШИ ПЛЕЙЛИСТЫ (ВКЛЮЧАЯ ПРИВАТНЫЕ) */}
           {/* ВАШИ ПЛЕЙЛИСТЫ (ВКЛЮЧАЯ ПРИВАТНЫЕ) */}
{myPlaylists
  .slice() // Создаем копию массива, чтобы не мутировать исходный стейт
  .sort((a, b) => {
    // Сортировка по дате создания (новые сверху)
    // Если есть поле createdAt:
    return new Date(b.createdAt) - new Date(a.createdAt);
    
    // Если поля даты нет, используем _id (раскомментируй строку ниже):
    // return b._id.toString().localeCompare(a._id.toString());
  })
  .map((playlist) => (
  <Box 
    key={playlist._id} 
    onClick={() => navigate(`/playlist/${playlist._id}`)}
    sx={{ minWidth: 140, cursor: 'pointer' }}
  >
    <Box sx={{ position: 'relative' }}>
      <Avatar 
              src={
  playlist.cover?.startsWith('http') 
    ? playlist.cover 
    : `https://atomglidedev.ru${playlist.cover}`
}             
        variant="rounded" 
        sx={{ width: 140, height: 140, borderRadius: 1, mb: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }} 
      />
      {!playlist.isPublic && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', borderRadius: '50%', p: 0.5, display: 'flex' }}>
          <LockIcon sx={{ fontSize: 14, color: '#fff' }} />
        </Box>
      )}
    </Box>
    <Typography noWrap fontWeight="bold" variant="subtitle2">{playlist.title}</Typography>
    <Typography variant="caption" sx={{ opacity: 0.5 }}>{playlist.isPublic ? 'Публичный' : 'Приватный'}</Typography>
  </Box>
))}
          </Box>
        </Box>
      )}

      {/* ПУБЛИЧНЫЕ ПЛЕЙЛИСТЫ */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>Все плейлисты</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 2 }}>
          {publicPlaylists.map((playlist) => (
            <Box 
              key={`pub-${playlist._id}`} 
              onClick={() => navigate(`/playlist/${playlist._id}`)}
              sx={{ minWidth: 140, cursor: 'pointer' }}
            >
              <Avatar 
                      src={
  playlist.cover?.startsWith('http') 
    ? playlist.cover 
    : `https://atomglidedev.ru${playlist.cover}`
}            
                variant="rounded" 
                sx={{ width: 140, height: 140, borderRadius: 1, mb: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }} 
              />
              <Typography noWrap fontWeight="bold" variant="subtitle2">{playlist.title}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.5 }}>{playlist.tracks?.length || 0} треков</Typography>
            </Box>
          ))} 
        </Box>
      </Box>

   

      {/* ВСЯ МУЗЫКА */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">Вся музыка</Typography>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, p: 0.5 }}>
          <IconButton onClick={() => setViewMode("list")} size="small" sx={{ color: viewMode === "list" ? "rgb(237,93,25)" : "rgba(255,255,255,0.3)" }}><ViewListIcon /></IconButton>
          <IconButton onClick={() => setViewMode("grid")} size="small" sx={{ color: viewMode === "grid" ? "rgb(237,93,25)" : "rgba(255,255,255,0.3)" }}><ViewModuleIcon /></IconButton>
        </Box>
      </Box>

      {viewMode === "list" ? (
        <Box>{allTracks.map((track, idx) => <TrackItem key={`all-${track._id}`} track={track} isAuth={!!user} isLiked={likedTrackIds.has(track._id)} onPlay={() => handlePlay(track, idx, allTracks)} onLike={(e) => toggleLike(e, track._id)} isActive={activePlaylist === allTracks && currentIndex === idx} />)}</Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
          {allTracks.map((track, idx) => (
            <Box key={`grid-${track._id}`} onClick={() => handlePlay(track, idx, allTracks)} sx={{ cursor: 'pointer', textAlign: 'center' }}>
              <Avatar src={track.cover} variant="rounded" sx={{ width: '100%', height: 'auto', aspectRatio: '1/1', borderRadius: 4, mb: 1, border: (activePlaylist === allTracks && currentIndex === idx) ? '2px solid rgb(237,93,25)' : 'none' }} />
              <Typography noWrap variant="subtitle2" sx={{ color: (activePlaylist === allTracks && currentIndex === idx) ? 'rgb(237,93,25)' : 'white' }}>{track.title}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* МОДАЛКИ: АВТОРИЗАЦИЯ, СОЗДАНИЕ ПЛЕЙЛИСТА */}
      {isAuthModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setIsAuthModalOpen(false)}>
          <Box sx={{ width: 300, bgcolor: "#121212", p: 4, borderRadius: 4, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <Typography sx={{ color: "#fff", mb: 3 }}>Войдите в аккаунт</Typography>
            <Button fullWidth variant="contained" sx={{bgcolor: 'rgb(237,93,25)'}} onClick={() => navigate("/login")}>Войти</Button>
          </Box>
        </div>
      )}

      {isCreatePlaylistOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setIsCreatePlaylistOpen(false)}>
          <Box sx={{ width: 350, bgcolor: "#181818", p: 3, borderRadius: 4 }} onClick={(e) => e.stopPropagation()}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#fff", mb: 2 }}>Новый плейлист</Typography>
            <TextField 
              fullWidth autoFocus placeholder="Название плейлиста" 
              value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)}
              sx={{ input: { color: 'white' }, bgcolor: '#222', borderRadius: 2, mb: 2 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, bgcolor: 'rgba(255,255,255,0.05)', p: 1.5, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isPrivate ? <LockIcon fontSize="small" sx={{ color: 'rgb(237,93,25)' }} /> : <PublicIcon fontSize="small" />}
                <Typography variant="body2">{isPrivate ? "Приватный" : "Публичный"}</Typography>
              </Box>
              <Switch checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} color="warning" />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button fullWidth onClick={() => setIsCreatePlaylistOpen(false)} sx={{ color: 'white' }}>Отмена</Button>
              <Button fullWidth variant="contained" onClick={handleCreatePlaylist} sx={{ bgcolor: 'rgb(237,93,25)' }}>Создать</Button>
            </Box>
          </Box>
        </div>
      )}

      {/* Модалка Видеоклипов */}
      {isVideosModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1300, backgroundColor: '#000',
          overflow: 'auto',
          padding: '16px'
        }} onClick={() => setIsVideosModalOpen(false)}>
          <Box sx={{ maxWidth: '1200px', mx: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" fontWeight="bold">Все клипы</Typography>
              <IconButton onClick={() => setIsVideosModalOpen(false)} sx={{ color: 'white' }}><CloseIcon fontSize="large" /></IconButton>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              {filteredVideos.map((video) => (
                <Box key={`modal-${video.id}`}>
                  <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: '#111', borderRadius: 4, overflow: 'hidden', mb: 1 }}>
                    <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${video.videoId}`} frameBorder="0" allowFullScreen />
                  </Box>
                  <Typography variant="h6">{video.title}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </div>
      )}
    </Box>
  );
};

const TrackItem = ({ track, isLiked, onPlay, onLike, isActive, isAuth }) => (
  <Box onClick={onPlay} sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.2, mb: 1, cursor: "pointer", bgcolor: isActive ? "rgba(170, 37, 0, 0.05)" : "rgba(255,255,255,0.05)", borderRadius: 2, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.19)" } }}>
    <Avatar src={track.cover} variant="rounded" sx={{ width: 50, height: 50 }} />
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Typography noWrap fontWeight={500} sx={{ color: isActive ? "rgb(237,93,25)" : "white" , lineHeight: 1 }}>{track.title}</Typography>
      <Typography variant="caption" sx={{ opacity: 0.6 }}>{track.genre}</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {isAuth && <IconButton onClick={onLike} size="small" sx={{ color: isLiked ? "rgb(237,93,25)" : "rgba(255,255,255,0.3)" }}>{isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}</IconButton>}
      <PlayArrowIcon sx={{ opacity: isActive ? 1 : 0.3, color: isActive ? "rgb(237,93,25)" : "inherit" }} />
    </Box>
  </Box>
);

export default Music;