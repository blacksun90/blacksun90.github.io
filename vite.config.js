import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// D 메인 + C 표준 + E-4 성운. 다른 시안 소스는 보존하고 배포 입력에서만 제외한다.
export default defineConfig({
  base: '/',
  define: { 'import.meta.env.PORTFOLIO_MAIN_PATH': JSON.stringify('/') },
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
