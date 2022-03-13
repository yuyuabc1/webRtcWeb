import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const fs = require('fs')
const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    open: true,
    host:"0.0.0.0",
    port: 8080,
    // https: {
    //   // 主要是下面两行的配置文件，不要忘记引入 fs 和 path 两个对象
    //   cert: fs.readFileSync(path.join('/Users/zhuchenliang/.cert/create-ca+3.pem')),
    //   key: fs.readFileSync(path.join('/Users/zhuchenliang/.cert/create-ca+3-key.pem'))
    // }
  }
})
