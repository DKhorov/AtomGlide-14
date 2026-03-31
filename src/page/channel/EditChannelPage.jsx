import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Avatar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../system/axios';

const EditChannelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [nick, setNick] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const res = await axios.get(`/channels/${id}`);
        setName(res.data.name || '');
        setNick(res.data.nick || '');
        setDescription(res.data.description || '');
        setAvatarUrl(res.data.avatarUrl || '');
      } catch (err) {
        console.error('Ошибка загрузки канала:', err);
        setError('Не удалось загрузить канал');
      }
    };
    fetchChannel();
  }, [id]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/channels/${id}`,
        { name, description, avatarUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/channel/${id}`);
    } catch (err) {
      console.error('Ошибка сохранения канала:', err);
      setError(err.response?.data?.error || 'Не удалось сохранить канал');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography sx={{ fontSize: '20px', fontWeight: 600, mb: 2 }}>
        Редактировать канал
      </Typography>

      <TextField
        label="Название канала"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Ник (неизменяемый)"
        fullWidth
        value={nick}
        disabled
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
      <TextField
        label="URL аватара"
        fullWidth
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        sx={{ mb: 2 }}
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
        sx={{ borderRadius: '8px', textTransform: 'none' }}
        onClick={handleSave}
      >
        Сохранить изменения
      </Button>
    </Box>
  );
};


export default EditChannelPage;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
