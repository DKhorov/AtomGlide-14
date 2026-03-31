import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, CircularProgress, Divider, Button, useMediaQuery, Chip, Card, CardContent, keyframes } from '@mui/material';
import { Person, Article, TrendingUp, EmojiEvents, Stars, WorkspacePremium } from '@mui/icons-material';
import axios from '../../system/axios';

// Анимация появления трибун
const riseUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Reting = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [popularUsers, setPopularUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const isMobile = useMediaQuery('(max-width:900px)');

  const loadRatingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [activeResponse, popularResponse] = await Promise.all([
        axios.get('/rating/active-users'),
        axios.get('/rating/popular-users')
      ]);
      setActiveUsers(activeResponse.data || []);
      setPopularUsers(popularResponse.data || []);
    } catch (e) {
      console.error('Ошибка загрузки рейтинга:', e);
      setError('Не удалось загрузить рейтинг');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRatingData();
  }, []);

  const getAvatarUrl = (user) => {
    if (!user?.avatarUrl) return undefined;
    if (user.avatarUrl.startsWith('http')) return user.avatarUrl;
    if (user.avatarUrl.startsWith('/')) return `https://atomglidedev.ru${user.avatarUrl}`;
    return undefined;
  };

  // Компонент пьедестала
  const Podium = ({ users, type }) => {
    if (users.length === 0) return null;

    // Массив индексов для порядка [1, 0, 2] -> (2 место, 1 место, 3 место)
    const order = [1, 0, 2];
    
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-end', 
        gap: isMobile ? 1 : 2, 
        mb: 4, 
        mt: 4,
        minHeight: '240px',
        px: 1
      }}>
        {order.map((pos) => {
          const user = users[pos];
          if (!user) return <Box key={pos} sx={{ flex: 1 }} />;

          const isFirst = pos === 0;
          const isSecond = pos === 1;
          const isThird = pos === 2;

const height = isFirst ? 160 : isSecond ? 110 : 90;          const color = isFirst ? '#FFD700' : isSecond ? '#C0C0C0' : '#CD7F32';
          const shadow = isFirst ? `0 0 20px ${color}44` : 'none';

          return (
            <Box key={user._id} sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              flex: 1,
              animation: `${riseUp} 0.5s ease-out forwards`,
              animationDelay: `${pos * 0.1}s`
            }}>
              {/* Аватар и корона */}
              <Box sx={{ position: 'relative', mb: 1 }}>
                {isFirst && (
                  <Stars sx={{ 
                    position: 'absolute', 
                    top: -22, 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    color: 'gold',
                    fontSize: 30
                  }} />
                )}
                <Avatar 
                  src={getAvatarUrl(user)} 
                  sx={{ 
                    width: isFirst ? 75 : 55, 
                    height: isFirst ? 75 : 55, 
                    border: `3px solid ${color}`,
                    boxShadow: shadow,
                    bgcolor: 'grey.800'
                  }}
                >
                  {!user?.avatarUrl && user?.username?.[0].toUpperCase()}
                </Avatar>
              </Box>

              {/* Имя */}
              <Typography variant="caption" noWrap sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                textAlign: 'center', 
                width: '100%',
                mb: 0.5,
                fontSize: isFirst ? '0.85rem' : '0.75rem'
              }}>
                {user.username}
              </Typography>

              {/* Тумба */}
              <Box sx={{ 
                width: '100%', 
                height: height, 
                background: `linear-gradient(180deg, ${color}64 0%, rgba(37,37,37,1) 100%)`,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pt: 1,
                border: `1px solid ${color}33`,
                position: 'relative'
              }}>
                <Typography variant="h4" sx={{ color: color, fontWeight: '900', opacity: 0.8 }}>
                  {pos + 1}
                </Typography>
                <Box sx={{ mt: 'auto', pb: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'grey.300', fontSize: '10px', display: 'block' }}>
                    {type === 'active' ? 'Постов' : 'Подп.'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {type === 'active' ? (user.postsCount || 0) : (user.followersCount || 0)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderUserCard = (user, index, type) => (
    <Card key={user._id} sx={{ bgcolor: 'rgb(37,37,37)', borderRadius: 4, mb: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
      <CardContent sx={{ p: '12px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ color: 'grey.600', fontWeight: 'bold', mr: 2, minWidth: '25px', fontSize: '0.9rem' }}>
              #{index + 1}
            </Typography>
            <Avatar src={getAvatarUrl(user)} sx={{ width: 40, height: 40, mr: 1.5 }}>
              {!user?.avatarUrl && user?.username?.[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>{user.username}</Typography>
              <Typography variant="caption" sx={{ color: 'grey.500', display: 'block' }}>{user.fullName}</Typography>
            </Box>
          </Box>
          
          <Chip 
            label={type === 'active' ? `${user.postsCount || 0} постов` : `${user.followersCount || 0} друзей`} 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'grey.300', fontSize: '0.75rem' }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  const renderContent = (users, type) => {
    const podiumUsers = users.slice(0, 3);
    const listUsers = users.slice(3);

    return (
      <Box>
        <Podium users={podiumUsers} type={type} />
        <Typography variant="overline" sx={{ color: 'grey.600', mb: 1, display: 'block', ml: 1 }}>
          Остальные участники
        </Typography>
        {listUsers.map((user, index) => renderUserCard(user, index + 3, type))}
      </Box>
    );
  };

  if (loading) return  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh",width:'700px'}}>
          <CircularProgress sx={{ color: "rgb(237,93,25)" }} />
        </Box>;

  return (
    <Box sx={{
        height: '100vh',
        width:'700px',
        overflowY: 'auto',
        scrollbarWidth: 'none', 
        '&::-webkit-scrollbar': { display: 'none' },
        paddingBottom: isMobile ? '90px' : 4, 
        px: 2,
        pt: 2,
      }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          Рейтинг
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, bgcolor: 'rgba(255,255,255,0.05)', p: 0.5, borderRadius: '100px' }}>
        <Button
          fullWidth
          onClick={() => setActiveTab('active')}
          sx={{ 
            borderRadius:'100px', 
            bgcolor: activeTab === 'active' ? '#be8221ff' : 'transparent',
            color: 'white',
            '&:hover': { bgcolor: activeTab === 'active' ? '#be8221ff' : 'rgba(255,255,255,0.1)' }
          }}
        >
          Активные
        </Button>
        <Button
          fullWidth
          onClick={() => setActiveTab('popular')}
          sx={{ 
            borderRadius:'100px', 
            bgcolor: activeTab === 'popular' ? '#be8221ff' : 'transparent',
            color: 'white',
            '&:hover': { bgcolor: activeTab === 'popular' ? '#be8221ff' : 'rgba(255,255,255,0.1)' }
          }}
        >
          Популярные
        </Button>
      </Box>

      {activeTab === 'active' ? renderContent(activeUsers, 'active') : renderContent(popularUsers, 'popular')}
    </Box>
  );
};

export default Reting;