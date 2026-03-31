import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Avatar, 
  Typography, 
  CircularProgress, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Divider,
  Button,
  useMediaQuery
} from '@mui/material';
import { 
  Person, 
  Article, 
  Favorite, 
  Visibility, 
  Group, 
  TrendingUp,
  ArrowBack
} from '@mui/icons-material';
import axios from '../../system/axios';
import { useNavigate, useParams } from 'react-router-dom';

const UserStats = () => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:900px)');

  useEffect(() => {
    if (userId) {
      loadUserStats();
    }
  }, [userId]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/rating/user-stats/${userId}`);
      setUserStats(response.data);
    } catch (e) {
      console.error('Ошибка загрузки статистики пользователя:', e);
      setError('Не удалось загрузить статистику пользователя');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        width: isMobile ? '100vw' : '550px',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        width: isMobile ? '100vw' : '550px',
        p: 2 
      }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={loadUserStats} variant="outlined" sx={{ mt: 1 }}>
          Повторить
        </Button>
      </Box>
    );
  }

  if (!userStats) {
    return (
      <Box sx={{ 
        width: isMobile ? '100vw' : '550px',
        p: 2 
      }}>
        <Typography color="error">Пользователь не найден</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: isMobile ? '100vw' : '550px',
      maxWidth: isMobile ? '100vw' : '550px',
      minWidth: isMobile ? '0' : '200px',
      height: isMobile ? '100vh' : '100vh',
      flex: isMobile ? 1 : 'none',
      overflowY: 'auto',
      scrollbarWidth: 'none', 
      msOverflowStyle: 'none', 
      '&::-webkit-scrollbar': {
        width: '0px', 
        background: 'transparent',
      },
      paddingBottom: isMobile ? '70px' : 0, 
      pl: 2,
      pr: 2,
      pt: isMobile ? 1 : 2,
      mt: isMobile ? 2 : 2,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2, color: 'white' }}
        >
          Назад
        </Button>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          Статистика пользователя
        </Typography>
      </Box>

      <Card sx={{ mb: 3, bgcolor: 'rgba(23, 23, 23, 0.8)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              src={userStats.avatarUrl} 
              sx={{ width: 80, height: 80, mr: 3 }}
            />
            <Box>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                {userStats.username}
              </Typography>
              <Typography variant="h6" sx={{ color: 'grey.400' }}>
                {userStats.fullName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.500' }}>
                Участник с {new Date(userStats.createdAt).toLocaleDateString('ru-RU')}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card sx={{ bgcolor: 'rgba(23, 23, 23, 0.8)', textAlign: 'center' }}>
            <CardContent>
              <Article sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {userStats.postsCount || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                Постов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6}>
          <Card sx={{ bgcolor: 'rgba(23, 23, 23, 0.8)', textAlign: 'center' }}>
            <CardContent>
              <Group sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {userStats.followersCount || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                Подписчиков
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card sx={{ bgcolor: 'rgba(23, 23, 23, 0.8)', textAlign: 'center' }}>
            <CardContent>
              <Favorite sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {userStats.totalLikes || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                Всего лайков
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6}>
          <Card sx={{ bgcolor: 'rgba(23, 23, 23, 0.8)', textAlign: 'center' }}>
            <CardContent>
              <Visibility sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {userStats.totalViews || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                Всего просмотров
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ bgcolor: 'rgba(23, 23, 23, 0.8)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp sx={{ fontSize: 20 }} />
            Дополнительная информация
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'grey.400' }}>
              Подписки:
            </Typography>
            <Chip 
              label={userStats.subscriptionsCount || 0} 
              size="small" 
              variant="outlined" 
              sx={{ color: 'primary.main' }}
            />
          </Box>
          
          <Divider sx={{ borderColor: 'rgba(209,209,209,0.1)', my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'grey.400' }}>
              Среднее количество лайков на пост:
            </Typography>
            <Chip 
              label={userStats.postsCount > 0 ? Math.round((userStats.totalLikes || 0) / userStats.postsCount) : 0} 
              size="small" 
              variant="outlined" 
              sx={{ color: 'success.main' }}
            />
          </Box>
          
          <Divider sx={{ borderColor: 'rgba(209,209,209,0.1)', my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'grey.400' }}>
              Среднее количество просмотров на пост:
            </Typography>
            <Chip 
              label={userStats.postsCount > 0 ? Math.round((userStats.totalViews || 0) / userStats.postsCount) : 0} 
              size="small" 
              variant="outlined" 
              sx={{ color: 'info.main' }}
            />
          </Box>
        </CardContent>
      </Card>

      <Button 
        variant="outlined" 
        fullWidth 
        sx={{ mt: 3, mb: 2 }}
        onClick={loadUserStats}
        startIcon={<TrendingUp />}
      >
        Обновить статистику
      </Button>
    </Box>
  );
};

export default UserStats;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
