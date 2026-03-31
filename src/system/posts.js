import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from './axios';

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  try {
    const { data } = await axios.get('/posts');
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
});

export const fetchTags = createAsyncThunk('posts/fetchTags', async () => {
  try {
    const { data } = await axios.get('/tags');

    const uniqueTags = new Set();
    
    if (Array.isArray(data)) {
      data.forEach(post => {
        if (post.tags) {
          const tagsArray = post.tags.split(',').map(tag => tag.trim());
          tagsArray.forEach(tag => {
            if (tag) uniqueTags.add(tag);
          });
        }
      });
    }
    

    return Array.from(uniqueTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: {
      items: [],
      status: 'idle',
      error: null
    },
    tags: {
      items: [],
      status: 'idle',
      error: null
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.posts.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts.status = 'succeeded';
        state.posts.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.posts.status = 'failed';
        state.posts.error = action.error.message;
      })
      
      .addCase(fetchTags.pending, (state) => {
        state.tags.status = 'loading';
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags.status = 'succeeded';
        state.tags.items = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.tags.status = 'failed';
        state.tags.error = action.error.message;
      });
  },
});

export const postsReducer = postsSlice.reducer;
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
