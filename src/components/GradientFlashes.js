import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';

const GradientFlashes = ({ duration = 3000, onComplete }) => {
  const [flashes, setFlashes] = useState([
    { id: 1, bg: 'linear-gradient(45deg, #ff0080, #ff8c00)', width: 120, height: 120, top: 80, left: 150, delay: 0 },
    { id: 2, bg: 'linear-gradient(135deg, #00ccff, #00ff99)', width: 100, height: 100, bottom: 100, right: 180, delay: 1.2 },
    { id: 3, bg: 'linear-gradient(225deg, #bf00ff, #ff0055)', width: 90, height: 90, top: 220, left: 320, delay: 2.5 },
    { id: 4, bg: 'linear-gradient(315deg, #ffeb3b, #ff9800)', width: 130, height: 130, bottom: 120, left: 230, delay: 3.8 },
    { id: 5, bg: 'linear-gradient(45deg, #4facfe, #00f2fe)', width: 110, height: 110, top: 150, right: 200, delay: 0.8 },
    { id: 6, bg: 'linear-gradient(135deg, #f093fb, #f5576c)', width: 95, height: 95, bottom: 180, left: 100, delay: 2.2 }
  ]);

  const [customFlashes, setCustomFlashes] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const createFlash = (x, y) => {
    const gradients = [
      'linear-gradient(45deg, #ff0080, #ff8c00)',
      'linear-gradient(135deg, #00ccff, #00ff99)',
      'linear-gradient(225deg, #bf00ff, #ff0055)',
      'linear-gradient(315deg, #ffeb3b, #ff9800)',
      'linear-gradient(45deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(225deg, #fdbb2d, #22c1c3)',
      'linear-gradient(315deg, #ff9a9e, #fad0c4)'
    ];

    const newFlash = {
      id: Date.now(),
      bg: gradients[Math.floor(Math.random() * gradients.length)],
      width: Math.random() * 60 + 60,
      height: Math.random() * 60 + 60,
      x: x - 30,
      y: y - 30,
      delay: 0
    };

    setCustomFlashes(prev => [...prev, newFlash]);

    setTimeout(() => {
      setCustomFlashes(prev => prev.filter(flash => flash.id !== newFlash.id));
    }, 3000);
  };

  const handleClick = (e) => {
    createFlash(e.clientX, e.clientY);
  };

  const addRandomFlash = () => {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    createFlash(x, y);
  };

  const changeColors = () => {
    const gradients = [
      ['#4facfe', '#00f2fe'],
      ['#f093fb', '#f5576c'],
      ['#fdbb2d', '#22c1c3'],
      ['#ff9a9e', '#fad0c4'],
      ['#a1c4fd', '#c2e9fb'],
      ['#ffecd2', '#fcb69f'],
      ['#84fab0', '#8fd3f4'],
      ['#d4fc79', '#96e6a1']
    ];

    setFlashes(prev => prev.map(flash => {
      const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
      const angle = Math.floor(Math.random() * 360);
      return {
        ...flash,
        bg: `linear-gradient(${angle}deg, ${randomGradient[0]}, ${randomGradient[1]})`
      };
    }));
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        overflow: 'hidden',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      {/* Белая дымка (overlay) */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, transparent 30%, black 70%)',
          mixBlendMode: 'multiply',
          zIndex: 2
        }}
      />

      {flashes.map(flash => (
        <Box
          key={flash.id}
          sx={{
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(30px)',
            opacity: 0,
            animation: 'flash 5s infinite',
            background: flash.bg,
            width: `${flash.width}px`,
            height: `${flash.height}px`,
            top: flash.top ? `${flash.top}px` : 'auto',
            bottom: flash.bottom ? `${flash.bottom}px` : 'auto',
            left: flash.left ? `${flash.left}px` : 'auto',
            right: flash.right ? `${flash.right}px` : 'auto',
            animationDelay: `${flash.delay}s`,
            zIndex: 1
          }}
        />
      ))}

      {customFlashes.map(flash => (
        <Box
          key={flash.id}
          sx={{
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(30px)',
            opacity: 0,
            animation: 'flash 3s forwards',
            background: flash.bg,
            width: `${flash.width}px`,
            height: `${flash.height}px`,
            left: `${flash.x}px`,
            top: `${flash.y}px`,
            zIndex: 1
          }}
        />
      ))}

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 0,
          animation: 'glowPulse 8s infinite alternate',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '3.2rem',
          textAlign: 'center',
          textShadow: '0 0 15px rgba(255, 255, 255, 0.4)',
          zIndex: 10,
          animation: 'pulse 3s infinite alternate',
          letterSpacing: '3px',
          fontWeight: 700,
        }}
      >
        ГРАДИЕНТНЫЕ ВСПЫШКИ
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '62%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.3rem',
          textAlign: 'center',
          zIndex: 10,
          animation: 'pulse 3s infinite alternate',
          animationDelay: '0.5s',
          fontWeight: 300,
        }}
      >
        Небольшие яркие всплески цвета
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.9rem',
          textAlign: 'center',
          zIndex: 100,
        }}
      >
        Кликните в любом месте для создания вспышки
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '16px',
          zIndex: 100,
        }}
      >
        <Button
          variant="outlined"
          sx={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: '0.9rem',
            backdropFilter: 'blur(5px)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.25)',
              transform: 'translateY(-2px)',
            }
          }}
          onClick={addRandomFlash}
        >
          + Вспышка
        </Button>
        
        <Button
          variant="outlined"
          sx={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: '0.9rem',
            backdropFilter: 'blur(5px)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.25)',
              transform: 'translateY(-2px)',
            }
          }}
          onClick={changeColors}
        >
          Сменить цвета
        </Button>
      </Box>
    </Box>
  );
};

export default GradientFlashes;
/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00
