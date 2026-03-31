import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Box, useMediaQuery, Fade } from '@mui/material';
import { useUser } from '../components/UserProvider';
import { lazyRetry } from '../utils/lazyRetry';

// Компоненты окружения
import Sitebar from '../sitebar';
import WidgetMain from '../widget/widget';
import AudioPlayer from '../page/music/play'; 

// Статические импорты
import PlaylistPage from '../page/music/PlaylistPage'; 
import PinterestGallery from '../page/music/PinterestGallery';

// Ленивая загрузка страниц
const JournalList = React.lazy(() => lazyRetry(() => import('../journal/page.jsx')));
const FullJournal = React.lazy(() => lazyRetry(() => import('../journal/fulljornl.js')));
const Gemini = React.lazy(() => lazyRetry(() => import('../page/gemini/index.jsx')));
const Main = React.lazy(() => lazyRetry(() => import('../page/main/main')));
const Store = React.lazy(() => lazyRetry(() => import('../page/apps/store.jsx')));
const AtomsClicker = React.lazy(() => lazyRetry(() => import('../page/apps/game.jsx')));
const MobileSettings = React.lazy(() => lazyRetry(() => import('../widget/setting.jsx')));
const Music = React.lazy(() => lazyRetry(() => import('../page/music/music.jsx')));
const Reting = React.lazy(() => lazyRetry(() => import('../page/reting/index.jsx')));
const ChannelsList = React.lazy(() => lazyRetry(() => import("../page/channel/ChannelsList")));
const ChannelPage = React.lazy(() => lazyRetry(() => import("../page/channel/ChannelPage")));
const Wallet = React.lazy(() => lazyRetry(() => import('../page/wallet')));
const Profile = React.lazy(() => lazyRetry(() => import('../page/profile/Profile')));
const ChannelCreatePage = React.lazy(() => lazyRetry(() => import("../page/channel/CreateChannelPage")));
const Channel = React.lazy(() => lazyRetry(() => import('../page/channel/channel.jsx')));
const LoginPage = React.lazy(() => lazyRetry(() => import('../page/login')));
const RegistrationPage = React.lazy(() => lazyRetry(() => import('../page/registration')));
const CommentsStreamPage = React.lazy(() => lazyRetry(() => import('../page/comments-stream')));
const FullPost = React.lazy(() => lazyRetry(() => import('../page/main/post/FullPost.jsx')));
const SearchPage = React.lazy(() => lazyRetry(() => import('../page/search/SearchPage.jsx')));
const SettingsPage = React.lazy(() => lazyRetry(() => import('../page/settings/SettingsPage.jsx')));
const ThemeSelector = React.lazy(() => lazyRetry(() => import('../page/settings/ThemeSelector.jsx')));
const SubscriptionPage = React.lazy(() => lazyRetry(() => import('../page/subscription/SubscriptionPage.jsx')));

const LoadingFallback = () => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Fade in={visible} timeout={800}>
      <Box sx={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100vh",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          alignItems: "center", backgroundColor: "#000000", color: "#fff", zIndex: 9999, p: 4,
      }}>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src="/1.png" alt="Logo" style={{ width: "120px", height: "120px", objectFit: "contain" }} />
        </Box>
        <Box sx={{ textAlign: "center", fontSize: "25px", fontWeight: 700, opacity: 0.7, pb: 2 }}>
          AtomGlide
        </Box>
      </Box>
    </Fade>
  );
};

const AppRouter = () => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const location = useLocation();
  const { isLoading } = useUser();
  const baseApiUrl = "https://atomglidedev.ru";

  const isAuthPage = ['/login', '/registration'].includes(location.pathname);

  // --- УЛУЧШЕННАЯ ЛОГИКА СКРЫТИЯ ЭЛЕМЕНТОВ ---

  const shouldHideWidget = useMemo(() => {
    if (isMobile) return true;

    const hideWidgetPaths = [
      '/create-channel', 
      '/settings', 
      '/account', 
      '/journal', 
      '/setting'
    ];

    return hideWidgetPaths.some(path => 
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  }, [location.pathname, isMobile]);

  const shouldHideSidebar = useMemo(() => {
    return location.pathname.startsWith('/gemini');
  }, [location.pathname]);

  if (isLoading) return <LoadingFallback />;

  if (isAuthPage) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      {!shouldHideSidebar && <Sitebar />}

      <Box
        sx={{
          display: "flex",
          gap: shouldHideWidget ? "0px" : "10px",
          justifyContent: 'center',
          maxWidth: "100%",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          minHeight: "100vh",
          px: 0,
          // Добавляем плавный переход для gap, чтобы интерфейс не дергался
          transition: "gap 0.2s ease-in-out"
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/post/:id" element={<FullPost />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/comments" element={<CommentsStreamPage />} />
            <Route path="/forbes" element={<Reting />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/jrnl" element={<JournalList />} />
            <Route path="/journal/:id" element={<FullJournal />} />
            <Route path="/journal" element={<FullJournal />} />

            {/* Группа: Каналы */}
            <Route path="/channels" element={<ChannelsList />} />
            <Route path="/channel" element={<Channel />} /> 
            <Route path="/channel/:id" element={<ChannelPage />} />
            <Route path="/create-channel" element={<ChannelCreatePage />} />

            {/* Группа: Настройки */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/theme" element={<ThemeSelector />} />
            <Route path="/setting" element={<MobileSettings />} />

            {/* Группа: Apps */}
            <Route path="/store" element={<Store />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/message" element={<AtomsClicker />} />
            <Route path="/gemini" element={<Gemini />} />
            
            <Route path="/music" element={<Music />} />        
            <Route path="/playlist/:id" element={<PlaylistPage />} />
            <Route path="/gallery" element={<PinterestGallery />} />
            <Route path="/account/:id" element={<Profile />} />
            <Route path="*" element={<Main />} />
          </Routes>
        </Suspense>

        <AudioPlayer baseApiUrl={baseApiUrl} />

        {/* Виджет рендерится всегда, когда shouldHideWidget === false */}
        {!shouldHideWidget && <WidgetMain />}
      </Box>
    </>
  );
};

export default AppRouter;

// Author: Dmitry Khorov | DK Studio Production | 2026