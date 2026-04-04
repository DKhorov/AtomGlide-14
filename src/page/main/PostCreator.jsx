import React, { useEffect, useState, useRef } from "react";
import {
  Box, IconButton, Typography, Select, MenuItem,
  useMediaQuery, useTheme, Divider, CircularProgress, Button, Alert,
} from "@mui/material";
import { FiImage, FiX, FiVideo, FiHash, FiAlertCircle, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../system/axios";
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../system/redux/slices/getme"; 

const ACCENT_COLOR = 'rgb(237, 93, 25)';
const BG_DARK = '#0a0a0a';
const BG_PANEL = 'rgba(20, 20, 20, 0.7)';
const BORDER_STYLE = '1px solid rgba(255, 255, 255, 0.08)';

const PostCreatorModal = ({ open: externalOpen, onClose: externalOnClose, onPostCreated }) => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  
  const [inputText, setInputText] = useState("");
  // Теперь храним массивы файлов и превью
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [mediaType, setMediaType] = useState('none'); 
  const [videoDuration, setVideoDuration] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [showPhotoLimitModal, setShowPhotoLimitModal] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/channels/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(res.data)) {
          setChannels(res.data);
          if (res.data.length > 0) setSelectedChannel(res.data[0]._id);
        }
      } catch (err) { console.error("Ошибка загрузки каналов:", err); }
    };
    if (open) fetchChannels();
  }, [open]);

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setMediaType(type);
      
      if (type === 'video') {
          // Видео оставляем одно
          const file = files[0];
          setSelectedMedia([file]);
          mediaPreviews.forEach(url => URL.revokeObjectURL(url));
          setMediaPreviews([URL.createObjectURL(file)]);
          
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = () => { setVideoDuration(video.duration); };
          video.src = URL.createObjectURL(file);
      } else {
          // Проверяем лимит на фото
          const totalPhotos = selectedMedia.length + files.length;
          const photoLimit = user?.isPremium ? Infinity : 3;
          
          if (totalPhotos > photoLimit) {
            if (!user?.isPremium) {
              setShowPhotoLimitModal(true);
              return;
            }
          }
          
          // Фото добавляем в массив
          setSelectedMedia(prev => [...prev, ...files]);
          const newPreviews = files.map(f => URL.createObjectURL(f));
          setMediaPreviews(prev => [...prev, ...newPreviews]);
      }
    }
    e.target.value = null;
  };

  const handleRemoveMedia = (indexToRemove) => {
      const newMedia = selectedMedia.filter((_, i) => i !== indexToRemove);
      const newPreviews = mediaPreviews.filter((_, i) => i !== indexToRemove);
      
      URL.revokeObjectURL(mediaPreviews[indexToRemove]);
      setSelectedMedia(newMedia);
      setMediaPreviews(newPreviews);
      
      if (newMedia.length === 0) setMediaType('none');
  };

  const handleClose = () => {
    if (externalOnClose) externalOnClose(); else setInternalOpen(false);
    setInputText("");
    setSelectedMedia([]);
    mediaPreviews.forEach(url => URL.revokeObjectURL(url));
    setMediaPreviews([]);
    setMediaType('none');
    setError("");
  };

  const handleSendPost = async () => {
    if (!inputText.trim() && selectedMedia.length === 0) return setError("Напишите текст или добавьте медиа");
    if (!selectedChannel) return setError("Выберите канал");
    
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append("title", inputText.trim() || "Пост");
      formData.append("text", inputText.trim());
      formData.append("channelId", selectedChannel);
      
      // Добавляем все файлы из массива в formData с одним и тем же ключом "media"
      selectedMedia.forEach(file => {
          formData.append("media", file);
      });
      
      if (mediaType === 'video') {
        formData.append("videoDuration", Math.floor(videoDuration));
      }

      const res = await axios.post("/posts", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (onPostCreated) onPostCreated(res.data);
      handleClose();

      const newPostId = res.data._id || res.data.post?._id;
      if (newPostId) navigate(`/post/${newPostId}`);

    } catch (err) {
      console.error("Server Response Error:", err.response?.data);
      setError(err.response?.data?.message || "Ошибка при создании публикации");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <>
      {/* Модалка лимита фото */}
      {showPhotoLimitModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowPhotoLimitModal(false)}>
          <Box sx={{
            backgroundColor: '#0a0a0a',
            borderRadius: '28px',
            p: 4,
            maxWidth: '380px',
            width: '90%',
            textAlign: 'center',
            border: '1px solid rgba(255, 174, 0, 0.3)',
            boxShadow: '0 20px 60px rgba(255, 174, 0, 0.15)',
          }} onClick={(e) => e.stopPropagation()}>
            <Typography sx={{ fontSize: '32px', mb: 2 }}>Воу!</Typography>
            <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#fff', mb: 2 }}>
              Лимит фото исчерпан
            </Typography>
            <Typography sx={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', mb: 3 }}>
              Бесплатные пользователи могут добавить до 3 фотографий. Купи подписку на AtomPro+ для неограниченного количества фото. Всего за 300 ATM! или 1,99$ в месяц.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={() => setShowPhotoLimitModal(false)} sx={{ 
                flex: 1, 
                py: 1.2, 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                color: '#fff', 
                fontWeight: 600,
                fontSize: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                ладно
              </Button>
              <Button onClick={() => {
                setShowPhotoLimitModal(false);
                navigate('/subscription');
              }} sx={{ 
                flex: 1, 
                py: 1.2, 
                background: 'linear-gradient(135deg, #dcdcdc 0%, #ffffff 100%)',
                color: '#000', 
                fontWeight: 700,
                fontSize: '14px',
                borderRadius: '12px',
              }}>
                Купить
              </Button>
            </Box>
          </Box>
        </div>
      )}

      {open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1200, backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          padding: isMobile ? 0 : '16px'
        }} onClick={handleClose}>
          <Box sx={{
            width: isMobile ? "100%" : "640px",
            height: isMobile ? "100%" : "auto",
            maxHeight: isMobile ? "100%" : "90vh",
            bgcolor: BG_DARK,
            borderRadius: isMobile ? 0 : "32px",
            border: BORDER_STYLE,
            boxShadow: '0 30px 70px rgba(0,0,0,0.8)',
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }} onClick={(e) => e.stopPropagation()}>
          <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ bgcolor: ACCENT_COLOR, p: 1, borderRadius: '12px', display: 'flex' }}><FiHash color="white" size={18} /></Box>
                <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>Новая публикация</Typography>
            </Box>
            <IconButton onClick={handleClose} sx={{ color: "rgba(255,255,255,0.3)" }}><FiX size={22} /></IconButton>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

          <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
            <textarea
              value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Введите текст поста..."
              style={{ width: '100%', minHeight: '150px', border: 'none', outline: 'none', background: 'transparent', color: 'white', fontSize: '18px', fontFamily: 'inherit', resize: 'none', lineHeight: 1.5 }}
            />

            {/* Блок предпросмотра файлов */}
            <AnimatePresence>
              {mediaPreviews.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mt: 2, pb: 1 }}>
                  {mediaPreviews.map((url, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'relative', minWidth: '150px', maxWidth: '300px', borderRadius: '16px', overflow: 'hidden', border: BORDER_STYLE, flexShrink: 0 }}
                      >
                        <IconButton
                          onClick={() => handleRemoveMedia(idx)}
                          sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', zIndex: 5, width: 28, height: 28 }}
                        >
                          <FiX size={14} />
                        </IconButton>
                        {mediaType === 'video' ? (
                          <video src={url} style={{ width: '100%', display: 'block' }} controls />
                        ) : (
                          <img src={url} alt="preview" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                        )}
                      </motion.div>
                  ))}
                </Box>
              )}
            </AnimatePresence>
          </Box>

          <Box sx={{ p: 3, bgcolor: BG_PANEL, borderTop: BORDER_STYLE }}>
            {error && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ff5252', mb: 2, bgcolor: 'rgba(255,82,82,0.1)', p: 1.5, borderRadius: '12px' }}>
                <FiAlertCircle /><Typography sx={{ fontSize: '13px' }}>{error}</Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.05)', px: 2, py: 1, borderRadius: '100px' }}>
                    <Select
                        value={selectedChannel} onChange={(e) => setSelectedChannel(e.target.value)}
                        variant="standard" disableUnderline IconComponent={FiChevronDown}
                        sx={{ color: 'white', fontSize: '13px', fontWeight: 600, minWidth: '110px', '& .MuiSelect-icon': { color: '#fff' } }}
                    >
                        {channels.map(ch => (
                            <MenuItem key={ch._id} value={ch._id}>{ch.nick || ch.name}</MenuItem>
                        ))}
                    </Select>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <input ref={imageInputRef} type="file" hidden multiple accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} />
                    <input ref={videoInputRef} type="file" hidden accept="video/*" onChange={(e) => handleFileSelect(e, 'video')} />
                    
                    <IconButton onClick={() => imageInputRef.current?.click()} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'white', width: '54px', height: '54px', border: BORDER_STYLE }}>
                        <FiImage size={22} />
                    </IconButton>
                    <IconButton onClick={() => videoInputRef.current?.click()} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'white', width: '54px', height: '54px', border: BORDER_STYLE }}>
                        <FiVideo size={22} />
                    </IconButton>
                    <IconButton onClick={handleSendPost} disabled={loading} sx={{ bgcolor: 'white', color: 'black', width: '54px', height: '54px', '&:hover': { bgcolor: '#f0f0f0' }, '&:disabled': { bgcolor: '#444', color: '#888' } }}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : <ArrowForwardRoundedIcon sx={{ fontSize: '28px' }} />}
                    </IconButton>
                </Box>
            </Box>
          </Box>
        </Box>
        </div>
      )}
    </>
  );
};

export default PostCreatorModal;
