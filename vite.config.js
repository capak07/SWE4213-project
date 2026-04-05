import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    proxy: {
      '/api/auth': {
        target: process.env.USER_SERVICE_URL || 'http://user-service:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/auth')
      },
      '/api/users': {
        target: process.env.USER_SERVICE_URL || 'http://user-service:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/users/, '/users')
      },
      '/api/userBooks': {
        target: process.env.USER_SERVICE_URL || 'http://user-service:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/userBooks/, '/userBooks')
      },
      '/api/progress': {
        target: process.env.USER_SERVICE_URL || 'http://user-service:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/progress/, '/progress')
      },
      '/api/books': {
        target: process.env.BOOK_SERVICE_URL || 'http://book-service:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/books/, '/books')
      },
      '/api/reviews': {
        target: process.env.REVIEW_SERVICE_URL || 'http://review-service:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/reviews/, '/reviews')
      },
      '/api/rec': {
        target: process.env.REC_SERVICE_URL || 'http://rec-service:3004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rec/, '/rec')
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    allowedHosts: true
  }
})