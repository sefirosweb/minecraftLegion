import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:4001',
      '/minecraft-assets': 'http://localhost:4001',
      '/viewer': 'http://localhost:4001',
      '/socket.io': {
        target: 'http://localhost:4001',
        ws: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
})
