import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist']
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'expo-router': path.resolve('./src/test/stubs/expo-router.ts')
    }
  },
  server: {
    deps: {
      inline: [
        /expo-router/,
        /expo/,
        /react-native/
      ]
    }
  }
})
