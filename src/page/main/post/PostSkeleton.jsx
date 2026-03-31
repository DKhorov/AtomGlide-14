import React from 'react';
import { Box, Skeleton } from '@mui/material';

const PostSkeleton = () => (
  <Box sx={{ 
     backgroundColor: 'rgba(17, 17, 17, 1)',
      border: "solid rgb(34,34,34) 2px",
    borderRadius: 5, 
    p: 2, 
    mb: 2, 
    position: 'relative',
    minHeight: 400,
    opacity: 0,
    mt:1,
    animation: 'fadeIn 0.5s ease-out forwards',
    '@keyframes fadeIn': {
      '0%': { opacity: 0, transform: 'translateY(20px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Skeleton 
        variant="circular" 
        width={40} 
        height={40}
        sx={{
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <Box sx={{ ml: 2, flex: 1 }}>
        <Skeleton 
          variant="text" 
          width="60%" 
          height={20}
          sx={{
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: '0.1s',
          }}
        />
        <Skeleton 
          variant="text" 
          width="40%" 
          height={16}
          sx={{
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: '0.2s',
          }}
        />
      </Box>
    </Box>
    <Skeleton 
      variant="rectangular" 
      width="100%" 
      height={300} 
      sx={{ 
        borderRadius: 1, 
        mb: 2,
        animation: 'pulse 1.5s ease-in-out infinite',
        animationDelay: '0.3s',
      }} 
    />
    <Skeleton 
      variant="text" 
      width="90%" 
      height={24}
      sx={{
        animation: 'pulse 1.5s ease-in-out infinite',
        animationDelay: '0.4s',
      }}
    />
    <Skeleton 
      variant="text" 
      width="70%" 
      height={16}
      sx={{
        animation: 'pulse 1.5s ease-in-out infinite',
        animationDelay: '0.5s',
      }}
    />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
      <Skeleton 
        variant="text" 
        width="30%" 
        height={14}
        sx={{
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: '0.6s',
        }}
      />
      <Skeleton 
        variant="text" 
        width="20%" 
        height={14}
        sx={{
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: '0.7s',
        }}
      />
    </Box>
  </Box>
);

export default PostSkeleton; 
/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
