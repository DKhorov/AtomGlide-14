import axios from "axios";
let setLoadingGlobal = null;
let requests = 0;

export const setGlobalLoadingSetter = (setter) => { setLoadingGlobal = setter; };

const instance = axios.create({
  baseURL:  "https://atomglidedev.ru", // Замените 
  withCredentials: true
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (setLoadingGlobal) {
    requests++;
    setLoadingGlobal(true);
  }
  return config;
});
 
instance.interceptors.response.use(response => {
  if (setLoadingGlobal) {
    requests--;
    if (requests === 0) setLoadingGlobal(false);
  }
  return response;
}, error => {
  if (setLoadingGlobal) {
    requests--;
    if (requests === 0) setLoadingGlobal(false);
  }
  return Promise.reject(error);
});

export default instance;

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
