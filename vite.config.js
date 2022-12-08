import { defineConfig, splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import path, { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
// 手动引入样式文件
import ElementPlus from 'unplugin-element-plus/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ElementPlus(),
    splitVendorChunkPlugin(),
    viteStaticCopy({
      targets: [
        { 
          src: path.resolve(__dirname, 'lib'),
          dest: path.resolve(__dirname, 'dist')
        }
      ]
    })
  ],
  server: {
    port: 8083
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "lib": path.resolve(__dirname, 'lib')
    }
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: '@use "lib/styles/element-var.scss" as *;'
      }
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/components/main.js'),
      name: 'seresLib',
      fileName: 'seres-lib'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
