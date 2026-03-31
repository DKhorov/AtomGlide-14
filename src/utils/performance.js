/**
 * Performance Utility Hooks
 * Reusable React hooks for performance optimization
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useDebounce - Debounce a value
 * Delays updating the value until after a specified delay
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {any} - Debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // API call with debounced value
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle - Throttle a callback function
 * Limits the rate at which a function can fire
 * 
 * @param {Function} callback - The function to throttle
 * @param {number} delay - Minimum time between calls in milliseconds (default: 300ms)
 * @returns {Function} - Throttled function
 * 
 * @example
 * const handleScroll = useThrottle(() => {
 *   console.log('Scroll event');
 * }, 100);
 * 
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, [handleScroll]);
 */
export function useThrottle(callback, delay = 300) {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef(null);

  return useCallback(
    (...args) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, delay - timeSinceLastRun);
      }
    },
    [callback, delay]
  );
}

/**
 * useIntersectionObserver - Observe element visibility
 * Efficient lazy loading and infinite scroll implementation
 * 
 * @param {Object} options - IntersectionObserver options
 * @returns {Array} - [ref, isIntersecting, entry]
 * 
 * @example
 * const [ref, isVisible] = useIntersectionObserver({
 *   threshold: 0.1,
 *   rootMargin: '100px'
 * });
 * 
 * return (
 *   <div ref={ref}>
 *     {isVisible && <Image src={imageSrc} />}
 *   </div>
 * );
 */
export function useIntersectionObserver(options = {}) {
  const [entry, setEntry] = useState(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create observer
    observerRef.current = new IntersectionObserver(([entry]) => {
      setEntry(entry);
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0,
      rootMargin: '0px',
      ...options,
    });

    // Start observing
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options.threshold, options.rootMargin, options.root]);

  return [elementRef, isIntersecting, entry];
}

/**
 * useIdleCallback - Execute callback during browser idle time
 * Uses requestIdleCallback for non-critical tasks
 * 
 * @param {Function} callback - Function to execute during idle time
 * @param {Object} options - requestIdleCallback options
 * 
 * @example
 * useIdleCallback(() => {
 *   // Prefetch next page data
 *   prefetchNextPage();
 * }, { timeout: 2000 });
 */
export function useIdleCallback(callback, options = {}) {
  useEffect(() => {
    // Fallback for browsers without requestIdleCallback
    if (!window.requestIdleCallback) {
      const timeoutId = setTimeout(callback, 1);
      return () => clearTimeout(timeoutId);
    }

    const idleCallbackId = window.requestIdleCallback(callback, options);

    return () => {
      window.cancelIdleCallback(idleCallbackId);
    };
  }, [callback, options.timeout]);
}

/**
 * usePerformanceMonitor - Monitor component render performance
 * Tracks render times and logs slow renders in development
 * 
 * @param {string} componentName - Name of the component being monitored
 * @param {number} threshold - Threshold in ms for logging (default: 16ms)
 * 
 * @example
 * function MyComponent() {
 *   usePerformanceMonitor('MyComponent', 16);
 *   // ... component code
 * }
 */
export function usePerformanceMonitor(componentName, threshold = 16) {
  const renderStartTime = useRef(null);
  const renderCount = useRef(0);

  // Mark render start
  renderStartTime.current = performance.now();
  renderCount.current += 1;

  useEffect(() => {
    // Calculate render time
    const renderTime = performance.now() - renderStartTime.current;

    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && renderTime > threshold) {
      console.warn(
        `⚠️ Slow render detected in ${componentName}:`,
        `${renderTime.toFixed(2)}ms (render #${renderCount.current})`
      );
    }

    // Performance mark for profiling
    if (window.performance && window.performance.mark) {
      performance.mark(`${componentName}-render-${renderCount.current}`);
    }
  });
}

/**
 * useEventListener - Add event listener with automatic cleanup
 * Prevents memory leaks from forgotten event listeners
 * 
 * @param {string} eventName - Name of the event
 * @param {Function} handler - Event handler function
 * @param {Element} element - Target element (default: window)
 * @param {Object} options - addEventListener options
 * 
 * @example
 * useEventListener('scroll', handleScroll, window, { passive: true });
 */
export function useEventListener(
  eventName,
  handler,
  element = window,
  options = {}
) {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener, options);

    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options.passive, options.capture]);
}

/**
 * useMediaQuery - Responsive design hook
 * Efficiently track media query matches
 * 
 * @param {string} query - Media query string
 * @returns {boolean} - Whether the media query matches
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

/**
 * usePrefersReducedMotion - Detect user's motion preference
 * Respects accessibility settings
 * 
 * @returns {boolean} - Whether user prefers reduced motion
 * 
 * @example
 * const prefersReducedMotion = usePrefersReducedMotion();
 * const animationDuration = prefersReducedMotion ? 0 : 300;
 */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * useOnlineStatus - Track online/offline status
 * Useful for showing offline indicators
 * 
 * @returns {boolean} - Whether the user is online
 * 
 * @example
 * const isOnline = useOnlineStatus();
 * if (!isOnline) return <OfflineBanner />;
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * useWindowSize - Track window dimensions
 * Debounced for performance
 * 
 * @returns {Object} - { width, height }
 * 
 * @example
 * const { width, height } = useWindowSize();
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    let timeoutId = null;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150); // Debounce resize events
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
}


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
