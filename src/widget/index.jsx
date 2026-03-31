import React, { useEffect, useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Typography, IconButton } from '@mui/material';
import axios from '../system/axios';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const fadeInStyle = {
  opacity: 1,
  transform: 'translateY(0)',
  transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)',
};
const fadeOutStyle = {
  opacity: 0,
  transform: 'translateY(40px)',
};

function ThrowErrorButton() {
  const [error, setError] = useState(false);
  if (error) {
    throw new Error('Это кастомная ошибка!');
  }
  return (
    <button
      onClick={() => setError(true)}
      style={{
        margin: 20,
        padding: 10,
        background: '#b71c1c',
        color: 'white',
        border: 'none',
        borderRadius: 5,
        fontWeight: 'bold',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 16,
        cursor: 'pointer',
      }}
    >
      Вызвать ошибку
    </button>
  );
}

const Widget = React.memo(() => {
  const [count, setCount] = useState(null);
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);
  const [noth, setnoth] = useState(null);
  const [notificationsExpanded, setNotificationsExpanded] = useState(false);
  const [balance, setBalance] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/postNumbers')
      .then(res => setCount(res.data.posts))
      .catch(err => console.error('Ошибка при получении данных:', err));
    mountedRef.current = true;
    setTimeout(() => setMounted(true), 50);
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const fetchNotifications = () => {
      axios.get('/notifications')
        .then(res => setnoth(res.data))
        .catch(err => console.error('Ошибка при получении уведомлений:', err));
    };
    fetchNotifications();
    const handler = () => fetchNotifications();
    window.addEventListener('refresh-notifications', handler);
    return () => window.removeEventListener('refresh-notifications', handler);
  }, []);

  useEffect(() => {
    const fetchBalance = () => {
      axios.get('/auth/balance')
        .then(res => setBalance(res.data.balance))
        .catch(() => setBalance('...'));
    };
    fetchBalance();
    const handler = () => fetchBalance();
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, []);

  const handleClearNotifications = async () => {
    try {
      await axios.post('/auth/clear-notifications');
      setnoth([]);
    } catch (err) {
      alert('Ошибка при очистке уведомлений');
    }
  };

  const cards = [
    {
      label: 'Постов',
      value: count,
      bg: 'linear-gradient(135deg, rgb(255, 255, 255), rgb(255, 255, 255))',
      ml: '15px',
      mr: undefined,
    },
    {
      label: 'Каналов',
      value: 6,
      bg: 'linear-gradient(135deg, rgb(255, 255, 255), rgb(255, 255, 255))',

      ml: undefined,
      mr: '15px',
    },
    {
      label: 'Версия',
      value: 9.0,
      bg: 'linear-gradient(135deg, rgb(255, 255, 255), rgb(255, 255, 255))',
      ml: '15px',
      mr: undefined,
    },
    {
      label: 'Баланс',
      value: balance === null ? '...' : Math.floor(balance),
      bg: 'linear-gradient(135deg, rgb(255, 255, 255), rgb(255, 255, 255))',
      ml: undefined,
      mr: '15px',
    },
  ];

  return (
    <Box
      sx={{
        width: '280px',
        minWidth: '280px',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'auto',
        position: 'relative',
        ...(!mounted ? fadeOutStyle : fadeInStyle),
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '50px',
          marginTop: '20px',
          borderRadius: '100px',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'flex-end',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'opacity 0.7s, transform 0.7s',
        }}
      >

        <Button
      onClick={() => navigate('/setting')}
      sx={{
        border: 'solid white 2px',
        borderRadius: '100px',
        paddingLeft: '25px',
        paddingRight: '25px',
        mb:1,
        color: 'white',
        textTransform: 'none',
        marginRight: '15px',
        fontWeight: 'bold',
        fontFamily: "'Arial'",
        boxShadow: 1,
        '&:hover': {
          boxShadow: 8,
          background: 'rgba(255, 255, 255, 0.04)',
        },
      }}
    >
      Setting
    </Button>
      </Box>


<Box
  sx={{
    width: '250px',
    minHeight: '400px',
    backgroundColor: 'rgba(34, 40, 47, 1)',
    borderRadius: 2,
    marginTop:"10px",
    margin: '0 auto 0px auto',
    transition: 'box-shadow 0.4s, transform 0.4s, opacity 0.7s',
    position: 'relative',
    opacity: mounted ? 1 : 0,
  }}
>
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18, mb: 0, pt: 1.5, ml: 2 }}>Уведомления</Typography>
    <IconButton
      size="small"
      onClick={() => setNotificationsExpanded(v => !v)}
      sx={{
        mt: 1.5,
        color: '#333',
        transition: 'background 0.3s',
        '&:hover': { background: 'rgba(0,0,0,0.08)' }
      }}
    >
      {notificationsExpanded ? <ExpandLessIcon fontSize="medium" /> : <ExpandMoreIcon fontSize="medium" />}
    </IconButton>
  </Box>
  {noth === null ? (
    <Typography sx={{ 
      color: 'rgb(225,225,225)',
      fontWeight: 'bold', 
      fontSize: '14px',
      textAlign: 'center',
      py: 3,
      px: 2
    }}>
      Загрузка...
    </Typography>
  ) : Array.isArray(noth) && noth.length === 0 ? (
    <Typography sx={{ 
      color: 'rgb(225,225,225)',
      fontWeight: 'bold', 
      fontSize: '14px',
      textAlign: 'center',
      py: 3,
      px: 2
    }}>
      Нет уведомлений
    </Typography>
  ) : (
    <Box
      sx={{
        pr: 1,
        ml: 1,
        paddingTop: '10px',
        maxHeight: notificationsExpanded ? 1000 : 220,
        overflowY: notificationsExpanded ? 'visible' : 'auto',
        transition: 'max-height 0.5s cubic-bezier(.4,0,.2,1)',
        '&::-webkit-scrollbar': {
          width: '0px',  
          height: '0px',
        },
        scrollbarWidth: 'none',  
        '-ms-overflow-style': 'none', 
      }}
    >
      {noth.map((n, idx) => (
        <Box key={idx} sx={{ mb: 1.5, p: 1.2, borderRadius: 2, background: 'rgba(43, 43, 43, 0.11)' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: 'rgb(225,225,225)' }}>{n.title}</Typography>
          <Typography sx={{ color: 'rgba(203, 203, 203, 0.8)', fontSize: 13 }}>{n.description}</Typography>
          <Typography sx={{ color: 'rgba(146, 146, 146, 0.5)', fontSize: 11, mt: 0.5 }}>{n.date ? new Date(n.date).toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</Typography>
        </Box>
      ))}
    </Box>
  )}
</Box>
        {noth && Array.isArray(noth) && noth.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepIcon sx={{ fontSize: 18 }} />}
            onClick={handleClearNotifications}
            sx={{
              marginTop:"10px",
              marginLeft:"160px",
              borderRadius: 2,
              fontWeight: 500,
              textTransform: 'none',
              fontSize: 13,
              minWidth: 'auto',
              padding: '2px 10px',
              background: 'rgba(255,255,255,0.08)',
              borderColor: 'rgba(255,0,0,0.25)',
              boxShadow: 'none',
              opacity: 0.7,
              '&:hover': {
                background: 'rgba(255,0,0,0.08)',
                opacity: 1
              }
            }}
          >
            Очистить
          </Button>
        )}
   
    </Box>
  );
});

export default Widget; 
/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
