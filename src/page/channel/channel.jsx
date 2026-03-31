import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, CircularProgress, Button, Snackbar, Alert, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../../system/axios';

const Channels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:900px)');

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await axios.get('/channels');
        setChannels(res.data);
        setLoading(false);
      } catch (err) {
        setError('Не удалось загрузить каналы');
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
     <Box     sx={{
            width: isMobile ? '100vw' : '700px',
            maxWidth: isMobile ? '100vw' : '750px',
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
            pl: 0, 
                    pr: 0, 
      px:1,
            
          }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ color: 'white', fontSize: '23px',mt:1,ml:1,fontFamily:'sf',fontWeight:'bold' }}>Каналы</Typography>
        {user ? (
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            if (channels.length >= 5000) {
              setSnackbar('Вы не можете создать больше 5 каналов');
            } else {
              navigate('/create-channel');
            }
          }}
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 'bold',
            mt:1.5,
             bgcolor: 'rgb(237,89,26)',
          '&:hover': { bgcolor: 'rgb(215,79,20)' },
            color: 'white',
          }}
        >
          Создать канал
        </Button>):(
          <h1>Войди в аккаунт</h1>
        )}
      </Box>

      {channels.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography sx={{ fontSize: '64px' }}>🤷‍♂️</Typography>
          <Typography sx={{ color: 'gray', fontSize: '15px', mt: 1 }}>А чёт каналов нет…</Typography>
        </Box>
      ) : (
        <List>
          {channels
            .slice() 
            .sort((a, b) => b._id.localeCompare(a._id)) 
            .map((ch) => (
              <ListItem
                key={ch._id}
                button
                onClick={() => navigate(`/channel/${ch._id}`)}
                sx={{ bgcolor: 'rgb(37,37,37)', borderRadius: 5,mb:1 }}
              >
                <ListItemAvatar>
                  <Avatar src={ch.avatarUrl}>{ch.name ? ch.name.charAt(0).toUpperCase() : 'C'}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography sx={{ color: 'white' }}>{ch.name}</Typography>}
                  secondary={<Typography sx={{ color: 'gray', fontSize: '13px' }}>{ch.description}</Typography>}
                />
                <Typography sx={{ color: 'rgba(150,150,150,1)', fontSize: 12 }}>{ch.nick}</Typography>
              </ListItem>
            ))}
        </List>
      )}

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')}>
        <Alert severity="warning" sx={{ width: '100%' }}>
          {snackbar}
        </Alert>
      </Snackbar>

      {error && (
        <Typography sx={{ color: 'red', fontSize: '13px', mt: 2 }}>{error}</Typography>
      )}
    </Box>
  );
};

export default Channels;