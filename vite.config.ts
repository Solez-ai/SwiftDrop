import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // Base public path when served in development or production
    base: './',
    
    // Development server configuration
    server: {
      port: 3000,
      strictPort: true,
      host: true, // Listen on all network interfaces
      open: true, // Open browser on server start
      cors: true,
      // Enable HTTPS in development
      // https: {
      //   key: fs.readFileSync('path/to/key.pem'),
      //   cert: fs.readFileSync('path/to/cert.pem'),
      // },
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'esbuild' : false,
      cssMinify: mode === 'production',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          },
        },
      },
    },
    
    // Resolve configuration
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '~': resolve(__dirname, './node_modules'),
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    
    // Environment variables
    define: {
      'process.env': env,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    
    // Plugins
    plugins: [
      react({
        // Use React Refresh
        fastRefresh: true,
        // Enable the new JSX transform
        jsxImportSource: '@emotion/react',
        // Babel configuration
        babel: {
          plugins: [
            ['@emotion/babel-plugin', { sourceMap: mode !== 'production' }],
            // Other Babel plugins...
          ],
        },
      }),
      
      // Enable TypeScript path resolution from tsconfig paths
      tsconfigPaths(),
      
      // PWA support
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'SwiftDrop',
          short_name: 'SwiftDrop',
          description: 'Fast, secure file sharing using WiFi Direct',
          theme_color: '#1976d2',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        workbox: {
          // Workbox options
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    
    // CSS configuration
    css: {
      devSourcemap: true,
      modules: {
        generateScopedName: mode === 'production' 
          ? '[hash:base64:8]' 
          : '[name]__[local]--[hash:base64:5]',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/styles/variables.scss";
            @import "@/styles/mixins.scss";
          `,
        },
      },
    },
    
    // Optimize dependencies for faster development
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
      ],
      exclude: ['@capacitor-community/wifi-p2p'],
    },
    
    // Enable source maps in development
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});
