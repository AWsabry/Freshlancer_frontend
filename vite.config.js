import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Use ngrok URL if provided, otherwise fall back to localhost
  const apiBaseUrl = env.VITE_API_BASE_URL || env.VITE_NGROK_URL || "http://localhost:8080";

  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL or VITE_NGROK_URL is not defined. Please set it in your environment.');
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
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
  };
});
