import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
  Button
} from '@mui/material';
import { FiMessageCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { 
  fetchComments, 
  createComment, 
  deleteComment,
  clearError,
  selectCommentsByPost,
  selectCommentsLoading,
  selectCommentsError,
  selectCommentCount
} from '../system/redux/slices/comments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

const CommentSection = ({ postId, postAuthorId, onCommentCountUpdate }) => {
  const dispatch = useDispatch();
  const { comments, count, loading, error } = useSelector(state => selectCommentsByPost(state, postId));
  const [showComments, setShowComments] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const loadComments = () => {
    dispatch(fetchComments(postId));
  };
  const handleCreateComment = async (text) => {
    try {
      console.log('Creating comment with:', { text, postId });
      const result = await dispatch(createComment({ text, postId })).unwrap();
      setShowCommentForm(false);
            if (onCommentCountUpdate) {
        onCommentCountUpdate(count + 1);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Ошибка создания комментария:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Не удалось создать комментарий' 
      };
    }
  };
  const handleDeleteComment = async (commentId) => {
    try {
      await dispatch(deleteComment({ commentId, postId })).unwrap();
      if (onCommentCountUpdate) {
        onCommentCountUpdate(count - 1);
      }
    } catch (err) {
      console.error('Ошибка удаления комментария:', err);
    }
  };
  const handleAddReply = async (parentCommentId, text) => {
    try {
      const { comment } = await dispatch(createComment({ text, postId, parentCommentId })).unwrap();
      if (onCommentCountUpdate) {
        onCommentCountUpdate(count + 1);
      }
      return { success: true, comment };
    } catch (err) {
      console.error('Ошибка добавления ответа:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Не удалось добавить ответ' 
      };
    }
  };

  useEffect(() => {
    if (postId && showComments) {
      loadComments();
    }
  }, [postId, showComments, dispatch]);

  if (!postId) return null;

  return (
    <Box sx={{ mt: 2 }}>   
      <Collapse in={showComments}>

          <Box sx={{ mb: 2 }}>
            <CommentForm
              onSubmit={handleCreateComment}
              onCancel={() => setShowCommentForm(false)}
              placeholder="И что ты думаешь об этом посте?"
            />
          </Box>
       

  
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && comments && comments.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postAuthorId={postAuthorId}
                onDelete={handleDeleteComment}
                onAddReply={handleAddReply}
              />
            ))}
          </Box>
        )}

        {!loading && (!comments || comments.length === 0) && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 3,
            color: 'rgba(209, 209, 209, 0.6)'
          }}>
            <FiMessageCircle size={32} style={{ marginBottom: 8 }} />
            <Typography variant="body2">
              Эхх пост не имеет комментариев. Он бедный
            </Typography>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

export default CommentSection;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
