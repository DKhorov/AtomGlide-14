import React, { useEffect, useState } from 'react';
import {
  Box, Avatar, Typography, IconButton, Menu, MenuItem,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Button, CircularProgress, useMediaQuery
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from '../../system/axios';
import PostsList from '../../page/main/PostsList';

const ChannelPage = ({ onDeleted }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openFinalConfirm, setOpenFinalConfirm] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const isMobile = useMediaQuery('(max-width:900px)');
  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const res = await axios.get(`/channels/${id}`);
        setChannel(res.data);
      } catch (err) {
        console.error("Ошибка загрузки канала:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await axios.get(`/channels/${id}/posts`);
        setPosts(res.data);
      } catch (err) {
        console.error("Ошибка загрузки постов канала:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchChannel();
    fetchPosts();
  }, [id]);

  const handleDelete = async () => {
alert("This beta version does not support channel deletion. Please try again later or support in tg @jpegweb");
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <CircularProgress size={24} sx={{ color: 'gray', mr: 1 }} />
        <Typography sx={{ color: 'gray' }}>Загрузка канала...</Typography>
      </Box>
    );
  }

  if (!channel) {
    return (
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography sx={{ color: 'red' }}>Канал не найден</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: isMobile ? '100vw' : '700px',
        maxWidth: isMobile ? '100vw' : '700px',
        height: '100vh',
        flex: isMobile ? 1 : 'none',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        pb: isMobile ? '70px' : 0,
          px:1,

              
      }}
    >
    
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 2,
          borderBottom: '1px solid rgba(50,50,50,0.6)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Avatar
          src={channel.avatarUrl}
          alt={channel.name}
          sx={{ width: 45, height: 45, mr: 1.5}}
        />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16, color: 'white' }}>
            {channel.name}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'gray' }}>
            {channel.nick}
          </Typography>
          
         
        </Box>
       

       
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={() => setAnchorEl(null)}
        >
     
       
        </Menu>
      </Box>
 <Box sx={{pb:1, borderBottom: '1px solid rgba(50,50,50,0.6)'}}>
  <Typography sx={{mt:1.5,ml:2}}>Описание канала</Typography>
                    {channel.description && (

          <Typography sx={{ fontSize: 17, color: 'rgb(180,180,180)',ml:2}}>
             {channel.description}
          </Typography>)}
        </Box>
      <Box sx={{ mt: 2 }}>
        <PostsList posts={posts} loading={loadingPosts} />
      </Box>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Подтверждение</DialogTitle>
        <DialogContent>
          <Typography>Вы уверены, что хотите удалить канал <b>{channel.name}</b>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Отмена</Button>
          <Button color="error" onClick={() => { setOpenConfirm(false); setOpenFinalConfirm(true); }}>
            Да, удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openFinalConfirm} onClose={() => setOpenFinalConfirm(false)}>
        <DialogTitle>Последнее подтверждение</DialogTitle>
        <DialogContent>
          <Typography>⚠ Все посты из канала будут удалены. Продолжить?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFinalConfirm(false)}>Отмена</Button>
          <Button color="error" onClick={handleDelete}>Удалить навсегда</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChannelPage;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
