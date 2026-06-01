import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/javascript/setup.js'],
    include: ['test/javascript/**/*_{test,spec}.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['app/javascript/**/*.js'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app/javascript'),
    },
  },
})
