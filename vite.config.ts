import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['cinema-paradiso'] }),
    svgr({
      svgrOptions: {
        icon: true,
      },
      include: '**/*.svg',
    })
  ],
  resolve: {
    alias: [{ find: '@', replacement: resolve(__dirname, 'src') }],
  },
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'cinema-paradiso/main.ts'),
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
    }
  },
  server: {
    open: true
  }
})
