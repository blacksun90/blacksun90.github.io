import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// D 메인 + C 표준 + E-4 성운.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        c: resolve(__dirname, 'c/index.html'),
        'e-4': resolve(__dirname, 'e-4/index.html'),
      },
    },
  },
})
