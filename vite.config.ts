import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5174,
    strictPort: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      thresholds: { statements: 95, branches: 95, functions: 95, lines: 95 },
      exclude: [
        'src/test/**',
        'src/main.tsx',
        '**/*.test.*',
        'src/screens/SplashScreen.tsx',
        'src/screens/OnboardingScreen.tsx',
      ],
    },
  },
})
