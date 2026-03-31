const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = {
  jest: {
    configure: {
      transformIgnorePatterns: [
        'node_modules/(?!fast-check)',
      ],
    },
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Remove existing Workbox plugin from react-scripts
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => !(plugin.constructor.name === 'GenerateSW' || plugin.constructor.name === 'InjectManifest')
      );

      // Exclude service-worker.js from webpack processing in development
      if (env === 'development') {
        webpackConfig.module.rules.push({
          test: /service-worker\.js$/,
          use: 'null-loader',
        });
      }
      // Configure AVIF image support
      const imageRule = webpackConfig.module.rules.find(rule => {
        return rule.oneOf;
      });

      if (imageRule && imageRule.oneOf) {
        // Find the file loader rule for images
        const imageLoaderRule = imageRule.oneOf.find(rule => {
          return rule.test && rule.test.toString().includes('avif|webp|png|jpe?g|gif|svg');
        });

        if (imageLoaderRule) {
          // Ensure AVIF is included in the test pattern
          imageLoaderRule.test = /\.(avif|webp|png|jpe?g|gif|svg)$/i;
        } else {
          // Add AVIF support to the general asset rule
          const assetRule = imageRule.oneOf.find(rule => {
            return rule.type === 'asset/resource';
          });
          
          if (assetRule && assetRule.test) {
            assetRule.test = /\.(avif|webp|png|jpe?g|gif|svg|bmp|ico)$/i;
          }
        }
      }

      // Only apply optimizations in production
      if (env === 'production') {
        // Configure code splitting with optimized cache groups
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              // Vendor chunk for node_modules
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                priority: 10,
                reuseExistingChunk: true,
              },
              // Separate chunk for Material-UI
              mui: {
                test: /[\\/]node_modules[\\/]@mui[\\/]/,
                name: 'mui',
                priority: 20,
                reuseExistingChunk: true,
              },
              // Common chunk for shared code
              common: {
                minChunks: 2,
                priority: 5,
                reuseExistingChunk: true,
                name: 'common',
              },
            },
          },
        };

        // Add compression plugin for gzip
        webpackConfig.plugins.push(
          new CompressionPlugin({
            filename: '[path][base].gz',
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240, // Only compress files larger than 10KB
            minRatio: 0.8,
          })
        );

        // Add Workbox Service Worker
        webpackConfig.plugins.push(
          new InjectManifest({
            swSrc: './src/service-worker.js',
            swDest: 'service-worker.js',
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
            exclude: [
              /\.map$/,
              /^manifest.*\.js$/,
              /\.gz$/,
              /asset-manifest\.json$/,
              /LICENSE/,
            ],
          })
        );
      }

      // Add bundle analyzer plugin when ANALYZE env variable is set
      if (process.env.ANALYZE === 'true') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-report.html',
            openAnalyzer: true,
          })
        );
      }

      return webpackConfig;
    },
  },
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
