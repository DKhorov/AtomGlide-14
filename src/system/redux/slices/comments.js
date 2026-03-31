import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios';

// Async thunks
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (postId) => {
    const response = await axios.get(`/comment/post/${postId}`);
    return { postId, comments: response.data.comments, count: response.data.count };
  }
);

export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ text, postId, parentCommentId = null }) => {
    const response = await axios.post('/comment', {
      text,
      postId,
      parentCommentId
    });
    return { postId, comment: response.data.comment };
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async ({ commentId, postId }) => {
    await axios.delete(`/comment/${commentId}`);
    return { commentId, postId };
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    commentsByPost: {}, // { postId: { comments: [], count: 0, loading: false, error: null } }
    loading: false,
    error: null
  },
  reducers: {
    clearComments: (state, action) => {
      const postId = action.payload;
      delete state.commentsByPost[postId];
    },
    clearAllComments: (state) => {
      state.commentsByPost = {};
    },
    updateCommentCount: (state, action) => {
      const { postId, count } = action.payload;
      if (state.commentsByPost[postId]) {
        state.commentsByPost[postId].count = count;
      }
    },
    clearError: (state, action) => {
      const postId = action.payload;
      if (state.commentsByPost[postId]) {
        state.commentsByPost[postId].error = null;
      }
    },
    setCommentsForPost: (state, action) => {
      const { postId, comments, count } = action.payload;
      state.commentsByPost[postId] = {
        comments: comments || [],
        count: typeof count === 'number' ? count : (comments ? comments.length : 0),
        loading: false,
        error: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state, action) => {
        const postId = action.meta.arg;
        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = { comments: [], count: 0, loading: false, error: null };
        }
        state.commentsByPost[postId].loading = true;
        state.commentsByPost[postId].error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, comments, count } = action.payload;
        state.commentsByPost[postId] = {
          comments,
          count,
          loading: false,
          error: null
        };
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const postId = action.meta.arg;
        if (state.commentsByPost[postId]) {
          state.commentsByPost[postId].loading = false;
          state.commentsByPost[postId].error = action.error.message;
        }
      })
      
             // Create comment
       .addCase(createComment.pending, (state, action) => {
         const { postId } = action.meta.arg;
         if (state.commentsByPost[postId]) {
           state.commentsByPost[postId].loading = true;
         }
       })
       .addCase(createComment.fulfilled, (state, action) => {
         const { postId, comment } = action.payload;
         if (state.commentsByPost[postId]) {
           state.commentsByPost[postId].loading = false;
           // Добавляем новый комментарий в начало списка
           state.commentsByPost[postId].comments.unshift(comment);
           state.commentsByPost[postId].count += 1;
         }
       })
       .addCase(createComment.rejected, (state, action) => {
         const { postId } = action.meta.arg;
         if (state.commentsByPost[postId]) {
           state.commentsByPost[postId].loading = false;
           state.commentsByPost[postId].error = action.error.message;
         }
       })
      
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { commentId, postId } = action.payload;
        if (state.commentsByPost[postId]) {
          state.commentsByPost[postId].comments = state.commentsByPost[postId].comments.filter(
            comment => comment._id !== commentId
          );
          state.commentsByPost[postId].count -= 1;
        }
      });
  }
});

export const { clearComments, clearAllComments, updateCommentCount, clearError } = commentsSlice.actions;

// Selectors
export const selectCommentsByPost = (state, postId) => 
  state.comments.commentsByPost[postId] || { comments: [], count: 0, loading: false, error: null };

export const selectCommentsLoading = (state, postId) => 
  state.comments.commentsByPost[postId]?.loading || false;

export const selectCommentsError = (state, postId) => 
  state.comments.commentsByPost[postId]?.error || null;

export const selectCommentCount = (state, postId) => 
  state.comments.commentsByPost[postId]?.count || 0;

export default commentsSlice.reducer;

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
