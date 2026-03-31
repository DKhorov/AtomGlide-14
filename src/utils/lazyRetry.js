/**
 * Utility for retrying failed lazy-loaded chunk imports
 * Handles network errors and deployment updates gracefully
 */

/**
 * Retry a dynamic import with exponential backoff
 * @param {Function} importFn - The dynamic import function
 * @param {number} retries - Number of retry attempts (default: 3)
 * @param {number} interval - Initial retry interval in ms (default: 1000)
 * @returns {Promise} - Resolves with the imported module
 */
export const lazyRetry = (importFn, retries = 3, interval = 1000) => {
  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((error) => {
        // If we've exhausted retries, reject
        if (retries === 0) {
          console.error('Failed to load chunk after retries:', error);
          reject(error);
          return;
        }

        console.warn(`Chunk load failed, retrying... (${retries} attempts left)`);

        // Retry after interval with exponential backoff
        setTimeout(() => {
          lazyRetry(importFn, retries - 1, interval * 2)
            .then(resolve)
            .catch(reject);
        }, interval);
      });
  });
};

/**
 * Create a lazy component with retry logic
 * @param {Function} importFn - The dynamic import function
 * @param {number} retries - Number of retry attempts
 * @returns {React.LazyExoticComponent} - Lazy component with retry
 */
export const lazyWithRetry = (importFn, retries = 3) => {
  return lazyRetry(importFn, retries);
};

export default lazyRetry;


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
