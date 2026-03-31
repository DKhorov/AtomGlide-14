export const normalizeStyles = {
  html: {
    lineHeight: 1.15,
    WebkitTextSizeAdjust: '100%',
    boxSizing: 'border-box',
  },
  body: {
    margin: 0,
    padding: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    color: '#333',
        backgroundColor: 'rgba(0, 0, 0, 1)',

    lineHeight: 1.6,
    overflowX: 'hidden',
  },
  '*': {
    boxSizing: 'inherit',
  },
  '*, *::before, *::after': {
    boxSizing: 'border-box',
  },
  'html, body': {
    height: '100%',
    width: '100%',
    margin: 0,
    padding: 0,
  },
  
  'img': {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
  },
  'button': {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  'input, textarea, select': {
    fontFamily: 'inherit',
    fontSize: 'inherit',
  },
  'a': {
    textDecoration: 'none',
    color: 'inherit',
  },
  'ul, ol': {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  'h1, h2, h3, h4, h5, h6': {
    margin: 0,
    fontWeight: 'normal',
  },
  'p': {
    margin: 0,
  },
};

export const createNormalizedTheme = (baseTheme) => ({
  ...baseTheme,
  components: {
    ...baseTheme.components,
    MuiCssBaseline: {
      styleOverrides: normalizeStyles,
    },
  },
});

export const normalizeCSS = `
  html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: rgba(0, 0, 0, 1);
    color: #333;
    line-height: 1.6;
    overflow-x: hidden;
  }
  
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  html, body {
    height: 100%;
    width: 100%;
  }
  
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  
  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
  }
  
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
  
  ul, ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: normal;
  }
  
  p {
    margin: 0;
  }
`; 
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
