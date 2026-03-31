// Gemini.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import { Menu as MenuIcon, LightMode, DarkMode } from '@mui/icons-material';

export const Gemini = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [eyeHeight, setEyeHeight] = useState(35);
  const [smileState, setSmileState] = useState({ height: 4, width: 60 });
  const [typewriterText, setTypewriterText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  const theme = useTheme();

  const fullText = "Девочка, а ты учишь Python?";
  const speed = 120;
  const cursorChar = "│";

  useEffect(() => {
    let i = 0;
    let blinkInterval;
    
    const type = () => {
      if (i <= fullText.length) {
        setTypewriterText(fullText.slice(0, i) + (showCursor ? " " + cursorChar : ""));
        i++;
        setTimeout(type, speed);
      } else {
        blinkInterval = setInterval(() => {
          setShowCursor(prev => !prev);
        }, 500);
      }
    };
    
    type();
    
    return () => {
      if (blinkInterval) clearInterval(blinkInterval);
    };
  }, []);

  useEffect(() => {
    const animateEyes = async () => {
      while (true) {
        setEyeHeight(34);
        await sleep(500);
        setEyeHeight(20);
        await sleep(3000);
        setEyeHeight(34);
        await sleep(Math.random() * 3000 + 3000);
      }
    };

    animateEyes();
  }, []);

  useEffect(() => {
    const animateSmile = async () => {
      while (true) {
        setSmileState({ height: 4, width: 60 });
        await sleep(500);
        setSmileState({ height: 50, width: 20 });
        await sleep(3000);
        setSmileState({ height: 4, width: 60 });
      }
    };

    animateSmile();
  }, []);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Box 
    sx={{
        px: 2,
        py: 2,
        pb:4,
        height: "100vh",
        overflowY: "auto",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { width: 0 }
      }}
    >
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4">Geromik</Typography>
        <IconButton 
          onClick={handleThemeToggle}
          sx={{ 
            fontSize: '28px', 
            cursor: 'pointer',
            transition: 'color 0.3s',
            color: isDarkMode ? 'white' : 'black'
          }}
        >
          {isDarkMode ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Box>

      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
      

        <Box 
          sx={{
            width: '110px',
            height: '190px',
            borderRadius: '100px',
            transition: 'background-color 0.3s',
            backgroundColor: isDarkMode ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
            marginBottom: '25px',
            position: 'relative'
          }}
        >
          <Box 
            sx={{
              display: 'flex',
              justifyContent: 'space-evenly',
              marginTop: '40px'
            }}
          >
            <Box 
              sx={{
                width: '18px',
                height: `${eyeHeight}px`,
                borderRadius: '100px',
                transition: 'height 0.3s',
                backgroundColor: isDarkMode ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)'
              }}
            />
            <Box 
              sx={{
                width: '18px',
                height: `${eyeHeight}px`,
                borderRadius: '100px',
                transition: 'height 0.3s',
                backgroundColor: isDarkMode ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)'
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <Box 
              sx={{
                width: `${smileState.width}px`,
                height: `${smileState.height}px`,
                borderRadius: '100px',
                transition: 'height 0.3s, width 0.3s',
                backgroundColor: isDarkMode ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)'
              }}
            />
          </Box>
        </Box>

     
      </Box>



      
     
    </Box>
  );
};

export default Gemini;