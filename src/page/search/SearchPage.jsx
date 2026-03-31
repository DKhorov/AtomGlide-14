import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Tabs,
  Tab,
  CircularProgress,
  useMediaQuery,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { FiSearch, FiX } from 'react-icons/fi';
import axios from '../../system/axios';
import PostWithComments from '../main/post/PostWithComments';
import PostSkeleton from '../main/post/PostSkeleton';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:900px)');

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [music, setMusic] = useState([]);
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const [postsRes, musicRes] = await Promise.allSettled([
        axios.get(`/posts/search?q=${encodeURIComponent(query)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        axios.get(`/tracks/search?q=${encodeURIComponent(query)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
      ]);
      
      setPosts(postsRes.status === 'fulfilled' ? postsRes.value.data || [] : []);
      setMusic(musicRes.status === 'fulfilled' ? musicRes.value.data || [] : []);

      try {
        const channelsRes = await axios.get(`/channels/search?q=${encodeURIComponent(query)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setChannels(channelsRes.data || []);
      } catch (err) {
        console.log('Channels search not available');
        setChannels([]);
      }

    } catch (err) {
      console.error('Ошибка поиска:', err);
      setError('Не удалось выполнить поиск');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPosts([]);
    setMusic([]);
    setChannels([]);
    setSearchParams({});
  };

  return (
    <Box
      sx={{
        width: isMobile ? '100vw' : '650px',
        maxWidth: isMobile ? '100vw' : '650px',
        height: '100vh',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': {
          width: '0px',
          background: 'transparent',
        },
        paddingBottom: isMobile ? '70px' : 0,
        px: 2,
        pt: 2,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 'bold',
            mb: 2,
          }}
        >
          Поиск
        </Typography>

        <TextField
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Поиск постов, музыки, каналов..."
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiSearch color="rgba(154, 153, 153, 1)" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <FiX color="rgba(154, 153, 153, 1)" />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'rgba(38, 38, 38, 1)',
              borderRadius: '10px',
              color: 'white',
              '& fieldset': {
                border: '1px solid rgba(209, 209, 209, 0.1)',
              },
              '&:hover fieldset': {
                border: '1px solid rgba(209, 209, 209, 0.2)',
              },
              '&.Mui-focused fieldset': {
                border: '1px solid rgba(237, 93, 25, 0.5)',
              },
            },
          }}
        />
      </Box>

      {searchParams.get('q') && (
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(209, 209, 209, 0.1)', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(154, 153, 153, 1)',
                textTransform: 'none',
                fontSize: '14px',
              },
              '& .Mui-selected': {
                color: 'rgba(237, 93, 25, 1)',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'rgba(237, 93, 25, 1)',
              },
            }}
          >
            <Tab label={`Посты (${posts.length})`} />
            <Tab label={`Музыка (${music.length})`} />
            <Tab label={`Каналы (${channels.length})`} />
          </Tabs>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: 'rgba(237, 93, 25, 1)' }} />
        </Box>
      )}

      {error && (
        <Typography sx={{ color: 'red', textAlign: 'center', py: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && searchParams.get('q') && (
        <>
          {activeTab === 0 && (
            <Box>
              {posts.length === 0 ? (
                <Typography
                  sx={{
                    color: 'rgba(154, 153, 153, 1)',
                    textAlign: 'center',
                    py: 4,
                  }}
                >
                  Постов не найдено
                </Typography>
              ) : (
                posts.map((post) => (
                  <Box key={post._id} sx={{ mb: 2 }}>
                    <PostWithComments
                      post={post}
                      onPostUpdate={(updated) => {
                        setPosts((prev) =>
                          prev.map((p) => (p._id === updated._id ? updated : p))
                        );
                      }}
                    />
                  </Box>
                ))
              )}
            </Box>
          )}

          {/* Music Tab */}
          {activeTab === 1 && (
            <Box>
              {music.length === 0 ? (
                <Typography
                  sx={{
                    color: 'rgba(154, 153, 153, 1)',
                    textAlign: 'center',
                    py: 4,
                  }}
                >
                  Музыки не найдено
                </Typography>
              ) : (
                music.map((track) => (
                  <Box
                    key={track._id}
                    sx={{
                      p: 2,
                      mb: 1,
                      backgroundColor: 'rgba(38, 38, 38, 1)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(48, 48, 48, 1)',
                      },
                    }}
                    onClick={() => navigate(`/music`)}
                  >
                    <Box
                      component="img"
                      src={track.cover}
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                    />
                    <Box>
                      <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                        {track.title}
                      </Typography>
                      <Typography sx={{ color: 'rgba(154, 153, 153, 1)', fontSize: '12px' }}>
                        {track.authorName || 'Неизвестный исполнитель'}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              {channels.length === 0 ? (
                <Typography
                  sx={{
                    color: 'rgba(154, 153, 153, 1)',
                    textAlign: 'center',
                    py: 4,
                  }}
                >
                  Каналов не найдено
                </Typography>
              ) : (
                channels.map((channel) => (
                  <Box
                    key={channel._id}
                    sx={{
                      p: 2,
                      mb: 1,
                      backgroundColor: 'rgba(38, 38, 38, 1)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(48, 48, 48, 1)',
                      },
                    }}
                    onClick={() => navigate(`/channel/${channel._id}`)}
                  >
                    <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                      {channel.name}
                    </Typography>
                    <Typography sx={{ color: 'rgba(154, 153, 153, 1)', fontSize: '12px' }}>
                      @{channel.nick || channel._id}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          )}
        </>
      )}

      {!loading && !searchParams.get('q') && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
          }}
        >
          <FiSearch size={64} color="rgba(154, 153, 153, 0.3)" />
          <Typography
            sx={{
              color: 'rgba(154, 153, 153, 1)',
              mt: 2,
              textAlign: 'center',
            }}
          >
            Введите запрос для поиска
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SearchPage;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
