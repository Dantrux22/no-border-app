// src/redux/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = { currentUser: null };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) { state.currentUser = action.payload; },
    clearUser(state) { state.currentUser = null; },
    updateAvatar(state, action) {
      if (state.currentUser) {
        if ('emoji' in action.payload) state.currentUser.avatar = action.payload.emoji;
        if ('url' in action.payload) state.currentUser.avatarUrl = action.payload.url;
      }
    },
  },
});

export const { setUser, clearUser, updateAvatar } = userSlice.actions;
export default userSlice.reducer;
