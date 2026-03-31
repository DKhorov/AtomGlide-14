/**
 * Performance Monitor Component
 * Development-only component to display real-time performance metrics
 */

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
  });
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    // Update metrics every second
    const interval = setInterval(() => {
      if (window.__PERFORMANCE_METRICS__) {
        setMetrics({ ...window.__PERFORMANCE_METRICS__ });
      }

      // Get memory info if available
      if (performance.memory) {
        setMemoryInfo({
          used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
          total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
          limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getStatusColor = (metric, value) => {
    if (!value) return 'default';
    
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'default';

    if (value <= threshold.good) return 'success';
    if (value <= threshold.poor) return 'warning';
    return 'error';
  };

  const formatValue = (metric, value) => {
    if (!value) return 'N/A';
    if (metric === 'cls') return value.toFixed(3);
    return `${value.toFixed(0)}ms`;
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 300,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontSize: '0.9rem', fontWeight: 600 }}>
          📊 Performance Monitor
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* LCP */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              LCP:
            </Typography>
            <Chip
              label={formatValue('lcp', metrics.lcp)}
              size="small"
              color={getStatusColor('lcp', metrics.lcp)}
              sx={{ minWidth: 80 }}
            />
          </Box>

          {/* FID */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              FID:
            </Typography>
            <Chip
              label={formatValue('fid', metrics.fid)}
              size="small"
              color={getStatusColor('fid', metrics.fid)}
              sx={{ minWidth: 80 }}
            />
          </Box>

          {/* CLS */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              CLS:
            </Typography>
            <Chip
              label={formatValue('cls', metrics.cls)}
              size="small"
              color={getStatusColor('cls', metrics.cls)}
              sx={{ minWidth: 80 }}
            />
          </Box>

          {/* FCP */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              FCP:
            </Typography>
            <Chip
              label={formatValue('fcp', metrics.fcp)}
              size="small"
              color={getStatusColor('fcp', metrics.fcp)}
              sx={{ minWidth: 80 }}
            />
          </Box>

          {/* TTFB */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              TTFB:
            </Typography>
            <Chip
              label={formatValue('ttfb', metrics.ttfb)}
              size="small"
              color={getStatusColor('ttfb', metrics.ttfb)}
              sx={{ minWidth: 80 }}
            />
          </Box>

          {/* Memory (if available) */}
          {memoryInfo && (
            <>
              <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 1, pt: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.7rem', opacity: 0.7, mb: 0.5 }}>
                  Memory Usage:
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {memoryInfo.used}MB / {memoryInfo.total}MB
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.7rem', opacity: 0.5 }}>
                  Limit: {memoryInfo.limit}MB
                </Typography>
              </Box>
            </>
          )}
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 2,
            fontSize: '0.65rem',
            opacity: 0.5,
            textAlign: 'center',
          }}
        >
          Development Only
        </Typography>
      </Paper>
    </Box>
  );
};

export default PerformanceMonitor;
