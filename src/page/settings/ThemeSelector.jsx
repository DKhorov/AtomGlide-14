import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, useMediaQuery } from '@mui/material';
import { FiChevronLeft, FiCheck } from 'react-icons/fi';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

const ThemeSelector = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:900px)');
  const { currentTheme, themes, changeTheme, theme: activeTheme } = useCustomTheme();

  const themeColors = {
    dark: '#000000',
    pink: '#ff69b4',
    blue: '#1e90ff',
    purple: '#8a2be2',
    green: '#228b22',
    orange: '#ff8c00',
    red: '#dc143c',
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: isMobile ? '100vw' : '100%',
        height: '100vh',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': {
          width: '0px',
          background: 'transparent',
        },
        paddingBottom: isMobile ? '70px' : 0,
        px: isMobile ? 2 : 3,
        pt: isMobile ? 2 : 6,
      }}
    >
      <Box sx={{ maxWidth: isMobile ? '100%' : '800px', mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => navigate('/settings')}
            sx={{
              color: activeTheme.text,
              mr: 2,
              '&:hover': { backgroundColor: activeTheme.surfaceHover },
            }}
          >
            <FiChevronLeft size={24} />
          </IconButton>
          <Typography
            variant="h5"
            sx={{
              color: activeTheme.text,
              fontWeight: 'bold',
            }}
          >
            Выбор темы
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(2, 1fr)'
              : 'repeat(4, 1fr)',
            gap: 2,
            mb: 3,
          }}
        >
          {Object.entries(themes)
          .filter(([key]) => key !== 'light')
          .map(([key, themeData]) => (
            <Box
              key={key}
              onClick={() => changeTheme(key)}
              sx={{
                position: 'relative',
                aspectRatio: '1',
                cursor: 'pointer',
          
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: `0 8px 24px ${themeColors[key]}40`,
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  border: `solid 1px white`,
                  opacity: 0.9,
                }}
              />

              {currentTheme === key && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: activeTheme.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}
                >
                  <FiCheck size={20} color="white" />
                </Box>
              )}

              <Typography
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  color: themeData.text,
                  fontWeight: 600,
                  fontSize: isMobile ? '14px' : '16px',
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
               Space Gray 
              </Typography>

              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  backgroundColor: themeData.accent,
                }}
              />
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            backgroundColor: activeTheme.surface,
            borderRadius: '12px',
            p: 2,
            mb: 3,
          }}
        >
          <Typography
            sx={{
              color: activeTheme.textSecondary,
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            BSI Gen 4 поддерживает только Space Gray версию. BSI ( Basic Software Interface - базовый дизайн продуктов компании atomglide. Разработана в студии дизайна Design by jpegweb)
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: activeTheme.surface,
            borderRadius: '12px',
            p: 3,
          }}
        >
          <Typography
            sx={{
              color: activeTheme.text,
              fontSize: '16px',
              fontWeight: 600,
              mb: 2,
            }}
          >
            Текущая тема: BSI Space Gray
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '120px' }}>
              <Typography
                sx={{
                  color: activeTheme.textSecondary,
                  fontSize: '12px',
                  mb: 0.5,
                }}
              >
                Фон
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                 
                  border: `1px solid ${activeTheme.border}`,
                }}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: '120px' }}>
              <Typography
                sx={{
                  color: activeTheme.textSecondary,
                  fontSize: '12px',
                  mb: 0.5,
                }}
              >
                Поверхность
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: activeTheme.surface,
                  border: `1px solid ${activeTheme.border}`,
                }}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: '120px' }}>
              <Typography
                sx={{
                  color: activeTheme.textSecondary,
                  fontSize: '12px',
                  mb: 0.5,
                }}
              >
                Акцент
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  border: `1px solid ${activeTheme.border}`,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ThemeSelector;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
