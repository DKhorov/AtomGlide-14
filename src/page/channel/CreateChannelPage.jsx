import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../../system/axios';

const avatarOptions = [
  'https://sun9-42.userapi.com/impg/c846418/v846418504/60b63/IFR6KazkGjY.jpg?size=640x400&quality=96&sign=94e8e162d1d1e06a59444ecd9705ce1d&type=album',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMunfNUwox_nJZKnmUOmqPZWqOqUnOKD9q4A&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzUIDB9BzmVPiYylc8wh-iZoxKCoYkPeFRbA&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBkRws9KlM5ePhqKjbp-ElNQEjbH2HnRdu2w&s',



];

const ChannelCreatePage = () => {
  const [name, setName] = useState('');
  const [nick, setNick] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!nick.startsWith('$')) {
      setError('Ник должен начинаться с $');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/channels',
        { name, nick, description, avatarUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/channel/${res.data._id}`);
    } catch (err) {
      console.error('Ошибка создания канала:', err);
      setError(err.response?.data?.error || 'Не удалось создать канал');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto', px: 1 }}>
      <Typography sx={{ fontSize: '20px', fontWeight: 600, mb: 2 }}>
        Создать канал
      </Typography>

      <TextField
        label="Название канала"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Ник (начинается с $)"
        fullWidth
        value={nick}
        onChange={(e) => setNick(e.target.value.replace(/\s+/g, ''))}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Описание"
        fullWidth
        multiline
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Typography sx={{ mb: 1 }}>Выберите аватарку:</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {avatarOptions.map((url) => (
          <Avatar
            key={url}
            src={url}
            sx={{
              width: 60,
              height: 60,
              border: avatarUrl === url ? '3px solid #1976d2' : '2px solid transparent',
              cursor: 'pointer'
            }}
            onClick={() => setAvatarUrl(url)}
          />
        ))}
      </Box>

      <TextField
        label="URL аватара"
        fullWidth
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        sx={{ mb: 2 }}
        disabled={!!avatarOptions.includes(avatarUrl)} 
      />

      {avatarUrl && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Avatar src={avatarUrl} sx={{ width: 80, height: 80 }} />
        </Box>
      )}

      {error && (
        <Typography sx={{ color: 'red', fontSize: 14, mb: 2 }}>
          {error}
        </Typography>
      )}

      <Button
        variant="contained"
        fullWidth
        sx={{ borderRadius: '8px', textTransform: 'none' ,    background:'#866023ff',
            color: 'white',}}
        onClick={handleCreate}
      >
        Создать
      </Button>
    </Box>
  );
};

export default ChannelCreatePage;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
