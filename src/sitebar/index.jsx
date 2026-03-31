"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  useMediaQuery,
  Box, TextField, Button, IconButton, Typography, Alert, Fade, Avatar, Stack,
  Paper, BottomNavigation, BottomNavigationAction, Slide, Menu, MenuItem
} from '@mui/material';
import '../fonts/stylesheet.css';

// --- ИКОНКИ ---
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import MusicNoteIcon from '@mui/icons-material/MusicNote'; 
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';

// Иконки для нижней панели
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded'; // Иконка для статей
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded'; 

import { TbMusicPlus } from "react-icons/tb";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useSelector, useDispatch } from 'react-redux';

import axios from "../system/axios";
import { selectUser } from '../system/redux/slices/getme';
import { ReactComponent as StoreIcon } from './14.svg';
import PostCreatorModal from '../page/main/PostCreator';

// ИМПОРТЫ ДЛЯ ПЛЕЕРА
import { togglePlay, stopPlayer, nextTrack } from '../system/redux/playerSlice';
import EditorJS from '@editorjs/editorjs';

const ACCENT_COLOR = 'rgb(237, 93, 25)';

// --- ВСТРОЕННЫЙ КОМПОНЕНТ EDITOR ---
const Editor = ({ onChange, initialData }) => {
  const ejInstance = useRef(null);

  useEffect(() => {
    const initEditor = async () => {
      const [Header, ImageTool] = await Promise.all([
        import('@editorjs/header'),
        import('@editorjs/image'),
      ]);

      if (!ejInstance.current) {
        const editor = new EditorJS({
          holder: 'editorjs',
          data: initialData,
          placeholder: 'Нажмите Tab или плюс...',
          tools: {
            header: { class: Header.default, inlineToolbar: true },
            image: {
              class: ImageTool.default,
              config: {
                endpoints: {
                  byFile: 'http://localhost:3001/upload', 
                }
              }
            },
          },
          async onChange() {
            const content = await editor.save();
            onChange(content);
          },
        });
        ejInstance.current = editor;
      }
    };

    initEditor();
    return () => {
      if (ejInstance.current) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, []);

  // Цвет текста теперь принудительно белый для темной темы редактора
  return (
    <Box id="editorjs" sx={{ 
      minHeight: '300px', 
      color: '#fff',
      '& .ce-block': { color: '#fff' },
      '& .ce-toolbar__plus, & .ce-toolbar__settings-btn': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
      '& .cdx-input': { color: '#fff' },
      '& .ce-inline-toolbar': { color: '#000' } // Тулбар оставляем светлым для читаемости
    }} />
  );
};

// --- АНИМАЦИЯ ПОЯВЛЕНИЯ МОДАЛОК ---
// Transition removed - no longer needed for DIV-based modals

const CustomTextField = ({ label, ...props }) => (
  <TextField
    {...props}
    fullWidth
    label={label}
    variant="standard"
    InputLabelProps={{ 
      shrink: true, 
      sx: { 
        color: ACCENT_COLOR, 
        fontWeight: 600, 
        fontSize: '14px',
        '&.Mui-focused': { color: ACCENT_COLOR }
      } 
    }}
    InputProps={{
      disableUnderline: true,
      sx: {
        color: '#fff',
        bgcolor: '#121212',
        borderRadius: '16px',
        px: 2,
        py: 0.8,
        mt: '22px !important',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': { bgcolor: '#1a1a1a' },
        '&.Mui-focused': {
          border: `1px solid ${ACCENT_COLOR}`,
          bgcolor: '#0f0f0f',
          boxShadow: `0 0 0 4px rgba(237, 93, 25, 0.15)`
        }
      }
    }}
  />
);

const Sitebar = () => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const isSmallMobile = useMediaQuery('(max-width:500px)');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); 
  const user = useSelector(selectUser);

  // --- ЛОГИКА ТЕМЫ ---
  const [themeIndex, setThemeIndex] = useState(1); // Dark по умолчанию
  const themes = [
    { name: "white", bg: "#f4f6f9", card: "#ffffff", text: "#000", accent: "#000", border: "rgba(0,0,0,0.1)" },
    { name: "black", bg: "rgba(14, 17, 22, 1)", card: "#121212", text: "#fff", accent: "#fff", border: "rgba(255, 255, 255, 0.08)" }
  ];
  const currentTheme = themes[themeIndex];

  // ДАННЫЕ ПЛЕЕРА
  const { activePlaylist = [], currentIndex = null, isPlaying = false } = useSelector((state) => state.player || {});
  const currentTrack = (currentIndex !== null && activePlaylist[currentIndex]) ? activePlaylist[currentIndex] : null;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showIntro, setShowIntro] = useState(false);

  // --- ЛОГИКА ЗАГРУЗКИ ТРЕКА ---
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [trackData, setTrackData] = useState({ title: "", genre: "", cover: "" });
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  // --- ЛОГИКА МЕНЮ СОЗДАНИЯ ---
  const [anchorElCreate, setAnchorElCreate] = useState(null);
  const openCreateMenu = Boolean(anchorElCreate);
  
  // Состояния для постов и статей
  const [openPostCreator, setOpenPostCreator] = useState(false);
  const [openArticleCreator, setOpenArticleCreator] = useState(false);
  
  // Данные для статьи
  const [articleTitle, setArticleTitle] = useState('');
  const [articleTopic, setArticleTopic] = useState('');
  const [articleBlocks, setArticleBlocks] = useState(null);
  const [isPublishingArticle, setIsPublishingArticle] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      setShowIntro(true);
      const timer = setTimeout(() => setShowIntro(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentTrack?.title]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSearch = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false); 
    }
  };

  const handleInputChange = (e) => setTrackData({ ...trackData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError("");
    if (file) {
      if (file.size / (1024 * 1024) > 30) {
        setUploadError("Файл слишком большой. Лимит 30MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCloseUpload = () => {
    setOpenUpload(false);
    setTrackData({ title: "", genre: "", cover: "" });
    setSelectedFile(null);
    setUploading(false);
    setUploadError("");
  };

  const handleUpload = async () => {
    if (!selectedFile || !trackData.title.trim() || !trackData.genre.trim()) {
       setUploadError("Заполните название, жанр и выберите файл");
       return;
    }
    try {
      setUploading(true);
      setUploadError(""); 
      const formData = new FormData();
      formData.append("track", selectedFile);
      formData.append("title", trackData.title.trim());
      formData.append("genre", trackData.genre.trim());
      
      const finalCover = trackData.cover.trim() || "https://r-p-media.ru/images/default-album-art.png";
      formData.append("cover", finalCover);
      
      await axios.post("/PostTrack", formData, { headers: { "Content-Type": "multipart/form-data" } });
      handleCloseUpload();
      navigate("/music");
    } catch (err) {
      console.error("Ошибка при загрузке:", err);
      const serverMessage = err.response?.data?.message || "Ошибка при загрузке на сервер";
      setUploadError(serverMessage);
    } finally { 
      setUploading(false); 
    }
  };

  // Метод публикации, который потерялся в прошлый раз
  const handlePublishArticle = async () => {
    if (!articleTitle || !articleTopic || !articleBlocks || !user?._id) return alert('Заполните данные (заголовок, тема и контент)');
    setIsPublishingArticle(true);
    try {
      const response = await fetch('http://localhost:3001/dev/Journal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: articleTitle, topic: articleTopic, text: articleBlocks, author: user._id }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Статья успешно опубликована!');
        setOpenArticleCreator(false);
        setArticleTitle('');
        setArticleTopic('');
        setArticleBlocks(null);
        window.location.reload();
      } else {
        alert('Ошибка при публикации статьи');
      }
    } catch (e) { 
      console.error(e); 
      alert('Ошибка при соединении с сервером');
    } finally { 
      setIsPublishingArticle(false); 
    }
  };

  const menuItems = useMemo(() => {
    const items = [
      { label: 'Главная', href: '/' },
      { label: 'Статьи', href: '/jrnl' },
      { label: 'Магазин', href: '/store' },
      { label: 'Каналы', href: '/channels' },
      { label: 'Музыка', href: '/music' },
      { label: 'Рейтинг', href: '/forbes' },
    ];
    if (user) {
      items.push(
        { label: 'Кошелёк', href: '/wallet' },
        { label: 'Профиль', href: `/account/${user.id || user._id}` },
        { label: 'Настройки', href: '/settings' },
        { label: 'AtomPro+', href: '/subscription' }
      );
    } else {
      items.push({ label: 'Войти', href: '/login' });
    }
    return items;
  }, [user]);

  const handleNavigation = (href) => {
    navigate(href);
    setIsOpen(false);
  };

  const bottomNavValue = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.includes('/music')) return 1;
    if (path.includes('/jrnl')) return 2;
    if (path.includes('/store')) return 3;
    return isOpen ? 4 : -1; 
  }, [location.pathname, isOpen]);

  return (
    <>
      {/* --- ГЛАВНАЯ ВЕРХНЯЯ ПАНЕЛЬ --- */}
      <Box sx={{ 
        width: '100%', position: 'sticky', top: 0, zIndex: 1100,
        bgcolor: 'rgba(34, 35, 38, 0.98)',  
        borderBottom: `1px solid ${currentTheme.border}`,
        backdropFilter: 'blur(10px)', transition: '0.3s' 
      }}>
        
        {/* --- ШАПКА --- */}
        <Box sx={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          p: '10px 20px'
        }}>
          <Box onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <StoreIcon style={{ width: 40, height: 40 }} />
            {!isSmallMobile && <span style={{ fontWeight: 800, fontSize: '20px', color: currentTheme.text }}>AtomGlide<span style={{fontWeight:'100'}}>.com</span></span>}
          </Box>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, maxWidth: '500px', mx: 4, position: 'relative' }}>
               <AnimatePresence mode="wait">
                {showIntro ? (
                  <motion.div key="intro" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <Typography sx={{ color: ACCENT_COLOR, fontWeight: 700, textAlign: 'center', letterSpacing: '1px' }}>
                      ATOMGLIDE MUSIC
                    </Typography>
                  </motion.div>
                ) : currentTrack ? (
                  <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '100px', p: '4px 12px' }}>
                      <Avatar src={currentTrack.cover} sx={{ width: 28, height: 28, mr: 1.5 }} />
                      <Typography noWrap sx={{ color: currentTheme.text, fontSize: '13px', fontWeight: 600, flexGrow: 1 }}>{currentTrack.title}</Typography>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => dispatch(togglePlay())} sx={{ color: currentTheme.text }}>
                          {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                        </IconButton>
                        <IconButton size="small" onClick={() => dispatch(nextTrack())} sx={{ color: currentTheme.text }}>
                          <SkipNextIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => dispatch(stopPlayer())} sx={{ color: 'rgba(255,255,255,0.3)' }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
                      </Stack>
                    </Box>
                  </motion.div>
                ) : (
                  <motion.div key="search">
                    <input 
                      type="text" placeholder="Поиск контента..." 
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={handleSearch}
                      style={{ width: '100%', padding: '10px 18px', borderRadius: '100px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: currentTheme.text, outline: 'none' }}
                    />
                  </motion.div>
                )}
               </AnimatePresence>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user && (
              <>
                {/* ВЫПАДАЮЩЕЕ МЕНЮ СОЗДАНИЯ */}
                <IconButton 
                  onClick={(e) => setAnchorElCreate(e.currentTarget)} 
                  sx={{ 
                    bgcolor: currentTheme.text, color: currentTheme.bg, borderRadius: '100px', px: isMobile ? 1.5 : 2.5, 
                    '&:hover': { bgcolor: ACCENT_COLOR, color: '#fff' } 
                  }}
                >
                  <AddIcon sx={{ fontSize: '20px' }} />
                  {!isMobile && <Typography sx={{ fontSize: '14px', ml: 0.5, fontWeight: 700 }}>Создать</Typography>}
                </IconButton>
                
                <Menu
                  anchorEl={anchorElCreate}
                  open={openCreateMenu}
                  onClose={() => setAnchorElCreate(null)}
                  PaperProps={{
                    sx: {
                      bgcolor: currentTheme.card, color: currentTheme.text, 
                      border: `1px solid ${currentTheme.border}`, borderRadius: '12px', mt: 1
                    }
                  }}
                >
                  <MenuItem onClick={() => { setOpenPostCreator(true); setAnchorElCreate(null); }}>
                    Создать пост
                  </MenuItem>
                  <MenuItem onClick={() => { setOpenArticleCreator(true); setAnchorElCreate(null); }}>
                    Создать статью
                  </MenuItem>
                </Menu>

                <IconButton onClick={() => setOpenUpload(true)} sx={{ color: currentTheme.text }}><TbMusicPlus size={22} /></IconButton>
              </>
            )}
            {!user && <Button onClick={() => navigate('/login')} sx={{ color: ACCENT_COLOR }}>Войти</Button>}
          </Box>
        </Box>

        {/* --- ДЕСКТОПНОЕ МЕНЮ --- */}
        {!isMobile && (
          <Box sx={{borderTop: `1px solid rgba(255,255,255,0.05)`}}>
            <Box sx={{ display: 'flex', gap: 2, py: 1, ml: 2}}>
             {menuItems.map((item) => (
              <Typography key={item.label} onClick={() => handleNavigation(item.href)} sx={{ color: '#888', fontSize: '14px', fontWeight: 600, cursor: 'pointer', '&:hover': { color: currentTheme.text } }}>
                {item.label}
              </Typography>
            ))}
          </Box>
          </Box>
        )}
      </Box> 

      {/* --- МОБИЛЬНАЯ НАВИГАЦИЯ (LIQUID GLASS ЭФФЕКТ) --- */}
      {isMobile && (
        <Box 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            left: '50%', 
            transform: 'translateX(-50%)',
            width: '92%', 
            maxWidth: '450px',
            zIndex: 1200, 
            bgcolor: 'rgba(26, 29, 35, 0.85)', 
            backdropFilter: 'blur(20px) saturate(160%)', 
            borderRadius: '24px', 
            border: '1px solid rgba(255, 255, 255, 0.15)', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }}
        >
          <BottomNavigation
            showLabels
            value={bottomNavValue}
            onChange={(event, newValue) => {
              const routes = ['/', '/music', '/jrnl', '/store'];
              if (newValue < 4) {
                navigate(routes[newValue]);
              } else if (newValue === 4) {
                toggleMenu();
              }
            }}
            sx={{ 
              bgcolor: 'transparent', 
              height: 65,
              '& .MuiBottomNavigationAction-root': { 
                color: 'rgba(255, 255, 255, 0.5)', 
                minWidth: 'auto', 
                padding: '6px 0',
                '&.Mui-selected': { color: 'rgb(237, 93, 25)' } 
              },
              '& .MuiBottomNavigationAction-label': { 
                fontSize: '10px', 
                marginTop: '4px', 
                fontWeight: 500, 
                '&.Mui-selected': { fontSize: '11px' } 
              }
            }}
          >
            <BottomNavigationAction label="Главная" icon={<HomeRoundedIcon />} />
            <BottomNavigationAction label="Музыка" icon={<GraphicEqRoundedIcon />} />
            <BottomNavigationAction label="Статьи" icon={<ArticleRoundedIcon />} />
            <BottomNavigationAction label="Магазин" icon={<StorefrontRoundedIcon />} />
            <BottomNavigationAction label="Меню" icon={isOpen ? <CloseIcon /> : <MenuIcon />} />
          </BottomNavigation>
        </Box>
      )}

      {/* --- МОБИЛЬНОЕ ВЫПАДАЮЩЕЕ МЕНЮ --- */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: 'calc(100vh - 65px)', backgroundColor: 'rgba(14, 17, 22, 1)', zIndex: 5000, padding: '20px', overflowY: 'auto' }}
          >
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>Меню</Typography>
            {menuItems.map((item) => (
              <Box key={item.label} onClick={() => handleNavigation(item.href)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography sx={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>{item.label}</Typography>
                <PlayArrowIcon sx={{ fontSize: 16, color: '#333' }}/>
              </Box>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ДИАЛОГ ЗАГРУЗКИ ТРЕКА --- */}
      {openUpload && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={handleCloseUpload}>
          <Box sx={{ 
            bgcolor: "#0a0a0a", 
            borderRadius: '24px', 
            border: `1px solid rgba(255,255,255,0.1)`,
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#fff', bgcolor: '#0a0a0a', p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="h6">Загрузить трек</Typography>
              <IconButton onClick={handleCloseUpload} sx={{ color: '#555' }}><CloseIcon /></IconButton>
            </Box>
            <Box sx={{ bgcolor: '#0a0a0a', p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <CustomTextField label="Название" name="title" value={trackData.title} onChange={handleInputChange} />
                <CustomTextField label="Автор/Жанр" name="genre" value={trackData.genre} onChange={handleInputChange} />
                <CustomTextField label="URL Обложки" name="cover" value={trackData.cover} onChange={handleInputChange} />
            
            <Button 
              variant="outlined" 
              component="label" 
              sx={{ 
                py: 4, borderRadius: '20px', 
                border: `2px dashed ${selectedFile ? ACCENT_COLOR : '#333'}`, 
                color: selectedFile ? '#fff' : '#888',
                display: 'flex', flexDirection: 'column', gap: 1
              }}
            >
              {selectedFile ? (
                <>
                  <MusicNoteIcon sx={{ color: ACCENT_COLOR, fontSize: 32 }} />
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>{selectedFile.name}</Typography>
                  <Typography sx={{ fontSize: '11px', color: '#666' }}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</Typography>
                </>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 32 }} />
                  <Typography>Выберите MP3 файл</Typography>
                </>
              )}
              <input type="file" hidden accept="audio/mpeg, audio/mp3" onChange={handleFileChange} />
            </Button>

                {uploadError && <Alert severity="error" sx={{ borderRadius: '12px' }}>{uploadError}</Alert>}
              </Box>
              <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Button 
                  onClick={handleUpload} variant="contained" fullWidth disabled={uploading || !selectedFile}
                  sx={{ bgcolor: ACCENT_COLOR, borderRadius: '50px', py: 1.5 }}
                >
                  {uploading ? "Загрузка..." : "Опубликовать"}
                </Button>
              </Box>
            </Box>
          </Box>
        </div>
      )}

      {/* --- МОДАЛКА СОЗДАНИЯ ПОСТА --- */}
      {openPostCreator && <PostCreatorModal open={openPostCreator} onClose={() => setOpenPostCreator(false)} />}

      {/* --- МОДАЛКА СОЗДАНИЯ СТАТЬИ --- */}
      {openArticleCreator && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1200, backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setOpenArticleCreator(false)}>
          <Box sx={{
            width: isMobile ? '100%' : '90%',
            maxWidth: isMobile ? '100%' : '900px',
            height: isMobile ? '100vh' : 'auto',
            maxHeight: '90vh',
            bgcolor: "#0a0a0a",
            backgroundImage: "none",
            color: "#fff",
            borderRadius: isMobile ? 0 : '24px',
            border: `1px solid rgba(255,255,255,0.1)`,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <Box sx={{
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: `1px solid ${currentTheme.border}`, 
              p: 3, 
              bgcolor: '#0a0a0a',
              flexShrink: 0
            }}>
              <Typography variant="h6" fontWeight={800}>Новая публикация</Typography>
              <IconButton onClick={() => setOpenArticleCreator(false)} sx={{ color: currentTheme.text }}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            {/* Content */}
            <Box sx={{ p: isMobile ? 2 : 4, bgcolor: '#0a0a0a', flex: 1, overflow: 'auto' }}>
              <TextField 
                fullWidth 
                placeholder="Заголовок" 
                variant="standard"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)} 
                InputProps={{ disableUnderline: true, style: { fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 900, color: currentTheme.text } }} 
              />
              <TextField 
                fullWidth 
                placeholder="Тема" 
                variant="standard" 
                value={articleTopic} 
                onChange={(e) => setArticleTopic(e.target.value)}
                sx={{ mt: 1 }} 
                InputProps={{ disableUnderline: true, style: { fontSize: '1.1rem', color: ACCENT_COLOR, fontWeight: 600 } }}
              />
              <Box sx={{ mt: 4, p: 3, bgcolor: '#121212', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Editor onChange={(data) => setArticleBlocks(data)} />
              </Box>
            </Box>
            
            {/* Actions */}
            <Box sx={{ p: 4, borderTop: '1px solid rgba(255,255,255,0.1)', bgcolor: '#0a0a0a', flexShrink: 0 }}>
              <Button 
                onClick={handlePublishArticle}
                disabled={isPublishingArticle} 
                variant="contained" 
                sx={{ bgcolor: ACCENT_COLOR, borderRadius: '100px', px: 6, py: 1.5, fontWeight: 700, fontSize: '16px' }}
              >
                {isPublishingArticle ? 'Публикация...' : 'Опубликовать'}
              </Button>
            </Box>
          </Box>
        </div>
      )}
    </>
  );
};

export default Sitebar;