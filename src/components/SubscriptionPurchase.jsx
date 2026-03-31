import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  Card,
  Alert,
  CircularProgress,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { checkSubscription, purchaseSubscription } from '../utils/subscription';

const SubscriptionPurchase = ({ open, onClose }) => {
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) loadSubscriptionInfo();
  }, [open]);

  const loadSubscriptionInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const info = await checkSubscription();
      setSubscriptionInfo(info);
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (duration) => {
    setPurchasing(true);
    setError('');
    setSuccess('');
    try {
      const result = await purchaseSubscription(duration);
      if (result.requiresTelegram) {
        window.open(result.telegramUrl || 'https://t.me/jpegweb', '_blank');
        setSuccess('Завершите оплату в Telegram');
      } else if (result.success) {
        setSuccess('Активировано!');
        await loadSubscriptionInfo();
        setTimeout(onClose, 2000);
      }
    } catch (err) {
      setError('Ошибка транзакции');
    } finally {
      setPurchasing(false);
    }
  };

  const isActive = subscriptionInfo?.isActive;
  const expiresAt = subscriptionInfo?.expiresAt;
  const daysLeft = expiresAt ? Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  // Чистый стиль карточек без лишних слоев
  const cardStyle = {
    bgcolor: '#141414', // Однотонный темный фон вместо прозрачности
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    p: 2.5,
    boxShadow: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      borderColor: '#ed5d19',
      bgcolor: '#1a1a1a'
    }
  };

  return (
    open && (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)'
      }} onClick={onClose}>
        <Box sx={{
          bgcolor: '#0a0a0a',
          backgroundImage: 'none !important',
          color: '#ffffff',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          width: '90%',
          maxWidth: '400px',
          maxHeight: '90vh',
          overflow: 'auto'
        }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <Box sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '0.5px', fontSize: '1.2rem' }}>
              Atom<span style={{ color: '#ed5d19' }}>Pro+</span>
            </Typography>
            <IconButton onClick={onClose} sx={{ color: 'grey.600', '&:hover': { color: '#fff' } }} size="small">
               <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ px: 3, pb: 4, pt: 3 }}>
            {error && <Alert severity="error" variant="outlined" sx={{ mb: 2, color: '#ff8a80', borderColor: '#ff8a80' }}>{error}</Alert>}
            {success && <Alert severity="success" variant="outlined" sx={{ mb: 2, color: '#81c784', borderColor: '#81c784' }}>{success}</Alert>}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={30} sx={{ color: '#ed5d19' }} /></Box>
            ) : isActive ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ 
                  width: 60, height: 60, bgcolor: 'rgba(76, 175, 80, 0.1)', 
                  borderRadius: '50%', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', mx: 'auto', mb: 2, color: '#4caf50' 
                }}>
                  <Typography variant="h4">✓</Typography>
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Подписка активна</Typography>
                <Typography variant="body2" sx={{ color: 'grey.500', mb: 3 }}>
                  До {new Date(expiresAt).toLocaleDateString('ru-RU')} ({daysLeft} дн.)
                </Typography>
                <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" sx={{ color: 'grey.500', mb: 3, lineHeight: 1.5 }}>
                  Разблокируйте профессиональные инструменты и приоритетную обработку данных.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* План Неделя */}
                  <Card sx={cardStyle}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'grey.500', display: 'block' }}>Тариф «Старт»</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>300 ATM</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'grey.400' }}>7 дней</Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handlePurchase('week')}
                      disabled={purchasing}
                      sx={{ 
                        bgcolor: '#fff', 
                        color: '#000', 
                        fontWeight: 800,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#f0f0f0' },
                        borderRadius: '10px'
                      }}
                    >
                      {purchasing ? <CircularProgress size={20} color="inherit" /> : 'Активировать'}
                    </Button>
                  </Card>

                  {/* План Месяц */}
                  <Card sx={{ ...cardStyle, border: '1px solid rgba(237, 93, 25, 0.3)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#ed5d19', display: 'block', fontWeight: 600 }}>Лучший выбор</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>$1.99</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ bgcolor: 'rgba(237, 93, 25, 0.15)', color: '#ed5d19', px: 1.5, py: 0.5, borderRadius: '6px', fontWeight: 700 }}>
                        МЕСЯЦ
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handlePurchase('month')}
                      disabled={purchasing}
                      sx={{ 
                        borderColor: '#ed5d19', 
                        color: '#ed5d19',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { borderColor: '#ff7d47', bgcolor: 'rgba(237, 93, 25, 0.08)' },
                        borderRadius: '10px'
                      }}
                    >
                      Купить через Telegram
                    </Button>
                  </Card>
                </Box>
              </Box>
            )}

            {subscriptionInfo?.balance !== undefined && (
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                 <Typography variant="caption" sx={{ color: 'grey.600' }}>
                   Баланс: <span style={{ color: '#fff', fontWeight: 600 }}>{subscriptionInfo.balance} ATM</span>
                 </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </div>
    )
  );
};

export default SubscriptionPurchase;