import { memo, useRef, useCallback, useEffect, useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import { Box } from '@mui/material';


const VirtualizedFeed = memo(({ 
  items, 
  renderItem, 
  estimatedItemSize = 400,
  overscanCount = 3,
  height = '100vh',
  width = '100%',
  onLoadMore,
  hasMore = false,
  scrollPositionKey = 'feed-scroll-position'
}) => {
  const listRef = useRef(null);
  const itemHeightsRef = useRef({});
  const [isInitialized, setIsInitialized] = useState(false);

  const getItemSize = useCallback((index) => {
    return itemHeightsRef.current[index] || estimatedItemSize;
  }, [estimatedItemSize]);

  const setItemSize = useCallback((index, size) => {
    if (itemHeightsRef.current[index] !== size) {
      itemHeightsRef.current[index] = size;
      if (listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
    }
  }, []);

  useEffect(() => {
    if (!isInitialized && listRef.current && items.length > 0) {
      const savedPosition = sessionStorage.getItem(scrollPositionKey);
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        listRef.current.scrollTo(position);
      }
      setIsInitialized(true);
    }
  }, [isInitialized, items.length, scrollPositionKey]);

  const handleScroll = useCallback(({ scrollOffset }) => {
    sessionStorage.setItem(scrollPositionKey, scrollOffset.toString());
  }, [scrollPositionKey]);

  const handleItemsRendered = useCallback(({ visibleStopIndex }) => {
    if (hasMore && onLoadMore && visibleStopIndex >= items.length - 5) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore, items.length]);

  const Row = useCallback(({ index, style }) => {
    const item = items[index];
    const rowRef = useRef(null);

    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.getBoundingClientRect().height;
        setItemSize(index, height);
      }
    }, [index]);

    return (
      <div style={style}>
        <div ref={rowRef}>
          {renderItem(item, index)}
        </div>
      </div>
    );
  }, [items, renderItem, setItemSize]);

  if (items.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width, height }}>
      <List
        ref={listRef}
        height={typeof height === 'string' ? window.innerHeight : height}
        itemCount={items.length}
        itemSize={getItemSize}
        width={typeof width === 'string' ? '100%' : width}
        overscanCount={overscanCount}
        onScroll={handleScroll}
        onItemsRendered={handleItemsRendered}
        itemKey={(index) => items[index]._id || items[index].id || index}
      >
        {Row}
      </List>
    </Box>
  );
});

VirtualizedFeed.displayName = 'VirtualizedFeed';

export default VirtualizedFeed;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
