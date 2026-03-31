import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  dark: {
    name: 'Темная',
    background: '#000000',
    backgroundImage: 'url("https://atomglidedev.ru/uploads/1773356015302-567094735.png")',
    // Для эффекта стекла в Soft UI лучше использовать полупрозрачность
    surface: 'rgba(28, 28, 30, 0.7)', 
    surfaceHover: 'rgba(44, 44, 46, 0.8)',
    text: 'rgba(255, 255, 255, 0.9)',
    textSecondary: 'rgba(154, 153, 153, 1)',
    border: 'rgba(255, 255, 255, 0.1)',
    accent: 'rgba(237, 93, 25, 1)', // Твой фирменный оранжевый
    glass: 'blur(20px) saturate(180%)',
  },
  light: {
    name: 'Светлая',
    background: '#ffffff',
    backgroundImage: 'none',
    surface: 'rgba(242, 242, 247, 0.8)',
    surfaceHover: 'rgba(230, 230, 235, 0.9)',
    text: 'rgba(0, 0, 0, 0.87)',
    textSecondary: 'rgba(60, 60, 67, 0.6)',
    border: 'rgba(0, 0, 0, 0.1)',
    accent: 'rgba(237, 93, 25, 1)',
    glass: 'blur(20px) saturate(180%)',
  },
  // Остальные темы (розовая, синяя и т.д.) по аналогии с light, 
  // если хочешь там оставить чистый цвет без картинки
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('atomglide-theme');
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('atomglide-theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const theme = themes[currentTheme];
    const s = document.body.style;

    // Плавный переход при смене темы
    s.transition = 'background 0.3s ease, color 0.3s ease';
    
    // Применяем фон
    s.backgroundColor = theme.background;
    s.backgroundImage = theme.backgroundImage || 'none';
    s.backgroundSize = 'cover';
    s.backgroundPosition = 'center';
    s.backgroundAttachment = 'fixed';
    s.backgroundRepeat = 'no-repeat';
    
    // Применяем основной цвет текста
    s.color = theme.text;

    // Передаем переменные в CSS для использования в компонентах
    const root = document.documentElement;
    root.style.setProperty('--theme-surface', theme.surface);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-border', theme.border);
    root.style.setProperty('--theme-glass', theme.glass);
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    changeTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * AtomGlide Ecosystem v14
 * AI Systems Engineer & Solopreneur: Dmitry Khorov
 * Enterprise Architecture / DK Studio Production
 * 2026
 */