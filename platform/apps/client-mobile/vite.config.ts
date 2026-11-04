import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5176,
    host: true,
  },
  resolve: {
    alias: {
      '@mock': resolve(__dirname, '../../packages/mock-data'),
    },
  },
})

