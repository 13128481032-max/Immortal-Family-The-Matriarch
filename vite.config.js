import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署配置
  // 如果部署到 https://<USERNAME>.github.io/<REPO>/
  // 则设置 base: '/<REPO>/'
  // 如果部署到 https://<USERNAME>.github.io/
  // 则设置 base: '/'
  base: './',  // 使用相对路径，适配各种部署环境
  
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