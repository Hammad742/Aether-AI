import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Dynamically set base path: use root '/' for Vercel, and '/Aether-AI/' for GitHub Pages
  base: process.env.VERCEL ? '/' : '/Aether-AI/',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          markdown: ['react-markdown', 'remark-gfm'],
          icons: ['react-icons']
        }
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger']
  },
  server: {
    proxy: {
      '/pollinations': {
        target: 'https://image.pollinations.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pollinations/, ''),
        secure: false, // In case of SSL issues
      },
      '/pollinations-p': {
        target: 'https://pollinations.ai/p',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pollinations-p/, ''),
        secure: false,
      },
      '/hf': {
        target: 'https://router.huggingface.co/hf-inference',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hf/, ''),
        secure: false,
      },
      '/ddg': {
        target: 'https://html.duckduckgo.com/html/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ddg/, ''),
        secure: false,
      },
    },
  },
})
