import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@img': path.resolve(__dirname, 'public/img'),
      '@toolkit': path.resolve(__dirname, 'redux_tollkit'),
      '@reduxApi': path.resolve(__dirname, 'redux_tollkit/api'),
      '@reduxSlice': path.resolve(__dirname, 'redux_tollkit/slices'),
      '@svgShared': path.resolve(__dirname, 'src/shared/assets/svg'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@funcCp': path.resolve(__dirname, 'src/funcCp'),
      '@api': path.resolve(__dirname, 'src/api')
    },
  },
})
