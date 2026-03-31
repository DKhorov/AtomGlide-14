import PostCreator from './PostCreator';
import PostsList from './PostsList';
import axios from '../../system/axios';
import { useSelector } from 'react-redux';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Typography, useMediaQuery, Avatar, IconButton, LinearProgress, CircularProgress, Button } from '@mui/material';
import { selectUser } from '../../system/redux/slices/getme';
import { useNavigate } from 'react-router-dom';
import { subscribeUserToPush } from '../../system/push-subscribe';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const POSTS_LIMIT = 20;
const FREE_STORIES_LIMIT = 2;

// Компонент для модального окна покупки Atom Plus при создании
const UpgradeStoriesModal = ({ open, onClose, onSubscribe }) => {
  if (!open) return null;
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <Box sx={{
        backgroundColor: '#0a0a0a',
        borderRadius: '28px',
        p: 0,
        maxWidth: '420px',
        width: '90%',
        overflow: 'hidden',
        border: '1px solid rgba(255, 174, 0, 0.3)',
        boxShadow: '0 20px 60px rgba(255, 174, 0, 0.15)',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Градиент фон сверху */}
        <Box sx={{
          background: 'linear-gradient(135deg, rgba(255, 174, 0, 0.2) 0%, rgba(255, 174, 0, 0.05) 100%)',
          p: 3,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255, 174, 0, 0.1) 0%, transparent 70%)',
            animation: 'spin 20s linear infinite'
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography sx={{ 
              fontSize: '60px', 
              mb: 1,
              animation: 'float 3s ease-in-out infinite'
            }}>
            
            </Typography>
            <Typography sx={{ 
              fontSize: '28px', 
              fontWeight: 800, 
              background: 'linear-gradient(135deg, #ffae00 0%, #d3730c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              AtomPro+
            </Typography>
            <Typography sx={{ 
              fontSize: '14px', 
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500
            }}>
              Неограниченные истории
            </Typography>
          </Box>
        </Box>

        {/* Контент */}
        <Box sx={{ p: 3 }}>
          <Typography sx={{ 
            fontSize: '16px', 
            fontWeight: 700, 
            color: '#fff', 
            mb: 2,
            textAlign: 'center'
          }}>
            Создавай истории без ограничений
          </Typography>
          
          <Typography sx={{ 
            fontSize: '13px', 
            color: 'rgba(255, 255, 255, 0.6)',
            mb: 3,
            textAlign: 'center',
            lineHeight: 1.6
          }}>
            У тебя использован лимит историй. Купи подписку и получи полный доступ ко всем возможностям.
          </Typography>

    

          {/* Кнопки */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={onClose} sx={{ 
              flex: 1, 
              py: 1.3, 
              backgroundColor: 'transparent', 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}>
              Думаю нет
            </Button>
            <Button onClick={onSubscribe} sx={{ 
              flex: 1, 
              py: 1.3, 
              background: 'linear-gradient(135deg, #e2e2e2 0%, #ffffff 100%)',
              color: '#000', 
              fontWeight: 700,
              fontSize: '14px',
              borderRadius: '14px',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(255, 174, 0, 0.3)',
              '&:hover': { 
                boxShadow: '0 12px 32px rgba(255, 174, 0, 0.4)',
                transform: 'translateY(-2px)'
              }
            }}>
              Купить за 300 ATM
            </Button>
          </Box>
        </Box>

        {/* Анимация CSS */}
        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Box>
    </div>
  );
};

// Компонент для просмотра историй автора
const StoryViewer = ({ authorStories, currentStoryIndex, onClose, onNextAuthor, onPrevAuthor, onStoryChange }) => {
  const [progress, setProgress] = useState(0);
  const story = authorStories[currentStoryIndex];

  useEffect(() => {
    if (!story) return;
    setProgress(0);
    const durationMs = (story.displayDuration || 15) * 1000;
    const intervalTime = 50;
    const step = (100 / (durationMs / intervalTime));

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (currentStoryIndex < authorStories.length - 1) {
            onStoryChange(currentStoryIndex + 1);
          } else {
            onNextAuthor();
          }
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [story, currentStoryIndex, authorStories, onStoryChange, onNextAuthor]);

  if (!story) return null;

  const handleNext = () => {
    if (currentStoryIndex < authorStories.length - 1) {
      onStoryChange(currentStoryIndex + 1);
    } else {
      onNextAuthor();
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      onStoryChange(currentStoryIndex - 1);
    } else {
      onPrevAuthor();
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.95)' }} onClick={onClose}>
      <Box sx={{
        width: '100%',
        maxWidth: '450px',
        height: { xs: '100vh', sm: '85vh' },
        backgroundColor: '#000',
        borderRadius: { xs: 0, sm: '28px' },
        overflow: 'hidden',
        position: 'relative',
        outline: 'none',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }} onClick={(e) => e.stopPropagation()}>

        {/* Верхняя область */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '16px',
          zIndex: 10,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
        }}>

          {/* Прогресс-бары для каждой истории */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
            {authorStories.map((_, idx) => (
              <div key={idx} style={{
                flex: 1,
                height: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? `${progress}%` : '0%',
                  height: '100%',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  transition: idx === currentStoryIndex ? 'width 0.1s linear' : 'width 0.3s ease'
                }} />
              </div>
            ))}
          </div>

          {/* Блок с юзером */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={story.authorAvatar}
              alt="avatar"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                objectFit: 'cover'
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{
                color: '#fff',
                fontWeight: 600,
                fontSize: '14px',
                fontFamily: '"SF Pro Display", -apple-system, sans-serif',
                lineHeight: '1.2'
              }}>
                {story.authorName}
              </span>
              <span style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 400,
                fontSize: '12px',
                fontFamily: '"SF Pro Display", -apple-system, sans-serif'
              }}>
                AtomGlide.com
              </span>
            </div>

            <button
              onClick={onClose}
              style={{
                marginLeft: 'auto',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: 'none',
                outline: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Изображение истории */}
        <img
          src={story.fileUrl}
          alt="story content"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Кнопки навигации */}
        <button
          onClick={handlePrev}
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            zIndex: 11,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
        >
          <NavigateBeforeIcon fontSize="large" />
        </button>

        <button
          onClick={handleNext}
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            zIndex: 11,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
        >
          <NavigateNextIcon fontSize="large" />
        </button>
      </Box>
    </div>
  );
};

const Main = () => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0); 

  const [stories, setStories] = useState([]);
  const [activeAuthorIndex, setActiveAuthorIndex] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userStoriesCount, setUserStoriesCount] = useState(0);

  const [activeFilter, setActiveFilter] = useState('Все');
  const filters = ['Все', 'Посты', 'Статьи'];
  
  const [journals, setJournals] = useState([]);
  const [loadingJournals, setLoadingJournals] = useState(true);
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Группировка историй по авторам
  const groupedStories = useCallback(() => {
    const grouped = [];
    const authorMap = new Map();

    stories.forEach(story => {
      if (!authorMap.has(story.authorId)) {
        authorMap.set(story.authorId, {
          authorId: story.authorId,
          authorName: story.authorName,
          authorAvatar: story.authorAvatar,
          stories: []
        });
        grouped.push(authorMap.get(story.authorId));
      }
      authorMap.get(story.authorId).stories.push(story);
    });

    return grouped;
  }, [stories]);

  const fetchPosts = useCallback(async (pageToLoad = 1) => { 
    try {
      setLoading(true);
      const { data } = await axios.get('/posts', { params: { page: pageToLoad, limit: POSTS_LIMIT } });
      setPosts(prev => pageToLoad === 1 ? [...data.posts] : [...prev, ...data.posts]);
      setTotalPosts(data.totalPosts || 0);
      setPage(pageToLoad);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  const fetchStories = useCallback(async () => {
    try {
      const { data } = await axios.get('/stories');
      setStories(data);
      // Подсчитываем количество историй текущего пользователя
      const myStories = data.filter(s => s.authorId === user?.id);
      setUserStoriesCount(myStories.length);
    } catch (err) { console.error(err); }
  }, [user?.id]);

  const fetchJournals = useCallback(async () => {
    try {
      setLoadingJournals(true);
      const { data } = await axios.get('/dev/Journal/all');
      setJournals(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); } finally { setLoadingJournals(false); }
  }, []);

  useEffect(() => {
    fetchPosts(1);
    fetchStories();
    fetchJournals();
    if (user) subscribeUserToPush();
  }, [fetchPosts, fetchStories, fetchJournals, user]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await Promise.all([
      fetchPosts(1),
      fetchStories(),
      fetchJournals()
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleFileUpload = async (e) => {
    // Проверяем лимит историй при создании
    if (userStoriesCount >= FREE_STORIES_LIMIT && !user?.isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('media', file);
    formData.append('hasMusic', 'false'); 

    try {
      setUploadingStory(true);
      await axios.post('/stories/upload', formData);
      fetchStories(); 
    } catch (err) { alert("Ошибка загрузки"); } finally { setUploadingStory(false); }
  };

  const handlePostCreated = (postData) => {
    const rawPost = postData.post || postData;
    setPosts(prev => [{ ...rawPost, user: rawPost.user || user }, ...prev]);
    setTotalPosts(prev => prev + 1);
  };

  const handleStoryClick = (authorIndex) => {
    setActiveAuthorIndex(authorIndex);
    setCurrentStoryIndex(0);
  };

  const handleStoryChange = (newIndex) => {
    setCurrentStoryIndex(newIndex);
  };

  const handleNextAuthor = () => {
    const grouped = groupedStories();
    if (activeAuthorIndex !== null && activeAuthorIndex < grouped.length - 1) {
      setActiveAuthorIndex(activeAuthorIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      setActiveAuthorIndex(null);
    }
  };

  const handlePrevAuthor = () => {
    if (activeAuthorIndex !== null && activeAuthorIndex > 0) {
      setActiveAuthorIndex(activeAuthorIndex - 1);
      const grouped = groupedStories();
      setCurrentStoryIndex(grouped[activeAuthorIndex - 1].stories.length - 1);
    } else {
      setActiveAuthorIndex(null);
    }
  };

  const closeStoryViewer = () => {
    setActiveAuthorIndex(null);
    setCurrentStoryIndex(0);
  };

  const handleSubscribeClick = () => {
    setShowUpgradeModal(false);
    navigate('/subscription');
  };

  const grouped = groupedStories();
  const currentAuthorData = activeAuthorIndex !== null ? grouped[activeAuthorIndex] : null;
  const currentAuthorStories = currentAuthorData ? currentAuthorData.stories : [];

  return (
    <Box sx={{
      width: isMobile ? '100%' : '700px', height: '100vh',
      overflowY: 'auto', px: 1, '&::-webkit-scrollbar': { display: 'none' }
    }}>
      
      {/* ИСТОРИИ */}
      <Box sx={{ display: 'flex', gap: 2, py: 2, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, ml: 1 }}>
        <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" />
        <Box onClick={() => !uploadingStory && fileInputRef.current.click()} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'pointer', flexShrink: 0 }}>
          <Box sx={{
            width: 68, height: 68, borderRadius: '100px', border: '2px dashed rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)'
          }}>
            {uploadingStory ? <CircularProgress size={20} color="inherit" /> : <AddIcon sx={{ color: '#fff' }} />}
          </Box>
          <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Создать</Typography>
        </Box>

        {grouped.map((authorGroup, idx) => (
          <Box 
            key={authorGroup.authorId} 
            onClick={() => handleStoryClick(idx)}
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'pointer', flexShrink: 0 }}
          >
            <Avatar 
              src={authorGroup.authorAvatar}
              sx={{ 
                width: 68, 
                height: 68, 
                border: '2px solid #ffae00', 
                padding: '2px',
                backgroundColor: 'transparent',
                '& img': { borderRadius: '50%' }
              }} 
            />
            <Typography sx={{ fontSize: '11px', color: '#eee', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {authorGroup.authorName}
            </Typography>
          </Box>
        ))}
      </Box>

      <StoryViewer 
        authorStories={currentAuthorStories} 
        currentStoryIndex={currentStoryIndex}
        onClose={closeStoryViewer}
        onNextAuthor={handleNextAuthor}
        onPrevAuthor={handlePrevAuthor}
        onStoryChange={handleStoryChange}
      />

      <UpgradeStoriesModal 
        open={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        onSubscribe={handleSubscribeClick}
      />

      {/* ПАНЕЛЬ ФИЛЬТРОВ И КНОПКА ОБНОВИТЬ */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2, gap: 2 }}>
        
        <Box sx={{ 
          display: 'flex', position: 'relative', flex: 1, maxWidth: '300px',
          bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)',
          ml: 1,
          borderRadius: '20px', p: 0.5, border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <Box sx={{
            position: 'absolute', top: 4, bottom: 4,
            left: `calc(${filters.indexOf(activeFilter) * 33.33}% + 4px)`,
            width: 'calc(33.33% - 8px)',
            bgcolor: '#fff', borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
            zIndex: 0,
            pointerEvents: 'none'
          }} />

          {filters.map((item) => {
            const isActive = activeFilter === item;
            return (
              <Box
                key={item} 
                onClick={() => setActiveFilter(item)}
                sx={{
                  flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
                  py: 0.8, cursor: 'pointer', position: 'relative', zIndex: 2, 
                }}
              >
                <Typography
                  sx={{
                    fontSize: '14px', fontWeight: isActive ? 600 : 500, 
                    color: isActive ? '#000' : 'rgba(255,255,255,0.6)',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {item}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Box
          onClick={handleRefresh}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1, mr: 1,
            px: 2.5, py: 0.8, fontSize: '14px', fontWeight: 600, cursor: 'pointer', borderRadius: '20px',
            bgcolor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', color: '#fff', 
            transition: 'all 0.2s ease-in-out', border: '1px solid rgba(255, 255, 255, 0.05)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
            opacity: isRefreshing ? 0.7 : 1
          }}
        >
          <AutorenewIcon sx={{ 
            fontSize: '18px', 
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }
          }} />
          <Typography sx={{ fontSize: '14px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
            Обновить
          </Typography>
        </Box>
      </Box>

      {activeFilter !== 'Статьи' && (
        <Box sx={{ mb: 1 }}>
          <PostCreator onPostCreated={handlePostCreated} />
        </Box> 
      )}

      <PostsList 
        posts={posts} 
        journals={journals}
        activeFilter={activeFilter}
        loading={loading || loadingJournals} 
        onDelete={(id) => setPosts(p => p.filter(x => x._id !== id))}   
        onPostUpdate={(upd) => setPosts(p => p.map(x => x._id === upd._id ? upd : x))}
        onLoadMore={() => fetchPosts(page + 1)} 
        hasMore={posts.length < totalPosts && activeFilter !== 'Статьи'}
        onRefresh={handleRefresh}
      />
    </Box>
  );
};

export default Main;