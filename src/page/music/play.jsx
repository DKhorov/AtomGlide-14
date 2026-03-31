"use client";
import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Stack,
  useTheme,
  useMediaQuery,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar
} from "@mui/material";
import { keyframes } from "@mui/system";
import {
  SkipNext as NextIcon,
  SkipPrevious as PreviousIcon,
  KeyboardArrowDown as DownIcon,
  GraphicEq as LyricsIcon,
  List as QueueIcon,
  Close as CloseIcon,
  CenterFocusStrong,
  CenterFocusWeak,
} from "@mui/icons-material";
import { FaPlay, FaPause } from "react-icons/fa"; 
import { SiDolby } from "react-icons/si";

// --- REDUX ИМПОРТЫ ИЗ СТАРОГО ФАЙЛА ---
import { useSelector, useDispatch } from "react-redux";
import { togglePlay, nextTrack, prevTrack } from "../../system/redux/playerSlice";

import { 
  stillStandingLyrics, serovLyrics, doYouWantToKnowASecretLyrics, stepLyrics, 
  atomLyrics, strawberryFieldsLyrics, gentleLyrics, chuCheloLyrics, helpLyrics, 
  slightlyMadLyrics, europapaLyrics, abbaLyrics, carelessWhisperLyrics, theyDontCareAboutUsLyricsDark,
  dontStopMeNowLyricsRu, darkRedLyricsRu, imagineLyricsRu, championsLyricsRu,
  flyDayChinatownLyrics, freeLyrics, loveMeLikeNoTomorrowLyrics, combinationLyrics, 
  andILoveHerLyricsRu, wickedGameLyrics, whoIsSheLyrics, mentholSmokeLyrics,arlekinoPure,
  mzlffLyrics, springSmellLyrics, lastTimeLyrics, moskauLyrics, iInventedYouLyrics,vedmaPure,
  happyNationLyrics, nauLyrics, greatPretenderLyricsRu, bohemianRhapsodyLyricsRu, 
  rocketManLyrics, joyDivisionLyricsRu, youAreNotAloneFullLyricsRU, innuendoLyricsRU,
  lishDoUtraDark,dangerousPure,caramelPure,feelGoodPure,breakFreeRussian,
  allesLyrics, heyJudeLyrics, petalsOfTearsLyrics, theSmithsLyrics,
  theyDontCareAboutUsLyricsRU, showMustGoOnLyrics, lilyAllenLyrics, kroshkaMoyaLyrics,
  springLyrics, somebodyWatchingMeLyricsRU, kakNaVoyneLyrics, geronimosCadillacLyricsRU,
  sonneLyricsFull, stytsamenLyrics, cheriCheriLadyLyricsRU, lirikaLyrics,
  zanovoLyrics, billieJeanLyricsRU, lieblingsfachLyrics, parisLoveLyrics, 
  earthSongLyricsOriginal,rapGodPure,buratinoPure,
  faceVihodiLyrics, footjobLyrics, maryOnACrossLyrics, polPyatogoLyrics,
  daysOfOurLivesLyricsRU,rayBanPure,
  loveOfMyLifeOriginalRU,candleInTheWindOriginal,
  iWantItAllPurePower,mockingbirdPure,supermanPure,motorolaPure,
  bogatyrForceLyrics, rueMontmartreLyricsRu, saveYourTearsLyricsRu, goLive, 
  helpMeDownLyricsRu, faceMneNeNadoLyrics, asphaltLyrics, faceVloneLyrics, 
  face, selfharmLyrics, kissLyrics, zemfiraLyrics,moneyTreesPure,
  europapaLyricsRu, carelessWhisperLyricsRu // Добавлено из старого импорта
} from "./lyrics";

// --- УСКОРЕННЫЕ И БОЛЕЕ ЖИВЫЕ АНИМАЦИИ ---
const appleFloat1 = keyframes`
  0% { transform: translate(-15%, -15%) scale(1) rotate(0deg); }
  50% { transform: translate(20%, 15%) scale(1.2) rotate(90deg); }
  100% { transform: translate(-15%, -15%) scale(1) rotate(0deg); }
`;

const appleFloat2 = keyframes`
  0% { transform: translate(15%, 15%) scale(1.1) rotate(0deg); }
  50% { transform: translate(-20%, -10%) scale(0.9) rotate(-90deg); }
  100% { transform: translate(15%, 15%) scale(1.1) rotate(0deg); }
`;

const appleFloat3 = keyframes`
  0% { transform: translate(5%, -15%) scale(1); }
  50% { transform: translate(-10%, 20%) scale(1.3); }
  100% { transform: translate(5%, -15%) scale(1); }
`;

// --- МАССИВ ТРЕКОВ С DOLBY ---
const DOLBY_TRACKS = [
  "bohemian rhapsody", "dark red", "save your tears", "imagine",  
  "champions", "don't stop me now", "great pretender", "mary on a cross", 
  "hey jude", "wicked game", "fly-day chinatown", "i was made for lovin you", 
  "ansichtkaart", "moskau", "i invented you", "дыхание", "rocket man",
  "superman", "mockingbird", "i want to break free"
];

const formatTime = (sec) => {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SOLID_BG_TRACKS = [
  { title: "Название Трека 1", color: "#4a148c" }, 
  { title: "Селфхарм", color: "#7E0102" },     
  { title: "Mary on a cross", color: "#000000" },
  { title: "4:30", color: "#000000" },
  { title: "24 на 7", color: "#000000" },  
  { title: "Дыхание", color: "#000000" },  
  { title: "Матерь богов", color: "#000000" },  
  { title: "Innuendo", color: "#ffffff" },
  { title: "ansichtkaart", color: "rgb(2, 10, 255)" },
  { title: "I Was Made For Lovin You", color: "#000000" }
];

const checkIsLight = (color) => {
  if (!color) return false;
  const c = color.toLowerCase().trim();
  return c === "#ffffff" || c === "#fff" || c === "rgb(255, 255, 255)";
};

const AppleSlider = ({ value, max, onChange, onChangeCommitted, sx }) => (
  <Slider
    value={value} min={0} max={max || 1}
    onChange={onChange} onChangeCommitted={onChangeCommitted}
    sx={{
      color: sx?.color || "rgba(255,255,255,0.85)", height: 4, padding: "13px 0",
      "& .MuiSlider-thumb": {
        height: 12, width: 12, backgroundColor: sx?.color || "#fff", 
        opacity: 0, top: '50%', transform: 'translate(-50%, -50%)',
        transition: "opacity 0.2s, transform 0.2s",
        "&:hover, &.Mui-active": { opacity: 1, transform: 'translate(-50%, -50%) scale(1.2)' },
      },
      "& .MuiSlider-track": { border: "none", height: 4, backgroundColor: sx?.color || "rgba(255,255,255,0.9)" },
      "& .MuiSlider-rail": { opacity: 0.25, height: 4, backgroundColor: sx?.color || "#fff" },
      "&:hover .MuiSlider-thumb": { opacity: 1 },
      ...sx
    }}
  />
);

const useImageColors = (src) => {
  const [colors, setColors] = useState(['#1a2a6c', '#b21f1f', '#fdbb2d']); 
  useEffect(() => {
    if (!src) return;
    let isActive = true;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
      setTimeout(() => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx || !isActive) return;
          canvas.width = 10; canvas.height = 10;
          ctx.drawImage(img, 0, 0, 10, 10);
          const getRGB = (x, y) => {
            const d = ctx.getImageData(x, y, 1, 1).data;
            return `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
          };
          setColors([getRGB(0, 0), getRGB(5, 5), getRGB(9, 9)]);
        } catch (e) { console.warn("Color extraction error"); }
      }, 0);
    };
    return () => { isActive = false; };
  }, [src]);
  return colors;
};

const AnimatedMeshBackground = ({ colors, isLyricsMode, focusMode, isSolid, solidColor }) => {
  if (isSolid) {
    return <Box sx={{ position: "fixed", inset: 0, zIndex: 0, bgcolor: solidColor, transition: "background 0.6s ease" }} />;
  }

  const safeColors = colors?.length >= 3 ? colors : ['#1a2a6c', '#b21f1f', '#fdbb2d'];
  const opacity = focusMode ? 0.2 : (isLyricsMode ? 0.45 : 0.7);

  return (
    <Box sx={{ 
      position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", 
      bgcolor: safeColors[0], 
      transition: "background-color 1.2s ease" 
    }}>
      <Box sx={{ 
        position: 'absolute', width: '150vw', height: '150vh', top: '-20%', left: '-20%', 
        background: `radial-gradient(circle, ${safeColors[1]} 0%, transparent 70%)`, 
        opacity, 
        animation: `${appleFloat1} 5s infinite ease-in-out`, 
        willChange: 'transform', zIndex: 1 
      }} />
      
      <Box sx={{ 
        position: 'absolute', width: '150vw', height: '150vh', bottom: '-20%', right: '-20%', 
        background: `radial-gradient(circle, ${safeColors[2]} 0%, transparent 70%)`, 
        opacity, 
        animation: `${appleFloat2} 7s infinite ease-in-out`, 
        willChange: 'transform', zIndex: 1 
      }} />

      <Box sx={{ 
        position: 'absolute', width: '130vw', height: '130vh', top: '5%', left: '5%', 
        background: `radial-gradient(circle, ${safeColors[0]} 0%, transparent 75%)`, 
        mixBlendMode: 'screen', opacity: opacity * 0.8, 
        animation: `${appleFloat3} 4.5s infinite ease-in-out`, 
        willChange: 'transform', zIndex: 1 
      }} />

      <Box sx={{
        position: 'absolute', inset: -100, 
        backdropFilter: "blur(80px) saturate(160%)", 
        WebkitBackdropFilter: "blur(80px) saturate(160%)",
        background: isLyricsMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.2)",
        transition: "background 0.8s ease",
        zIndex: 2 
      }} />
    </Box>
  );
};

const TRACK_STYLES = [
  { title: "Blinding Lights", fontFamily: "'Monoton', cursive" },
  { title: "Bohemian Rhapsody", fontFamily: "'Playfair Display', serif" },
  { title: "back to black", fontFamily: "'Times New Roman', Times, serif" }, 
];

const LyricsView = ({ 
  lyrics, activeIndex, onSeek, isMobile, focusMode, currentTime, isLight, trackTitle 
}) => {
  const scrollRef = useRef(null);
  const lineRefs = useRef([]);
  
  const activeTrackTheme = TRACK_STYLES.find(t => t.title.toLowerCase() === trackTitle?.toLowerCase());
  const customFont = activeTrackTheme ? activeTrackTheme.fontFamily : "SF Pro Display, sans-serif";

  const isGlobalSpecial = lyrics[activeIndex]?.special;

  const textColor = isLight ? "#000000" : "#ffffff";
  const passedColor = isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.75)";
  const upcomingColor = isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)";
  const shadowValue = isLight ? "0 0 15px rgba(0,0,0,0.15)" : "0 0 15px rgba(255,255,255,0.5)";

  useEffect(() => {
    const activeEl = lineRefs.current[activeIndex];
    const container = scrollRef.current;
    if (activeEl && container) {
      requestAnimationFrame(() => {
        const targetScroll = activeEl.offsetTop - (container.clientHeight / 2) + (activeEl.clientHeight / 2);
        container.scrollTo({ top: targetScroll, behavior: "smooth" });
      });
    }
  }, [activeIndex, focusMode]);

  if (!lyrics || lyrics.length === 0) return null;

  return (
    <Box
      ref={scrollRef}
      sx={{
        width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden", position: "relative",
        px: isMobile ? 4 : 8, 
        "&::-webkit-scrollbar": { display: "none" }, 
        scrollBehavior: "smooth", WebkitOverflowScrolling: "touch",
      }}
    >
      <Box sx={{ height: "45vh" }} />
      {lyrics.map((line, i) => {
        const isActive = i === activeIndex;
        const isRight = line.right; 
        let opacityValue = (isGlobalSpecial || focusMode) 
          ? (isActive ? 1 : 0) 
          : (i < activeIndex - 3 ? 0 : isActive ? 1 : i < activeIndex ? 0.3 : 0.2);
        
        return (
          <Box
            key={`${line.time}-${i}`} 
            ref={(el) => { lineRefs.current[i] = el; }} 
            onClick={() => onSeek(line.time)}
            sx={{ 
              width: "100%", minHeight: isMobile ? 60 : 80, display: "flex", alignItems: "center", cursor: "pointer", 
              mb: 3, opacity: opacityValue, transition: "opacity 0.8s cubic-bezier(0.33, 1, 0.68, 1)", 
              justifyContent: isRight ? "flex-end" : "flex-start" 
            }}
          >
            <Typography 
              sx={{
                fontFamily: customFont, fontSize: isMobile ? "1.8rem" : "2.8rem", fontWeight: 900, 
                color: textColor, lineHeight: 1.2, letterSpacing: "-0.01em", 
                width: "auto", maxWidth: isMobile ? "95%" : "85%", display: "flex", flexWrap: "wrap",
                textAlign: isRight ? "right" : "left", 
                transform: isActive ? "scale(1.15)" : "scale(0.95)",
                transformOrigin: isRight ? "right center" : "left center",
                transition: "transform 1s cubic-bezier(0.33, 1, 0.90, 1), filter 0.5s ease",
                filter: isActive ? "none" : "blur(2.5px)",
              }}
            >
              {line.words ? (
                line.words.map((w, wIndex) => {
                  const nextWordStart = line.words && line.words[wIndex + 1] ? line.words[wIndex + 2].start : Infinity;
                  const isWordActive = isActive && currentTime >= w.start && currentTime < nextWordStart;
                  const isWordPassed = isActive && currentTime >= nextWordStart;
                  
                  return (
                    <Box
                      key={wIndex} component="span"
                      sx={{
                        display: "inline-block", whiteSpace: "pre", transition: "color 0.3s ease, text-shadow 0.6s ease", 
                        color: isWordActive ? textColor : isWordPassed ? passedColor : upcomingColor,
                        textShadow: isWordActive ? shadowValue : "none", mr: isMobile ? "0.35rem" : "0.5rem", 
                      }}
                    >
                      {w.word}
                    </Box>
                  );
                })
              ) : (
                <Box component="span" sx={{ color: isActive ? textColor : "inherit" }}>{line.text}</Box>
              )}
            </Typography>
          </Box>
        );
      })}
      <Box sx={{ height: "55vh" }} />
    </Box>
  );
};

const QueueModal = ({ open, onClose, queue, removeFromQueue, playTrack, activePlaylist }) => (
  <Dialog 
    open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ zIndex: 10000 }}
    PaperProps={{ sx: { bgcolor: '#111', borderRadius: 4, backgroundImage: 'none' } }}
  >    
    <DialogTitle sx={{ bgcolor: '#000', color: '#fff', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      Очередь ({queue.length})
      <IconButton onClick={onClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent sx={{ p: 0 }}>
      {queue.length === 0 ? (
        <Typography sx={{ p: 4, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Очередь пуста</Typography>
      ) : (
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {queue.map((t, i) => (
            <Box
              key={t._id || i}
              sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: '0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
              onClick={() => { playTrack(t, activePlaylist, { clearQueue: false }); removeFromQueue(t._id); onClose(); }}
            >
              <Avatar src={t.cover || "/1.png"} variant="rounded" sx={{ width: 50, height: 50, mr: 2 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }} noWrap>{t.title}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }} noWrap>{t.genre}</Typography>
              </Box>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeFromQueue(t._id); }} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#ff4d4d' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </DialogContent>
  </Dialog>
);

// --- ПОЛНОЭКРАННЫЙ ЕДИНЫЙ ПЛЕЕР (НЕТРОНУТЫЙ) ---
export const FullScreenPlayer = ({ 
  open, onClose, track, isPlaying, togglePlay, currentTime, duration, onSeek, onNext, onPrev, 
  lyrics, activeIndex, lyricsMode, setLyricsMode, queue, removeFromQueue, playTrack, activePlaylist, 
  showQueue, setShowQueue, isMobile
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [focusMode, setFocusMode] = useState(false); 
  const hasLyrics = lyrics && lyrics.length > 0;
  
  const isDolby = useMemo(() => track && DOLBY_TRACKS.some(t => t.toLowerCase() === track.title?.toLowerCase()), [track]);
  const solidInfo = useMemo(() => track ? SOLID_BG_TRACKS.find(t => t.title.toLowerCase() === track.title?.toLowerCase()) : null, [track]);

  const extractedColors = useImageColors(track?.cover);

  const isSolidBg = !!solidInfo;
  const bgColor = solidInfo?.color || "#000000";
  
  const isLight = isSolidBg && checkIsLight(bgColor);
  const primaryColor = isLight ? "#000000" : "#ffffff";
  const secondaryColor = isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";
  const btnBgColor = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)";

  useEffect(() => { if (!isSeeking) setSliderValue(currentTime); }, [currentTime, isSeeking]);

  if (!open || !track) return null;

  return (
    <Slide direction="up" in={open} timeout={400}>
      <Box sx={{ 
        position: "fixed", inset: 0, height: "100dvh", zIndex: 9999, 
        display: "flex", flexDirection: "column", 
        bgcolor: isLight ? bgColor : "#000", transition: "background-color 0.8s ease",
        overflow: "hidden" 
      }}>
        <AnimatedMeshBackground 
          colors={extractedColors} isLyricsMode={lyricsMode && hasLyrics} 
          focusMode={focusMode && lyricsMode} isSolid={isSolidBg} solidColor={bgColor} 
        />
        
        {/* Header */}
        <Box sx={{ pt: "env(safe-area-inset-top)", px: 2, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 20, mt: 1.5 }}>
          <IconButton onClick={onClose} sx={{ color: primaryColor, bgcolor: btnBgColor, transition: "0.3s" }}>
            <DownIcon />
          </IconButton>
          
          <Box sx={{ display: "flex", gap: 1 }}>
            {queue.length > 0 && (
              <IconButton onClick={() => setShowQueue(!showQueue)} sx={{ color: primaryColor, bgcolor: btnBgColor, position: 'relative' }}>
                <QueueIcon />
                <Typography sx={{ fontSize: 10, position: 'absolute', top: 2, right: 4, color: '#ed5d19', fontWeight: 'bold' }}>
                  {queue.length}
                </Typography>
              </IconButton>
            )}
            {lyricsMode && hasLyrics && (
              <IconButton onClick={() => setFocusMode(!focusMode)} sx={{ bgcolor: btnBgColor, color: focusMode ? "#ed5d19" : primaryColor, transition: "0.3s" }}>
                {focusMode ? <CenterFocusStrong /> : <CenterFocusWeak />}
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, px: 2, display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, overflow: "hidden", pb: "env(safe-area-inset-bottom)" }}>
          <Box sx={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ 
              width: "85%", maxWidth: "500px", aspectRatio: "1/1", transition: "all 0.6s cubic-bezier(0.33, 1, 0.68, 1)", 
              opacity: (lyricsMode && hasLyrics) ? 0 : 1, transform: (lyricsMode && hasLyrics) ? "scale(0.6) translateY(-100px)" : "scale(1) translateY(0)", 
              position: (lyricsMode && hasLyrics) ? "absolute" : "relative", pointerEvents: (lyricsMode && hasLyrics) ? "none" : "auto"
            }}>
               <Box 
                component="img" src={track.cover || "/1.png"} 
                sx={{ 
                  width: "100%", height: "100%", borderRadius: isSolidBg ? 0 : 3, 
                  objectFit: "cover", boxShadow: isSolidBg ? "none" : "0 25px 50px rgba(0,0,0,0.6)", 
                  border: "none", outline: "none", transition: "all 0.5s ease"
                }} 
              />
            </Box>
            {hasLyrics && (
              <Box sx={{ 
                position: "absolute", inset: 0, opacity: lyricsMode ? 1 : 0, 
                pointerEvents: lyricsMode ? "auto" : "none", transition: "opacity 0.6s ease", 
                maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)", 
                WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)" 
              }}>
                <LyricsView lyrics={lyrics} activeIndex={activeIndex} onSeek={onSeek} isMobile={isMobile} focusMode={focusMode} currentTime={currentTime} isLight={isLight} trackTitle={track?.title}  />
              </Box>
            )}
          </Box>

          {/* Controls Area */}
          <Box sx={{ mb: 4, px: 2, zIndex: 10, maxWidth: "600px", margin: "0 auto", width: "100%" }}>
            {lyricsMode && hasLyrics ? (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
                   <Box component="img" src={track.cover || "/1.png"} sx={{ width: 48, height: 48, borderRadius: 1, objectFit: "cover" }} />
                   <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: primaryColor, display: 'flex', alignItems: 'center', gap: 0.5 }} noWrap>
                        {track.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: secondaryColor }} noWrap>{track.genre}</Typography>
                   </Box>
                </Box>
                <IconButton onClick={() => setLyricsMode(false)} sx={{ bgcolor: btnBgColor, color: primaryColor, ml: 2, transition: "0.3s" }}>
                  <LyricsIcon />
                </IconButton>
              </Box>
            ) : (
              <>
               <Box sx={{ display: 'flex', justifyContent:'space-between' }}>
                   <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: primaryColor, mb: 0.5, transition: "color 0.5s"}}>
                    {track.title}
                  </Typography>
                  <Typography variant="h6" sx={{ color: secondaryColor, transition: "color 0.5s", mb: 1 }} noWrap>
                    {track.genre}
                  </Typography>
                </Box>
              </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, opacity: 0.7,mb:0 }}>
                    {isDolby ? (
                      <>
                        <SiDolby size={20} color={secondaryColor} />
                        <Typography variant="caption" sx={{ color: secondaryColor, fontWeight: 500, letterSpacing: 1.5,  fontSize: '15px',mt:0.1,ml:0.5 }}>
                          Dolby Atmos
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" sx={{ color: secondaryColor, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: '11px', border: `1px solid ${secondaryColor}`, px: 1, py: 0.3, borderRadius: 1 }}>
                        Высокое качество
                      </Typography>
                    )}
                  </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="caption" sx={{ color: secondaryColor, minWidth: 35 }}>{formatTime(sliderValue)}</Typography>
                  <AppleSlider 
                    value={sliderValue} max={duration || 1} sx={{ color: primaryColor }} 
                    onChange={(_, v) => { setIsSeeking(true); setSliderValue(Array.isArray(v) ? v[0] : v); }} 
                    onChangeCommitted={(_, v) => { onSeek(Array.isArray(v) ? v[0] : v); setIsSeeking(false); }} 
                  />                  
                  <Typography variant="caption" sx={{ color: secondaryColor, minWidth: 35 }}>{formatTime(duration)}</Typography>
                </Stack>
                
                <Stack direction="row" justifyContent="center" spacing={1} alignItems="center" sx={{ mt: 3, position: 'relative' }}>
                   <IconButton onClick={onPrev} sx={{ color: primaryColor }}><PreviousIcon sx={{ fontSize: 45 }} /></IconButton>
                   <IconButton onClick={togglePlay} sx={{ color: primaryColor, width: 70, height: 70, bgcolor: 'transparent' }}>
                        {isPlaying ? <FaPause size={30} /> : <FaPlay size={30} style={{ marginLeft: 4 }} />}
                   </IconButton>
                   <IconButton onClick={onNext} sx={{ color: primaryColor }}><NextIcon sx={{ fontSize: 45 }} /></IconButton>
                   
                   {hasLyrics && (
                     <IconButton onClick={() => setLyricsMode(true)} sx={{ color: secondaryColor, position: 'absolute', right: 0 }}>
                       <LyricsIcon />
                     </IconButton>
                   )}
                </Stack>
              </>
            )}
          </Box>
        </Box>

        <QueueModal open={showQueue} onClose={() => setShowQueue(false)} queue={queue} removeFromQueue={removeFromQueue} playTrack={playTrack} activePlaylist={activePlaylist} />
      </Box>
    </Slide>
  );
};

// --- ГЛАВНЫЙ КОМПОНЕНТ С REDUX ---
const AudioPlayer = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Достаем состояния плеера из Redux (как в старом файле)
  const { activePlaylist, currentIndex, isPlaying } = useSelector((s) => s.player);
  const track = activePlaylist && currentIndex != null ? activePlaylist[currentIndex] : null;

  // Очередь не была предусмотрена в старом Redux, делаем пустые заглушки, чтобы FullScreenPlayer работал и не падал
  const queue = [];
  const removeFromQueue = () => {};
  const playTrack = () => {};

  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const wetGainRef = useRef(null); 
  const bassBoostNodeRef = useRef(null);
  const masterGainRef = useRef(null); 

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullOpen, setIsFullOpen] = useState(false);
  const [lyricsMode, setLyricsMode] = useState(false); 
  const [volume, setVolume] = useState(1);
  const [showQueue, setShowQueue] = useState(false);
  
  const [bassBoost] = useState(5); 
  const [isSpatial] = useState(true);

  const currentPercentage = duration ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    if (audioRef.current && !masterGainRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const lyrics = useMemo(() => {
    if (!track) return [];
    const title = track.title?.toLowerCase() || "";
    if (title.includes("bohemian rhapsody") || title.includes("рапсодия")) return bohemianRhapsodyLyricsRu;
    if (title.includes("great pretender") || title.includes("притворщик")) return greatPretenderLyricsRu;
    if (title.includes("no tomorrow") || title.includes("завтра не наступит")) return loveMeLikeNoTomorrowLyrics;
    if (title.includes("and i love her") || title.includes("люблю её")) return andILoveHerLyricsRu;
    if (title.includes("strawberry")) return strawberryFieldsLyrics;
    if (title.includes("standing")) return stillStandingLyrics;
    if (title.includes("с тобой")) return atomLyrics;
    if (title.includes("быть!")) return serovLyrics;
    if (title.includes("нежная") || title.includes("gentle")) return gentleLyrics;
    if (title.includes("step")) return stepLyrics;
    if (title.includes("brother louie") || title.includes("чучело")) return chuCheloLyrics;
    if (title.includes("slightly mad") || title.includes("безумен")) return slightlyMadLyrics;
    if (title.includes("secret")) return doYouWantToKnowASecretLyrics;
    if (title.includes("help")) return helpLyrics;
    if (title.includes("don't stop me now") || title.includes("не останавливай меня сейчас")) return dontStopMeNowLyricsRu;
    if (title.includes("europapa") || title.includes("europe")) return europapaLyrics;
    if (title.includes("careless whisper") || title.includes("careless")) return carelessWhisperLyrics;
    if (title.includes("champions") || title.includes("долгам")) return championsLyricsRu;
    if (title.includes("the winner takes it all") || title.includes("winner takes it all")) return abbaLyrics;
    if (title.includes("rocket man") || title.includes("rocketman")) return rocketManLyrics;
    if (title.includes("parislove") || title.includes("париж")) return parisLoveLyrics;
    if (title.includes("ход конем") || title.includes("комбинация")) return combinationLyrics;
    if (title.includes("imagine") || title.includes("представь")) return imagineLyricsRu;
    if (title.includes("dark red") || title.includes("темно!красный")) return darkRedLyricsRu;
    if (title.includes("богатырская сила") || title.includes("богатырская")) return bogatyrForceLyrics;
    if (title.includes("24 на 7")) return face;
    if (title.includes("hit#2")) return rueMontmartreLyricsRu;
    if (title.includes("go with me")) return goLive;
    if (title.includes("асфальт")) return asphaltLyrics;
    if (title.includes("trust me")) return helpMeDownLyricsRu;
    if (title.includes("лабиринт")) return faceVihodiLyrics;
    if (title.includes("перехожу эту грань (normal)")) return footjobLyrics;
    if (title.includes("4:30")) return polPyatogoLyrics;
    if (title.includes("save your tears")) return saveYourTearsLyricsRu;
    if (title.includes("спасательный круг")) return faceMneNeNadoLyrics;
    if (title.includes("vlone")) return faceVloneLyrics;
    if (title.includes("mary on a cross") || title.includes("mary on a")) return maryOnACrossLyrics;
    // Оставшиеся маппинги (сохранены из твоих файлов)
    if (title.includes("i want it all")) return iWantItAllPurePower;
    if (title.includes("motorola")) return motorolaPure;
    if (title.includes("карабас")) return buratinoPure;
    if (title.includes("лирика")) return lirikaLyrics;
    if (title.includes("i want to break free")) return breakFreeRussian;
    if (title.includes("rap god")) return rapGodPure;
    if (title.includes("billie jean")) return billieJeanLyricsRU;
    if (title.includes("you are not alone")) return youAreNotAloneFullLyricsRU;
    if (title.includes("love of my life")) return loveOfMyLifeOriginalRU;
    if (title.includes("cheri cheri lady")) return cheriCheriLadyLyricsRU;
    if (title.includes("стыцамен")) return stytsamenLyrics;
    if (title.includes("geronimo cadillac")) return geronimosCadillacLyricsRU;
    if (title.includes("mockingbird")) return mockingbirdPure;
    if (title.includes("рэйман")) return rayBanPure;
    if (title.includes("caramel")) return caramelPure;
    if (title.includes("как на войне")) return kakNaVoyneLyrics;
    if (title.includes("earth song")) return earthSongLyricsOriginal;
    if (title.includes("лишь до утра")) return lishDoUtraDark;
    if (title.includes("candle in the wind (1997)")) return candleInTheWindOriginal;
    if (title.includes("sonne")) return sonneLyricsFull;
    if (title.includes("happy nation")) return happyNationLyrics;
    if (title.includes("селфхарм")) return selfharmLyrics;
    if (title.includes("i was made for lovin you")) return kissLyrics;
    if (title.includes("п. м. м. л.")) return zemfiraLyrics;
    if (title.includes("the show must go on")) return showMustGoOnLyrics;
    if (title.includes("крошка моя")) return kroshkaMoyaLyrics;
    if (title.includes("superman")) return supermanPure;
    if (title.includes("back to black")) return lilyAllenLyrics;
    if (title.includes("somebody's watching me")) return somebodyWatchingMeLyricsRU;
    if (title.includes("these are the days of our lives")) return daysOfOurLivesLyricsRU;
    if (title.includes("money trees (feat. jay rock)")) return moneyTreesPure;
    if (title.includes("not allowed")) return joyDivisionLyricsRu;
    if (title.includes("fly-day chinatown")) return flyDayChinatownLyrics;
    if (title.includes("wicked game")) return wickedGameLyrics;
    if (title.includes("дым сигарет с ментолом")) return mentholSmokeLyrics;
    if (title.includes("а знаешь, всё ещё будет")) return allesLyrics;
    if (title.includes("kunst und musik")) return lieblingsfachLyrics;  
    if (title.includes("hey jude")) return heyJudeLyrics;
    if (title.includes("innuendo")) return innuendoLyricsRU;
    if (title.includes("дыхание")) return nauLyrics;
    if (title.includes("moskau")) return moskauLyrics;
    if (title.includes("во время дождя")) return iInventedYouLyrics;
    if (title.includes("there is a light that never goes")) return theSmithsLyrics;
    if (title.includes("лепестками слёз(slowed)")) return petalsOfTearsLyrics;
    if (title.includes("в последний раз")) return lastTimeLyrics;
    if (title.includes("запахло весной")) return springSmellLyrics;
    if (title.includes("я свободен")) return freeLyrics;
    if (title.includes("who is she immortal (slowed)")) return whoIsSheLyrics;
    if (title.includes("щека на щеку")) return mzlffLyrics;
    if (title.includes("ведьма и осёл")) return vedmaPure;
    if (title.includes("чумачечая весна")) return springLyrics;
    if (title.includes("арлекино")) return arlekinoPure;

    return track.lyrics || [];
  }, [track]);

  const activeIndex = useMemo(() => {
    if (!lyrics.length) return 0;
    const offset = 0.2;
    for (let i = 0; i < lyrics.length; i++) {
        const cur = lyrics[i].time, next = lyrics[i+1]?.time || Infinity;
        if ((currentTime + offset) >= cur && (currentTime + offset) < next) return i;
    }
    return 0;
  }, [lyrics, currentTime]);

  // --- MEDIA SESSION METADATA & CONTROLS ---
  useEffect(() => {
    if (!track || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: track.title,
      artist: track.genre + " - AtomGlide" || 'Unknown Artist',
      album: 'AtomGlide Music',
      artwork: [
        { src: track.cover || '/1.png', sizes: '96x96', type: 'image/png' },
        { src: track.cover || '/1.png', sizes: '128x128', type: 'image/png' },
        { src: track.cover || '/1.png', sizes: '512x512', type: 'image/png' },
      ]
    });
    navigator.mediaSession.setActionHandler('play', () => dispatch(togglePlay()));
    navigator.mediaSession.setActionHandler('pause', () => dispatch(togglePlay()));
    navigator.mediaSession.setActionHandler('previoustrack', () => dispatch(prevTrack()));
    navigator.mediaSession.setActionHandler('nexttrack', () => dispatch(nextTrack()));
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (audioRef.current && details.seekTime !== undefined) {
        audioRef.current.currentTime = details.seekTime;
        setCurrentTime(details.seekTime);
      }
    });
    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
  }, [track, dispatch]);

  useEffect(() => {
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  useEffect(() => {
    const ms = navigator.mediaSession;
    if (!ms || !ms.setPositionState || !audioRef.current) return;
    const isVaildNumber = (num) => typeof num === 'number' && Number.isFinite(num) && num >= 0;
    if (isVaildNumber(currentTime) && isVaildNumber(duration) && duration > 0) {
      try {
        const safePosition = Math.min(currentTime, duration);
        ms.setPositionState({ duration: duration, playbackRate: Math.max(audioRef.current.playbackRate || 1, 0), position: safePosition });
      } catch (error) { console.warn("MediaSession setPositionState failed:", error); }
    }
  }, [currentTime, duration]);

  // --- ИНИЦИАЛИЗАЦИЯ AUDIO CONTEXT ---
  useEffect(() => {
    if (!audioRef.current || audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      
      const source = ctx.createMediaElementSource(audioRef.current);
      
      const bBoost = ctx.createBiquadFilter();
      bBoost.type = "lowshelf"; bBoost.frequency.value = 150; bBoost.gain.value = bassBoost;
      bassBoostNodeRef.current = bBoost;
      
      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      const delay = ctx.createDelay();
      wetGainRef.current = wetGain;
      
      delay.delayTime.value = 0.025; 
      wetGain.gain.value = isSpatial ? 0.7 : 0;
      
      const masterGain = ctx.createGain();
      masterGainRef.current = masterGain;

      source.connect(bBoost); bBoost.connect(dryGain); bBoost.connect(delay);
      delay.connect(wetGain); 
      
      dryGain.connect(masterGain); 
      wetGain.connect(masterGain);
      
      masterGain.connect(ctx.destination);
    } catch (e) { console.error("Audio Context Error:", e); }
  }, [bassBoost, isSpatial]);

  // --- ЛОГИКА ПЛАВНОГО ЗАТУХАНИЯ ---
  const fadeAudio = useCallback((fadeIn, fadeDuration = 0.5) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const gainNode = masterGainRef.current;
    const now = ctx.currentTime;
    
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    
    if (fadeIn) {
      gainNode.gain.linearRampToValueAtTime(1, now + fadeDuration);
    } else {
      gainNode.gain.linearRampToValueAtTime(0.001, now + fadeDuration); 
    }
  }, []);

  // --- ФОРМИРОВАНИЕ URL КАК В СТАРОМ ФАЙЛЕ ---
  useEffect(() => {
    if (track && audioRef.current) {
      // 1. Определяем базовый URL (если локалка — берем 4444, если нет — домен)
      const baseUrl = window.location.hostname === 'localhost' 
        ? 'https://atomglidedev.ru' 
        : 'https://atomglidedev.ru';

      // 2. Склеиваем полный путь
      const fullSrc = `${baseUrl}/stream/${track.trackname || track.src}`;

      // 3. Устанавливаем в плеер
      if (audioRef.current.src !== fullSrc) {
        audioRef.current.src = fullSrc;
        console.log("Играю трек из:", fullSrc);
        audioRef.current.load();
        
        if (isPlaying) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) playPromise.then(() => fadeAudio(true, 0.4)).catch(console.error);
        }
      }
    }
  }, [track, isPlaying, fadeAudio]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audioRef.current.play()
        .then(() => fadeAudio(true, 0.4))
        .catch(() => {});
    } else {
      fadeAudio(false, 0.4);
      setTimeout(() => {
        if (audioRef.current && !isPlaying) {
          audioRef.current.pause();
        }
      }, 400); 
    }
  }, [isPlaying, fadeAudio]);

  if (!track) return null;

  // --- ОБРАБОТКА ОШИБОК ИЗ СТАРОГО ФАЙЛА ---
  const handleAudioError = (e) => {
    const currentSrc = e.currentTarget.src;
    const baseUrlLocal = 'https://atomglidedev.ru';
    const baseUrlProd = 'https://atomglidedev.ru';

    // Если ошибка произошла при попытке загрузить с локалхоста
    if (currentSrc.includes(baseUrlLocal)) {
      console.warn("Локальный файл не найден, переключаюсь на продакшн...");
      const fallbackSrc = currentSrc.replace(baseUrlLocal, baseUrlProd);
      
      // Устанавливаем запасной URL
      audioRef.current.src = fallbackSrc;
      
      // Пробуем воспроизвести снова, если плеер был в режиме игры
      if (isPlaying) {
        audioRef.current.play().then(() => fadeAudio(true, 0.4)).catch(console.error);
      }
    } else {
      console.error("Ошибка воспроизведения даже на удаленном сервере:", e);
    }
  };

  return (
    <>
      <audio 
        ref={audioRef} crossOrigin="anonymous" 
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => { 
          fadeAudio(false, 0.2);
          dispatch(nextTrack()); // Использование Redux!
          setTimeout(() => { 
            if (audioRef.current) {
              audioRef.current.play().then(() => fadeAudio(true, 0.5)).catch(() => {}); 
            }
          }, 200); 
        }}
        onError={handleAudioError} // <-- Обработчик из старого файла
      />


<Box sx={{ 
  position: "fixed", 
  bottom: isMobile ? 85 : 40, 
  left: isMobile ? 12 : "50%", 
  right: isMobile ? 12 : "auto", 
  transform: isMobile ? "none" : "translateX(-50%)", 
  width: isMobile ? "auto" : 650, 
  height: 70, 
  
  // --- ЧИСТОЕ ЖИДКОЕ СТЕКЛО (без градиента прогресса) ---
  background: "rgba(255, 255, 255, 0.15)", 
  backdropFilter: "blur(25px)", 
  WebkitBackdropFilter: "blur(25px)", 
  border: "1px solid rgba(255, 255, 255, 0.2)", 
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)", 
  borderRadius: "50px", 
  // ------------------------------------------------------

  zIndex: 9000, 
  display: 'flex', 
  alignItems: 'center', 
  overflow: 'hidden',
}}>
  {/* Невидимый ползунок на весь плеер для перемотки */}
  <Slider 
    value={currentTime} min={0} max={duration || 1} 
    onChange={(_, v) => { if(audioRef.current) audioRef.current.currentTime = v; setCurrentTime(v); }} 
    sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, zIndex: 1, cursor: 'pointer', '& .MuiSlider-thumb': { display: 'none' } }} 
  />

  <Box 
    onClick={() => setIsFullOpen(true)}
    sx={{ position: 'relative', zIndex: 2, flex: 1, display: "flex", alignItems: "center", px: 2, height: '100%', cursor: 'pointer', pointerEvents: 'auto' }}
  >
    {/* Кнопки управления */}
    <Stack direction="row" spacing={1} sx={{ position: 'relative', zIndex: 10, pr: 2 }}>
      <IconButton onClick={(e) => { e.stopPropagation(); dispatch(prevTrack()); }} sx={{ color: "white", '&:hover': { background: 'rgba(255,255,255,0.1)' } }}><PreviousIcon /></IconButton>
      <IconButton onClick={(e) => { e.stopPropagation(); dispatch(togglePlay()); }} sx={{ color: "white", '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
        {isPlaying ? <FaPause size={20} color="white" /> : <FaPlay size={20} color="white" />}
      </IconButton>
      <IconButton onClick={(e) => { e.stopPropagation(); dispatch(nextTrack()); }} sx={{ color: "white", '&:hover': { background: 'rgba(255,255,255,0.1)' } }}><NextIcon /></IconButton>
    </Stack>
    
    {/* Внутренний полупрозрачный квадрат с обложкой и инфой */}
    <Box sx={{
      bgcolor: 'rgba(0, 0, 0, 0.4)', // Сделали квадрат полупрозрачным
      display: 'flex',
      alignItems: 'center',
      width:'60%',
      // Растягиваем на всё оставшееся место
      position: 'relative',
      overflow: 'hidden', // Чтобы углы прогресс-бара не торчали
      p: 1,
      pr: 2,
      borderRadius: 2,
      // --- ПРОГРЕСС-БАР КАК BORDER BOTTOM ---
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '2px', // Толщина "бордера"
        width: `${currentPercentage}%`,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Цвет полоски (можно поменять на твой оранжевый #ed5d19)
        transition: 'width 0.1s linear'
      }
    }}>
      <Box component="img" src={track.cover || "/1.png"} sx={{ width: 38, height: 38, borderRadius: "5px", objectFit: 'cover' }} />
      
      {/* Контейнер для текста с flex: 1, чтобы отодвинуть Dolby вправо */}
      <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <Typography 
          noWrap 
          fontWeight={600} 
          fontSize="0.75rem" 
          color="white" 
          sx={{ lineHeight: 1.2 }}
        >
          {track.title}
        </Typography>
        
        <Typography 
          variant="caption" 
          color="rgba(255,255,255,0.6)" 
          noWrap 
          sx={{ lineHeight: 1.2, marginTop: '4px' }}
        >
          {track.genre}
        </Typography>
      </Box>

      {/* Логотип Dolby прижат к правому краю */}
      {DOLBY_TRACKS.some(t => t.toLowerCase() === track.title?.toLowerCase()) && (
        <SiDolby style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginLeft: '12px', flexShrink: 0 }} />
      )}

    </Box>
      <IconButton onClick={() => setLyricsMode(true)} sx={{ color: 'white',ml:3 }}>
                       <LyricsIcon />
                     </IconButton>
  </Box>
</Box>

      {/* Используем FullScreenPlayer из нового дизайна, но передаем диспатчи Redux */}
      <FullScreenPlayer 
        open={isFullOpen} onClose={() => setIsFullOpen(false)} 
        track={track} isPlaying={isPlaying} togglePlay={() => dispatch(togglePlay())} 
        currentTime={currentTime} duration={duration} onSeek={(t) => { if(audioRef.current) audioRef.current.currentTime = t; setCurrentTime(t); }} 
        onNext={() => dispatch(nextTrack())} onPrev={() => dispatch(prevTrack())} 
        lyrics={lyrics} activeIndex={activeIndex} lyricsMode={lyricsMode} setLyricsMode={setLyricsMode}
        queue={queue} removeFromQueue={removeFromQueue} playTrack={playTrack} activePlaylist={activePlaylist}
        showQueue={showQueue} setShowQueue={setShowQueue} isMobile={isMobile}
      />
    </>
  );
};

export default AudioPlayer;