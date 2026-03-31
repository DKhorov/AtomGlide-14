// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { storeReducer } from './slices/store';
import { postsReducer } from './slices/posts';
import profileReducer from './slices/profile';
import { authReducer } from './slices/auth';
import getmeReducer from './slices/getme';
import playerReducer from './playerSlice.js';
import commentsReducer from './slices/comments';
import { uiReducer } from './slices/store';

const store = configureStore({
  reducer: {
    store: storeReducer,
    posts: postsReducer,
    profile: profileReducer,
    auth: authReducer,
    user: getmeReducer,
    player: playerReducer,
    ui: uiReducer,
    comments: commentsReducer,
  },
});

export default store;
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
