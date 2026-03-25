import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://user-service:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/auth')
      },
      '/api/users': {
        target: 'http://user-service:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/users/, '/users')
      },
      '/api/userBooks': {
        target: 'http://user-service:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/userBooks/, '/userBooks')
      },
      '/api/progress': {
        target: 'http://user-service:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/progress/, '/progress')
      },
      '/api/books': {
        target: 'http://book-service:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/books/, '/books')
      },
      '/api/reviews': {
        target: 'http://review-service:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/reviews/, '/reviews')
      },
      '/api/rec': {
        target: 'http://rec-service:3004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rec/, '/rec')
      }
    }
  }
})