
export const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

let webpSupported = null;
export const isWebPSupported = () => {
  if (webpSupported === null) {
    webpSupported = supportsWebP();
  }
  return webpSupported;
};

/**
 * Convert image URL to WebP with fallback
 * @param {string} url - Original image URL
 * @returns {string} - WebP URL or original if not supported
 */
export const getOptimizedImageUrl = (url) => {
  if (!url) return url;
  
  if (isWebPSupported() && !url.endsWith('.webp')) {
    const webpUrl = url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return webpUrl;
  }
  
  return url;
};

/**
 * Generate responsive image srcset
 * @param {string} baseUrl - Base image URL
 * @param {Array<number>} sizes - Array of widths [320, 640, 1024, 1920]
 * @returns {string} - srcset string
 */
export const generateSrcSet = (baseUrl, sizes = [320, 640, 1024, 1920]) => {
  if (!baseUrl) return '';
  
  const extension = baseUrl.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '';
  const baseWithoutExt = baseUrl.replace(extension, '');
  
  return sizes
    .map(width => {
      const url = `${baseWithoutExt}-${width}w${extension}`;
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Generate sizes attribute for responsive images
 * @param {Object} breakpoints - Breakpoints object
 * @returns {string} - sizes string
 */
export const generateSizes = (breakpoints = {}) => {
  const defaultBreakpoints = {
    mobile: '(max-width: 768px) 100vw',
    tablet: '(max-width: 1024px) 50vw',
    desktop: '33vw',
  };
  
  const merged = { ...defaultBreakpoints, ...breakpoints };
  return Object.values(merged).join(', ');
};

/**
 * Preload critical images
 * @param {Array<string>} urls - Array of image URLs to preload
 */
export const preloadCriticalImages = (urls) => {
  if (typeof window === 'undefined' || !Array.isArray(urls)) return;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = getOptimizedImageUrl(url);
    link.fetchPriority = 'high';
    
    // Add type for WebP
    if (url.endsWith('.webp') || isWebPSupported()) {
      link.type = 'image/webp';
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Generate blur-up placeholder (base64 thumbnail)
 * @param {number} width - Placeholder width
 * @param {number} height - Placeholder height
 * @param {string} color - Background color
 * @returns {string} - Base64 data URL
 */
export const generateBlurPlaceholder = (width = 10, height = 10, color = '#f0f0f0') => {
  if (typeof window === 'undefined') return '';
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

/**
 * Lazy load images with Intersection Observer
 * @param {HTMLElement} element - Image element or container
 * @param {Object} options - IntersectionObserver options
 */
export const lazyLoadImages = (element, options = {}) => {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    // Fallback: load immediately
    loadImage(element);
    return;
  }
  
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { ...defaultOptions, ...options });
  
  if (element.tagName === 'IMG') {
    observer.observe(element);
  } else {
    // Observe all images in container
    const images = element.querySelectorAll('img[data-src]');
    images.forEach(img => observer.observe(img));
  }
};

/**
 * Load image from data-src attribute
 * @param {HTMLImageElement} img - Image element
 */
const loadImage = (img) => {
  if (!img || img.tagName !== 'IMG') return;
  
  const src = img.dataset.src;
  const srcset = img.dataset.srcset;
  
  if (src) {
    img.src = getOptimizedImageUrl(src);
    img.removeAttribute('data-src');
  }
  
  if (srcset) {
    img.srcset = srcset;
    img.removeAttribute('data-srcset');
  }
  
  // Add loaded class for fade-in effect
  img.classList.add('loaded');
};

/**
 * Calculate optimal image dimensions based on viewport
 * @param {number} containerWidth - Container width
 * @param {number} devicePixelRatio - Device pixel ratio
 * @returns {number} - Optimal image width
 */
export const calculateOptimalWidth = (containerWidth, devicePixelRatio = window.devicePixelRatio || 1) => {
  // Round up to nearest standard size
  const standardSizes = [320, 640, 768, 1024, 1366, 1920, 2560];
  const targetWidth = containerWidth * devicePixelRatio;
  
  return standardSizes.find(size => size >= targetWidth) || standardSizes[standardSizes.length - 1];
};

/**
 * Image error handler with fallback
 * @param {HTMLImageElement} img - Image element
 * @param {string} fallbackUrl - Fallback image URL
 */
export const handleImageError = (img, fallbackUrl = null) => {
  if (!img) return;
  
  // Prevent infinite loop
  if (img.dataset.errorHandled) return;
  img.dataset.errorHandled = 'true';
  
  if (fallbackUrl) {
    img.src = fallbackUrl;
  } else {
    // Create placeholder
    img.style.display = 'none';
    
    const placeholder = document.createElement('div');
    placeholder.className = 'image-error-placeholder';
    placeholder.style.cssText = `
      width: 100%;
      height: 200px;
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 14px;
      border-radius: 8px;
    `;
    placeholder.textContent = '📷 Изображение недоступно';
    
    img.parentNode?.insertBefore(placeholder, img);
  }
};

/**
 * Prefetch images during idle time
 * @param {Array<string>} urls - Array of image URLs
 */
export const prefetchImages = (urls) => {
  if (typeof window === 'undefined' || !Array.isArray(urls)) return;
  
  const prefetch = () => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'image';
      link.href = getOptimizedImageUrl(url);
      document.head.appendChild(link);
    });
  };
  
  // Use requestIdleCallback if available
  if (window.requestIdleCallback) {
    window.requestIdleCallback(prefetch, { timeout: 2000 });
  } else {
    setTimeout(prefetch, 1000);
  }
};

/**
 * Initialize image optimization for all images on page
 */
export const initImageOptimization = () => {
  if (typeof window === 'undefined') return;
  
  // Lazy load all images with data-src
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => lazyLoadImages(img));
  
  // Add error handlers to all images
  const allImages = document.querySelectorAll('img');
  allImages.forEach(img => {
    img.addEventListener('error', () => handleImageError(img));
  });
  
  // Log WebP support
  if (process.env.NODE_ENV === 'development') {
    console.log('🖼️ Image optimization initialized');
    console.log('WebP supported:', isWebPSupported() ? '✅' : '❌');
  }
};

export default {
  isWebPSupported,
  getOptimizedImageUrl,
  generateSrcSet,
  generateSizes,
  preloadCriticalImages,
  generateBlurPlaceholder,
  lazyLoadImages,
  calculateOptimalWidth,
  handleImageError,
  prefetchImages,
  initImageOptimization,
};


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
