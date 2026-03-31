self.onmessage = async function(e) {
  const { type, payload } = e.data;
  if (type === 'getPosts') {
    try {
      const { offset = 0, limit = 1000, userId } = payload || {};
      const base = 'https://atomglidedev.ru';
      let url = `${base}/posts?offset=${offset}&limit=${limit}`;
      if (userId) url = `${base}/posts/user/${userId}?offset=${offset}&limit=${limit}`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      self.postMessage({ type: 'posts', data });
    } catch (err) {
      self.postMessage({ type: 'error', error: err.message });
    }
  }
}; 
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
