import { memo, useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { VariableSizeList as List } from 'react-window';
import { Box } from '@mui/material';


const VirtualizedComments = memo(({ 
  comments, 
  renderComment, 
  estimatedItemSize = 150,
  maxHeight = 600,
  overscanCount = 3,
  scrollPositionKey = 'comments-scroll-position',
  maxDepth = 10 
}) => {
  const listRef = useRef(null);
  const itemHeightsRef = useRef({});
  const rowRefsRef = useRef({});
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  const flattenedComments = useMemo(() => {
    const flattened = [];
    
    const flatten = (commentsList, depth = 0, parentId = null) => {
      if (depth > maxDepth) return;
      
      commentsList.forEach(comment => {
        const flatComment = { 
          ...comment, 
          depth,
          parentId,
          hasReplies: comment.replies && comment.replies.length > 0
        };
        flattened.push(flatComment);
        
        if (expandedComments.has(comment._id) && comment.replies && comment.replies.length > 0) {
          flatten(comment.replies, depth + 1, comment._id);
        }
      });
    };
    
    flatten(comments);
    return flattened;
  }, [comments, expandedComments, maxDepth]);

  const getItemSize = useCallback((index) => {
    const cachedHeight = itemHeightsRef.current[index];
    if (cachedHeight) {
      return cachedHeight;
    }
    
    const comment = flattenedComments[index];
    if (comment) {
      const depthAdjustment = Math.min(comment.depth * 10, 50);
      return estimatedItemSize + depthAdjustment;
    }
    
    return estimatedItemSize;
  }, [estimatedItemSize, flattenedComments]);

  const setItemSize = useCallback((index, size) => {
    const currentSize = itemHeightsRef.current[index];
    if (!currentSize || Math.abs(currentSize - size) > 5) {
      itemHeightsRef.current[index] = size;
      if (listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
    }
  }, []);

  const toggleExpand = useCallback((commentId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
    
    const toggledIndex = flattenedComments.findIndex(c => c._id === commentId);
    
    if (listRef.current && toggledIndex !== -1) {
      Object.keys(itemHeightsRef.current).forEach(key => {
        const idx = parseInt(key, 10);
        if (idx >= toggledIndex) {
          delete itemHeightsRef.current[key];
        }
      });
      listRef.current.resetAfterIndex(toggledIndex);
    }
  }, [flattenedComments]);

  useEffect(() => {
    if (!isInitialized && listRef.current && flattenedComments.length > 0) {
      const savedPosition = sessionStorage.getItem(scrollPositionKey);
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        listRef.current.scrollTo(position);
      }
      setIsInitialized(true);
    }
  }, [isInitialized, flattenedComments.length, scrollPositionKey]);

  const handleScroll = useCallback(({ scrollOffset }) => {
    sessionStorage.setItem(scrollPositionKey, scrollOffset.toString());
  }, [scrollPositionKey]);

  const Row = useCallback(({ index, style }) => {
    const comment = flattenedComments[index];
    
    if (!comment) {
      return null;
    }

    const isExpanded = expandedComments.has(comment._id);
    const hasReplies = comment.hasReplies;

    const measureRef = useCallback((node) => {
      if (node) {
        rowRefsRef.current[index] = node;
        
        const height = node.getBoundingClientRect().height;
        setItemSize(index, height);
        
        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const newHeight = entry.contentRect.height;
            setItemSize(index, newHeight);
          }
        });
        
        resizeObserver.observe(node);
        
        node._cleanup = () => {
          resizeObserver.disconnect();
          delete rowRefsRef.current[index];
        };
      } else if (rowRefsRef.current[index]?._cleanup) {
        rowRefsRef.current[index]._cleanup();
      }
    }, [index]);

    const indentation = Math.min(comment.depth * 3, 30);

    return (
      <div style={style}>
        <div ref={measureRef}>
          <Box sx={{ pl: indentation }}>
            {renderComment(comment, {
              isExpanded,
              hasReplies,
              onToggleExpand: () => toggleExpand(comment._id),
              depth: comment.depth,
              parentId: comment.parentId
            })}
          </Box>
        </div>
      </div>
    );
  }, [flattenedComments, expandedComments, renderComment, setItemSize, toggleExpand]);

  useEffect(() => {
    return () => {
      itemHeightsRef.current = {};
      rowRefsRef.current = {};
    };
  }, []);

  if (!comments || flattenedComments.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', height: maxHeight, overflow: 'hidden' }}>
      <List
        ref={listRef}
        height={maxHeight}
        itemCount={flattenedComments.length}
        itemSize={getItemSize}
        width="100%"
        overscanCount={overscanCount}
        onScroll={handleScroll}
        itemKey={(index) => {
          const comment = flattenedComments[index];
          return comment ? comment._id : `comment-${index}`;
        }}
      >
        {Row}
      </List>
    </Box>
  );
});

VirtualizedComments.displayName = 'VirtualizedComments';

export default VirtualizedComments;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
