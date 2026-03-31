import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3005/users/${id}`);
      const data = await response.json();
      console.log('fetchProfile API response:', data);
      if (!response.ok) throw new Error('Ошибка загрузки профиля');
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSubscriptions = createAsyncThunk(
  'profile/fetchSubscriptions',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3005/users/${id}/subscriptions`);
      const data = await response.json();
      if (!response.ok) throw new Error('Ошибка загрузки подписок');
      return data.subscriptions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  'profile/fetchFollowers',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3005/users/${id}/followers`);
      const data = await response.json();
      if (!response.ok) throw new Error('Ошибка загрузки подписчиков');
      return data.followers;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const subscribe = createAsyncThunk(
  'profile/subscribe',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3005/auth/subscribe/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Ошибка подписки');
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const unsubscribe = createAsyncThunk(
  'profile/unsubscribe',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3005/auth/unsubscribe/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Ошибка отписки');
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    loading: false,
    error: null,
    subscriptions: [],
    followers: [],
    subLoading: false,
    subError: null,
    isSubscribed: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.subscriptions = action.payload;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followers = action.payload;
      })
      .addCase(subscribe.pending, (state) => {
        state.subLoading = true;
        state.subError = null;
      })
      .addCase(subscribe.fulfilled, (state) => {
        state.subLoading = false;
        state.isSubscribed = true;
      })
      .addCase(subscribe.rejected, (state, action) => {
        state.subLoading = false;
        state.subError = action.payload || action.error.message;
      })
      .addCase(unsubscribe.pending, (state) => {
        state.subLoading = true;
        state.subError = null;
      })
      .addCase(unsubscribe.fulfilled, (state) => {
        state.subLoading = false;
        state.isSubscribed = false;
      })
      .addCase(unsubscribe.rejected, (state, action) => {
        state.subLoading = false;
        state.subError = action.payload || action.error.message;
      });
  },
});

export default profileSlice.reducer; 
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
