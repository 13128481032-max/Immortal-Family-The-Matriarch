import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 解决Windows大小写不敏感问题
  server: {
    fs: {
      strict: false
    }
  },
  resolve: {
    // 解决大小写敏感问题
    alias: {
      './components/FamilyTree/index.jsx': './components/FamilyTree/index.jsx'
    }
  }
})