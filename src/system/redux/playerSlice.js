import { createSlice } from '@reduxjs/toolkit';

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    activePlaylist: [],
    currentIndex: null,
    isPlaying: false,
  },
  reducers: {
    setTrack: (state, action) => {
      state.activePlaylist = action.payload.playlist;
      state.currentIndex = action.payload.index;
      state.isPlaying = true;
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    nextTrack: (state) => {
      if (state.currentIndex < state.activePlaylist.length - 1) {
        state.currentIndex += 1;
      }
    },
    // ДОБАВЛЯЕМ ЭТОТ БЛОК
    prevTrack: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
      }
    },
    stopPlayer: (state) => {
      state.activePlaylist = [];
      state.currentIndex = null;
      state.isPlaying = false;
    }
  }
});

// ДОБАВЛЯЕМ prevTrack В ЭКСПОРТ
export const { setTrack, togglePlay, nextTrack, prevTrack, stopPlayer } = playerSlice.actions;
export default playerSlice.reducer;