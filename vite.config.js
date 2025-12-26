import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Use ngrok URL if provided, otherwise fall back to localhost (for development only)
  const apiBaseUrl = env.VITE_API_BASE_URL || "https://backend.freshlancer.online" || "http://localhost:8080";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Server configuration (only used in development)
    server: {
      port: 3000,
      allowedHosts: [
        'localhost',
      ],
      proxy: {
        '/api': {
          target: apiBaseUrl.replace(/\/$/, ''),
          changeOrigin: true,
          secure: true, // Set to true if using HTTPS (ngrok uses HTTPS)
          ws: true, // Enable websocket proxying if needed
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
    // Build configuration for production
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false, // Disable sourcemaps in production for security and smaller bundle
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            query: ['@tanstack/react-query'],
            utils: ['axios', 'crypto-js', 'js-cookie'],
          },
        },
      },
      // Ensure index.html is in the root of dist folder
      emptyOutDir: true,
    },
  };
});
