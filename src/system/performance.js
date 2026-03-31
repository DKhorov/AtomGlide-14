
export const preloadCriticalResources = () => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = '/image/1.webp';
  link.type = 'image/webp';
  link.fetchPriority = 'high';
  document.head.appendChild(link);

  const testImgLink = document.createElement('link');
  testImgLink.rel = 'preload';
  testImgLink.as = 'image';
  testImgLink.href = '/image/test.webp';
  testImgLink.type = 'image/webp';
  testImgLink.fetchPriority = 'high';
  document.head.appendChild(testImgLink);
};

export const optimizeImages = () => {
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (index < 10) {
      if (index < 3) {
        img.fetchPriority = 'high';
        img.loading = 'eager';
      } else {
        img.loading = 'eager';
        img.fetchPriority = 'auto';
      }
    } else {
      img.loading = 'lazy';
      img.decoding = 'async';
    }
    
    if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
      img.style.width = '100%';
      img.style.height = 'auto';
    }

    img.onerror = function() {
      this.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.style.cssText = `
        width: 100%;
        height: 300px;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 14px;
        border-radius: 8px;
      `;
      fallback.textContent = 'Изображение недоступно';
      this.parentNode.insertBefore(fallback, this);
    };
  });
};

export const optimizeDataLoading = () => {
  const preloadData = async () => {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 3000); 
      
      const response = await fetch('/api/posts?limit=10', {
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('posts_cache', JSON.stringify(data));
      }
    } catch (error) {
    }
  };

  if (document.readyState === 'complete') {
    preloadData();
  } else {
    window.addEventListener('load', preloadData);
  }
};

export const optimizeCriticalRendering = () => {
  const criticalElements = document.querySelectorAll('[data-critical="true"]');
  criticalElements.forEach(el => {
    el.style.contentVisibility = 'auto';
    el.style.containIntrinsicSize = '0 300px';
  });

  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      document.documentElement.classList.add('fonts-loaded');
    });
  }
};


export const setupPerformanceObserver = () => {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }

  const metrics = {
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
  };

  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 LCP:', metrics.lcp.toFixed(2), 'ms', 
          metrics.lcp < 2500 ? '✅' : '⚠️');
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
  }

  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        metrics.fid = entry.processingStart - entry.startTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 FID:', metrics.fid.toFixed(2), 'ms',
            metrics.fid < 100 ? '✅' : '⚠️');
        }
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
  }

  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          metrics.cls = clsValue;
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 CLS:', metrics.cls.toFixed(3),
          metrics.cls < 0.1 ? '✅' : '⚠️');
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
  }

  try {
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          metrics.ttfb = entry.responseStart - entry.requestStart;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 TTFB:', metrics.ttfb.toFixed(2), 'ms');
          }
        }
      });
    });
    navigationObserver.observe({ entryTypes: ['navigation'] });

    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 FCP:', metrics.fcp.toFixed(2), 'ms',
              metrics.fcp < 1800 ? '✅' : '⚠️');
          }
        }
      });
    });
    paintObserver.observe({ entryTypes: ['paint'] });
  } catch (e) {
    // Navigation timing not supported
  }

  // Store metrics globally for access
  window.__PERFORMANCE_METRICS__ = metrics;

  // Log summary after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Performance Summary:', {
          LCP: metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A',
          FID: metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A',
          CLS: metrics.cls ? metrics.cls.toFixed(3) : 'N/A',
          TTFB: metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : 'N/A',
          FCP: metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A',
        });
      }
    }, 3000);
  });
};


export const trackPerformanceMark = (name) => {
  if (window.performance && window.performance.mark) {
    performance.mark(name);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Performance Mark:', name);
    }
  }
};

export const measurePerformance = (name, startMark, endMark) => {
  if (window.performance && window.performance.measure) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${name}:`, measure.duration.toFixed(2), 'ms');
      }
      
      return measure.duration;
    } catch (e) {
      console.warn('Performance measurement failed:', e);
    }
  }
  return null;
};


export const trackComponentRender = (componentName, renderTime) => {
  const threshold = 16; // 60fps = 16ms per frame
  
  if (renderTime > threshold && process.env.NODE_ENV === 'development') {
    console.warn(
      `⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`
    );
  }
  
  if (window.performance && window.performance.mark) {
    performance.mark(`${componentName}-render-${Date.now()}`);
  }
};


export const initPerformanceOptimizations = () => {
  preloadCriticalResources();
  optimizeImages();
  optimizeDataLoading();
  optimizeCriticalRendering();
  setupPerformanceObserver();
  
  if (typeof window !== 'undefined') {
    import('./imageOptimization').then(({ initImageOptimization }) => {
      initImageOptimization();
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Performance optimizations initialized');
  }
};

export default initPerformanceOptimizations; 
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
