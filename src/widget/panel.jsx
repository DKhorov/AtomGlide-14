import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  IconButton
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from '../system/axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../system/redux/slices/getme';

const Panel = React.memo(() => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [channels, setChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  
  const [openUpload, setOpenUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [trackData, setTrackData] = useState({
    title: '',
    genre: '',
    cover: '', 
  });




  const handleOpen = () => setOpenUpload(true);
  const handleClose = () => {
    setOpenUpload(false);
    setUploadError('');
    setTrackData({ title: '', genre: '', cover: '', channelId: '' });
    setSelectedFile(null);
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (fileSizeMB > 10) {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const res = await axios.get('/subscription/info');
            if (res.data && !res.data.subscription?.isActive) {
              setUploadError(`Файл слишком большой (${fileSizeMB.toFixed(2)}MB). Максимальный размер для обычных пользователей: 10MB. Для загрузки файлов больше 10MB требуется подписка AtomPro+`);
              return;
            }
          } else {
            setUploadError(`Файл слишком большой (${fileSizeMB.toFixed(2)}MB). Максимальный размер: 10MB. Для загрузки файлов больше 10MB требуется подписка AtomPro+`);
            return;
          }
        } catch (err) {
          setUploadError(`Файл слишком большой (${fileSizeMB.toFixed(2)}MB). Максимальный размер: 10MB. Для загрузки файлов больше 10MB требуется подписка AtomPro+`);
          return;
        }
      }
      
      setSelectedFile(file);
      setUploadError('');
    }
  };

  const handleInputChange = (e) => {
    setTrackData({ ...trackData, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    if (!selectedFile || !trackData.title || !trackData.genre || !trackData.channelId) {
      setUploadError('Заполните обязательные поля (Файл, Название, Жанр, Канал)');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('track', selectedFile); 
      formData.append('title', trackData.title);
      formData.append('genre', trackData.genre);
      formData.append('channelId', trackData.channelId);
      
      // Optional fields
      if (trackData.cover) formData.append('cover', trackData.cover);
      
      await axios.post('/PostTrack', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Трек успешно загружен!');
      handleClose();
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.message || 'Ошибка при загрузке трека');
    } finally {
      setUploading(false);
    }
  };


  return (
   <></>
  );
});

export default Panel;