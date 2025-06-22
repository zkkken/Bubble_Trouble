import { defineConfig } from 'vite';
import tailwind from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwind()],
  publicDir: '../../assets',
  build: {
    outDir: '../../webroot',
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 1500,
  },
  define: {
    // 确保在所有环境下都能正确识别开发模式
    __DEV__: true,
    'import.meta.env.DEV': true,
    'process.env.NODE_ENV': '"development"'
  },
  server: {
    port: 7474,
    host: true,
    strictPort: false,
  },
  preview: {
    port: 7474,
    host: true,
    strictPort: false,
  }
});