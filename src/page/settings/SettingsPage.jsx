import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Switch,
  Divider,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  FiChevronRight,
  FiUser,
  FiBell,     // Иконка уведомлений
  FiLock,     // Иконка замка для инструкции
  FiEye,
  FiGlobe,
  FiHelpCircle,
  FiInfo,
  FiLogOut,
  FiMoon,
  FiVolume2,
  FiShield,
  FiDatabase,
  FiArrowLeft,
  FiCheck,
  FiLayout,
  FiCpu,
  FiPackage,
  FiActivity,
  FiMessageSquare,
  FiSmartphone, // Иконка телефона
  FiRefreshCw   // Иконка обновления
} from 'react-icons/fi';
import axios from '../../system/axios';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
// Импорт функции подписки (убедитесь, что путь верный)
import { subscribeUserToPush } from '../../system/push-subscribe';

const SettingsSection = ({ title, children, isMobile, theme }) => (
  <Box sx={{ mb: 3, maxWidth: isMobile ? '100%' : '800px', mx: 'auto' }}>
    <Typography
      sx={{
        fontSize: '13px',
        fontWeight: 600,
        color: theme.textSecondary,
        textTransform: 'uppercase',
        mb: 1,
        px: 2,
      }}
    >
      {title}
    </Typography>
    <Box
      sx={{
        backgroundColor: theme.surface,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  </Box>
);

const SettingsItem = ({
  icon: Icon,
  label,
  value,
  onClick,
  showArrow = true,
  showSwitch = false,
  switchValue,
  onToggle,
  color = 'rgba(237, 93, 25, 1)',
  noBorder = false,
  isChecked = false, 
}) => (
  <>
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? { backgroundColor: 'rgba(48, 48, 48, 1)' }
          : {},
        transition: 'background-color 0.2s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {Icon && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={18} color="white" />
          </Box>
        )}
        <Typography sx={{ color: 'white', fontSize: '15px', ml: Icon ? 0 : 1 }}>
          {label}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {value && (
          <Typography
            sx={{ color: 'rgba(154, 153, 153, 1)', fontSize: '15px' }}
          >
            {value}
          </Typography>
        )}
        {showSwitch && (
          <Switch
            checked={switchValue}
            onChange={onToggle}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: 'rgba(237, 93, 25, 1)',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'rgba(237, 93, 25, 1)',
              },
            }}
          />
        )}
        {isChecked && <FiCheck size={20} color="rgba(237, 93, 25, 1)" />}
        {showArrow && !showSwitch && !isChecked && (
          <FiChevronRight size={20} color="rgba(154, 153, 153, 1)" />
        )}
      </Box>
    </Box>
    {!noBorder && (
      <Divider sx={{ borderColor: 'rgba(209, 209, 209, 0.1)', ml: Icon ? 7 : 2 }} />
    )}
  </>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:900px)');
  const { theme: activeTheme, themes, currentTheme } = useCustomTheme();
  
  const [user, setUser] = useState(null);
  
  // Состояние настроек
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: false, // По умолчанию выключено, пока не проверим
    soundEnabled: true,
    autoPlayVideos: false,
    showOnlineStatus: true,
    privateProfile: false,
  });

  const [currentView, setCurrentView] = useState('main'); 
  
  // Модальные окна
  const [modals, setModals] = useState({
    help: false,
    about: false,
    plugins: false,      
    recommendations: false,
    notificationsHelp: false // Новое модальное окно для инструкции
  });

  const [selectedLanguage, setSelectedLanguage] = useState('Русский');
  const [recFormat, setRecFormat] = useState('Умный');

  const languages = [
    { code: 'be', label: 'Беларуская' },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
    { code: 'kk', label: 'Қазақша' },
  ];

  const pluginsList = [
    { id: 1, name: 'AtomAdBlock', version: '2.4.1', desc: 'Блокирует внешнюю рекламу, ускоряя загрузку страниц.' },
    { id: 2, name: 'NightVibes', version: '1.0.3', desc: 'Улучшает цветокоррекцию в ночном режиме для защиты зрения.' },
    { id: 3, name: 'CryptoWallet Core', version: '0.9.5', desc: 'Базовый модуль для работы с транзакциями AtomCoin.' },
  ];

  const recommendationOptions = [
    'Умный',
    'Расширенный',
    'Простой',
    'Линейная регрессия',       
    'Стохастическая фильтрация', 
    'Байесовский вывод'          
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/auth/me');
        setUser(res.data.user || res.data);
        
        // Проверяем статус прав при загрузке
        if ('Notification' in window && Notification.permission === 'granted') {
           setSettings(prev => ({ ...prev, notifications: true }));
        }
      } catch (err) {
        console.error('Ошибка загрузки пользователя:', err);
      }
    };
    fetchUser();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // --- ЛОГИКА УВЕДОМЛЕНИЙ ---
  const handleNotificationToggle = async () => {
    // 1. Если браузер не поддерживает
    if (!('Notification' in window)) {
      alert('Ваш браузер не поддерживает уведомления.');
      return;
    }

    // 2. Если уже разрешено -> просто переключаем UI (можно добавить логику отписки)
    if (Notification.permission === 'granted') {
      // Если было включено и нажали выкл -> можно добавить логику отписки (unregister),
      // но для простоты просто меняем стейт.
      setSettings(prev => ({ ...prev, notifications: !prev.notifications }));
      if (!settings.notifications) {
          // Если включаем заново, на всякий случай обновляем подписку
          await subscribeUserToPush();
      }
      return;
    }

    // 3. Если запрещено (Denied) -> Показываем инструкцию
    if (Notification.permission === 'denied') {
      setModals(prev => ({ ...prev, notificationsHelp: true }));
      return;
    }

    // 4. Если 'default' (еще не спрашивали) -> Запрашиваем
    try {
        await subscribeUserToPush();
        // Если подписка прошла успешно, permission станет granted
        if (Notification.permission === 'granted') {
           setSettings(prev => ({ ...prev, notifications: true }));
        }
    } catch (error) {
        console.error("Ошибка при включении уведомлений", error);
    }
  };
  // ---------------------------

  const handleLogout = () => {
    const confirmLogout = window.confirm("Вы уверены, что хотите выйти?");

    if (confirmLogout) {
      localStorage.removeItem('token');
          window.location.href = '/'; 
    }
  };

  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return undefined;
    if (user.avatarUrl.startsWith('http')) return user.avatarUrl;
    return `https://atomglidedev.ru${user.avatarUrl}`;
  };

  const toggleModal = (modalName, show) => {
    setModals(prev => ({ ...prev, [modalName]: show }));
  };

  const handleWikiRedirect = () => {
    window.location.href = '/atomwiki.html';
  };

  if (currentView === 'language') {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: activeTheme.background, pt: isMobile ? 2 : 13, px: isMobile ? 2 : 3 }}>
        <Box sx={{ maxWidth: isMobile ? '100%' : '800px', mx: 'auto', mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => setCurrentView('main')} sx={{ color: activeTheme.text }}>
            <FiArrowLeft size={24} />
          </IconButton>
          <Typography variant="h5" sx={{ color: activeTheme.text, fontWeight: 'bold' }}>
            Язык приложения
          </Typography>
        </Box>
        <SettingsSection title="Выберите язык" isMobile={isMobile} theme={activeTheme}>
          {languages.map((lang, index) => (
            <SettingsItem
              key={lang.code}
              label={lang.label}
              onClick={() => setSelectedLanguage(lang.label)}
              isChecked={selectedLanguage === lang.label}
              showArrow={false}
              noBorder={index === languages.length - 1}
              icon={null}
            />
          ))}
        </SettingsSection>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: isMobile ? '100vw' : '100%',
        height: '100vh',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': { width: '0px', background: 'transparent' },
        paddingBottom: isMobile ? '70px' : 0,
        px: isMobile ? 2 : 3,mt:3
      }}
    >
      <Box sx={{ maxWidth: isMobile ? '100%' : '800px', mx: 'auto' }}>
        <Typography variant="h4" sx={{ color: activeTheme.text, fontWeight: 'bold', mb: 3, px: 1 }}>
          Настройки
        </Typography>
      </Box>

      {user && (
        <SettingsSection title="Профиль" isMobile={isMobile} theme={activeTheme}>
          <Box onClick={() => navigate('/setting')} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(48, 48, 48, 1)' }, transition: 'background-color 0.2s' }}>
            <Avatar src={getAvatarUrl()} sx={{ width: 60, height: 60, bgcolor: 'rgba(237, 93, 25, 1)' }}>{user.fullName?.[0]?.toUpperCase() || 'U'}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: 'white', fontSize: '17px', fontWeight: 600 }}>{user.fullName || 'Пользователь'}</Typography>
              <Typography sx={{ color: 'rgba(154, 153, 153, 1)', fontSize: '14px' }}>{user.username || 'username'}</Typography>
            </Box>
            <FiChevronRight size={20} color="rgba(154, 153, 153, 1)" />
          </Box>
        </SettingsSection>
      )}

      <SettingsSection title="Аккаунт" isMobile={isMobile} theme={activeTheme}>
        <SettingsItem icon={FiUser} label="Редактировать профиль" onClick={() => navigate('/setting')} color="rgba(237, 93, 25, 1)" />
      </SettingsSection>

      <SettingsSection title="Настройки" isMobile={isMobile} theme={activeTheme}>
        <SettingsItem icon={FiMoon} label="Тема оформления" value={themes[currentTheme]?.name || 'Темная'} onClick={() => navigate('/settings/theme')} color="rgba(94, 92, 230, 1)" />
        
        {/* Кнопка уведомлений с обработчиком */}
        <SettingsItem 
            icon={FiBell} 
            label="Push-уведомления" 
            showSwitch 
            switchValue={settings.notifications} 
            onToggle={handleNotificationToggle} 
            color="rgba(255, 55, 95, 1)" 
        />
        
        <SettingsItem icon={FiVolume2} label="Высокое качество звука" showSwitch switchValue={settings.soundEnabled} onToggle={() => handleToggle('soundEnabled')} color="rgba(255, 149, 0, 1)" />
        
               <SettingsItem icon={FiVolume2} label="Dolby Atmos поддержка" showSwitch switchValue={settings.soundEnabled} onToggle={() => handleToggle('soundEnabled')} color="rgba(255, 149, 0, 1)" />
               <SettingsItem icon={FiVolume2} label="Высокое качество обложки" showSwitch switchValue={settings.soundEnabled} onToggle={() => handleToggle('soundEnabled')} color="rgba(255, 149, 0, 1)" />

        
      </SettingsSection>

      <SettingsSection title="Поддержка" isMobile={isMobile} theme={activeTheme}>
        <SettingsItem icon={FiHelpCircle} label="Помощь" onClick={() => toggleModal('help', true)} color="rgba(90, 200, 250, 1)" />
        <SettingsItem icon={FiInfo} label="О приложении" value="v13" onClick={() => toggleModal('about', true)} color="rgba(142, 142, 147, 1)" noBorder />
                <SettingsItem icon={FiLogOut} label="Выйти c аккаунта" onClick={handleLogout} showArrow={false} color="rgba(255, 59, 48, 1)" noBorder />

      </SettingsSection>


      <Box sx={{ maxWidth: isMobile ? '100%' : '800px', mx: 'auto' ,mb:30}}>
        <Typography sx={{ textAlign: 'center', color: 'rgba(154, 153, 153, 1)', fontSize: '12px', pb: 4 }}>
          AtomGlide © 2026<br />Author: Dmitry
        </Typography>
      </Box>

      {/* --- МОДАЛЬНЫЕ ОКНА --- */}

      <Dialog open={modals.help} onClose={() => toggleModal('help', false)} PaperProps={{ style: { backgroundColor: activeTheme.surface, color: 'white', borderRadius: 16, minWidth: 300 } }}>
        <DialogContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>Перейти в AtomWiki?</Typography>
          <Typography sx={{ color: activeTheme.textSecondary, textAlign: 'center', fontSize: '14px' }}>Вы собираетесь открыть справочный центр в новой вкладке.</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={() => toggleModal('help', false)} sx={{ color: 'white' }}>Отмена</Button>
          <Button onClick={handleWikiRedirect} variant="contained" sx={{ bgcolor: 'rgba(237, 93, 25, 1)', '&:hover': { bgcolor: '#d44910' } }}>Перейти</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modals.about} onClose={() => toggleModal('about', false)} maxWidth="xs" fullWidth PaperProps={{ style: { backgroundColor: activeTheme.surface, color: 'white', borderRadius: 20, padding: '10px' } }}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2, fontSize: 40 }} variant="rounded" src='1.png'>A</Avatar>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>AtomGlide</Typography>
          <Typography sx={{ color: activeTheme.textSecondary, mb: 3 }}>Версия: 13</Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, boxShadow: 'none' }}>
            <Table size="small">
              <TableBody>
                <TableRow><TableCell sx={{ color: activeTheme.textSecondary, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Версия</TableCell><TableCell align="right" sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>13.0 2026.01. D3JK3</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: activeTheme.textSecondary, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Engine</TableCell><TableCell align="right" sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>React 18 / BSI Gen 2</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: activeTheme.textSecondary, borderBottom: 'none' }}>Разработчик</TableCell><TableCell align="right" sx={{ color: 'white', borderBottom: 'none' }}>Dmitry K.</TableCell></TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={() => toggleModal('about', false)} fullWidth sx={{ color: 'rgba(237, 93, 25, 1)', fontWeight: 'bold' }}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={modals.plugins} 
        onClose={() => toggleModal('plugins', false)} 
        fullWidth
        maxWidth="sm"
        PaperProps={{ style: {  color: 'white', borderRadius: 20 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Установленные плагины
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List>
            {pluginsList.map((plugin, idx) => (
              <React.Fragment key={plugin.id}>
                <ListItem alignItems="flex-start" sx={{ px: 3, py: 2 }}>
                  <Box sx={{ mr: 2, mt: 0.5 }}>
                     <Avatar sx={{ color: '#ff2d55' }}>
                       <FiPackage />
                     </Avatar>
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 600, color: 'white' }}>{plugin.name}</Typography>
                        <Box sx={{  borderRadius: '4px', px: 0.5 }}>
                          <Typography variant="caption" sx={{ color: activeTheme.textSecondary }}>v{plugin.version}</Typography>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: 'rgba(154, 153, 153, 1)', mt: 0.5 }}>
                        {plugin.desc}
                      </Typography>
                    }
                  />
                </ListItem>
                {idx < pluginsList.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', ml: 9 }} />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => toggleModal('plugins', false)} sx={{ color: 'rgba(237, 93, 25, 1)' }}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={modals.recommendations} 
        onClose={() => toggleModal('recommendations', false)} 
        fullWidth
        maxWidth="xs"
        PaperProps={{ style: { backgroundColor: activeTheme.surface, color: 'white', borderRadius: 20 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Формат рекомендаций
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box>
            {recommendationOptions.map((option, idx) => (
              <React.Fragment key={option}>
                <Box 
                  onClick={() => setRecFormat(option)}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    px: 3,
                    cursor: 'pointer',
                    bgcolor: recFormat === option ? 'rgba(255,255,255,0.05)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                  }}
                >
                  <Typography sx={{ color: 'white', fontSize: '15px' }}>{option}</Typography>
                  {recFormat === option && <FiCheck color="rgba(237, 93, 25, 1)" size={20} />}
                </Box>
                {idx < recommendationOptions.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 2 }} />}
              </React.Fragment>
            ))}
          </Box>
          <Box sx={{ p: 3, bgcolor: 'rgba(237, 93, 25, 0.1)', mt: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(154, 153, 153, 1)', display: 'block', textAlign: 'center', lineHeight: 1.4 }}>
              <FiActivity style={{ marginBottom: -2, marginRight: 4 }} />
              Рекомендации дают точный ваш список любых постов или музыки, основываясь на выбранном математическом алгоритме подбора.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => toggleModal('recommendations', false)} sx={{ color: 'rgba(237, 93, 25, 1)' }}>Готово</Button>
        </DialogActions>
      </Dialog>

      {/* --- МОДАЛЬНОЕ ОКНО ИНСТРУКЦИИ ДЛЯ УВЕДОМЛЕНИЙ --- */}
      <Dialog 
        open={modals.notificationsHelp} 
        onClose={() => toggleModal('notificationsHelp', false)} 
        fullWidth
        maxWidth="sm"
        PaperProps={{ style: { backgroundColor: activeTheme.surface, color: 'white', borderRadius: 20 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            <FiBell size={24} color="rgba(255, 55, 95, 1)"/>
            Как включить уведомления?
        </DialogTitle>
        <DialogContent>
            <Typography variant="body2" sx={{ color: 'rgba(154, 153, 153, 1)', mb: 3 }}>
                Похоже, вы запретили уведомления для этого сайта. Браузер не позволяет нам включить их автоматически. Вот как это исправить:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                
                {/* Инструкция для ПК/Android */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ minWidth: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiLock size={20} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>1. Настройки сайта</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(154, 153, 153, 1)' }}>
                            Нажмите на значок <b>замка</b> или настроек слева от адреса сайта (вверху экрана).
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ minWidth: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiCheck size={20} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>2. Разрешите доступ</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(154, 153, 153, 1)' }}>
                            Найдите пункт <b>«Уведомления»</b> и выберите <b>«Разрешить»</b> (Allow). Или нажмите «Сбросить разрешения».
                        </Typography>
                    </Box>
                </Box>

                 <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ minWidth: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiRefreshCw size={20} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>3. Обновите страницу</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(154, 153, 153, 1)' }}>
                            После изменения настроек обновите страницу и попробуйте включить тумблер снова.
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* Инструкция для iPhone */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mt: 1 }}>
                     <Box sx={{ minWidth: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiSmartphone size={20} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Для пользователей iPhone</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(154, 153, 153, 1)' }}>
                            На iOS уведомления работают только если добавить сайт на экран «Домой».<br/>
                            Нажмите <b>Поделиться</b> → <b>На экран «Домой»</b>.
                        </Typography>
                    </Box>
                </Box>

            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => toggleModal('notificationsHelp', false)} sx={{ color: 'white' }}>Понятно</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default SettingsPage;