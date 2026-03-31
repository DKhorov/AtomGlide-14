import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { FiSend, FiX } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectUser } from '../system/redux/slices/getme';
const CommentForm = ({ 
  onSubmit, 
  onCancel, 
  placeholder = "Написать комментарий...",
  size = "medium",
  initialValue = ""
}) => {
  const [text, setText] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const user = useSelector(selectUser);
  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return undefined;
    if (user.avatarUrl.startsWith('http')) return user.avatarUrl;
    if (user.avatarUrl.startsWith('/')) return `https://atomglidedev.ru${user.avatarUrl}`;
    return undefined;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
        if (!user || !user._id) {
      setError('Необходимо войти в систему для комментирования');
      return;
    }
    if (!text.trim()) {
      setError('Комментарий не может быть пустым');
      return;
    }

    if (text.length > 1000) {
      setError('Комментарий слишком длинный (максимум 1000 символов)');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      const result = await onSubmit(text.trim());
      
      if (result.success) {
        setText('');
      } else {
        setError(result.error || 'Не удалось отправить комментарий');
      }
    } catch (err) {
      console.error('Ошибка отправки комментария:', err);
      if (err?.response?.status === 429) {
        const msg = 'Ой чел давайка стоп';
        setError(msg);
        setToast(msg);
      } else {
        setError('Произошла ошибка при отправке комментария');
      }
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setText('');
    setError(null);
    onCancel?.();
  };
  const isSmall = size === 'small';
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Avatar
          src={getAvatarUrl()}
          sx={{
            width: isSmall ? 24 : 32,
            height: isSmall ? 24 : 32,
            fontSize: isSmall ? '10px' : '12px',
            bgcolor: getAvatarUrl() ? 'transparent' : 'rgba(209, 209, 209, 0.2)',
            flexShrink: 0
          }}
        >
          {!getAvatarUrl() && (user?.fullName?.[0]?.toUpperCase() || 'U')}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            fullWidth
            multiline
            rows={isSmall ? 1 : 2}
            maxRows={isSmall ? 3 : 4}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            variant="outlined"
            size={isSmall ? "small" : "medium"}
            disabled={loading}
            error={!!error}
            helperText={error}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: error ? 'rgba(244, 67, 54, 0.5)' : 'rgba(209, 209, 209, 0.2)',
                borderRadius: 2,
                fontSize: isSmall ? '12px' : '14px',
                '&:hover': {
                  borderColor: error ? 'rgba(244, 67, 54, 0.7)' : 'rgba(209, 209, 209, 0.3)',
                },
                '&.Mui-focused': {
                  borderColor: error ? 'rgba(244, 67, 54, 1)' : 'rgba(66, 165, 245, 0.5)',
                }
              },
              '& .MuiInputBase-input': {
                color: 'rgba(209, 209, 209, 0.9)',
                '&::placeholder': {
                  color: 'rgba(209, 209, 209, 0.5)',
                  opacity: 1
                }
              },
              '& .MuiFormHelperText-root': {
                fontSize: '11px',
                marginLeft: 0,
                marginTop: 0.5
              }
            }}
          />
          {(text.trim() || onCancel) && (
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              mt: 1,
              justifyContent: 'flex-end'
            }}>
              {onCancel && (
                <Button
                  size={isSmall ? "small" : "medium"}
                  onClick={handleCancel}
                  disabled={loading}
                  sx={{
                    color: 'rgba(209, 209, 209, 0.7)',
                    borderColor: 'rgba(209, 209, 209, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(209, 209, 209, 0.5)',
                      backgroundColor: 'rgba(209, 209, 209, 0.05)'
                    }
                  }}
                  variant="outlined"
                >
                  Отмена
                </Button>
              )}
              
              <Button
                type="submit"
                size={isSmall ? "small" : "medium"}
                disabled={loading || !text.trim()}
                sx={{
                  backgroundColor: 'rgba(66, 165, 245, 0.8)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(66, 165, 245, 1)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(209, 209, 209, 0.2)',
                    color: 'rgba(209, 209, 209, 0.5)'
                  }
                }}
                variant="contained"
              >
                {loading ? 'Отправка...' : 'Отправить'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast(null)} severity="warning" sx={{ width: '100%' }}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommentForm;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
