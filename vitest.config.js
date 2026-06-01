import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/javascript/setup.js'],
    include: ['test/javascript/**/*_{test,spec}.js', 'test/javascript/**/*.{test,spec}.js'],
  },
})
