/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import eslintPlugin from 'vite-plugin-eslint';
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: process.env.BUILD_PATH ? process.env.BUILD_PATH : 'build',
  },
  base: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '/',
  server: {
    open: true,
    port: 3000,
  },
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgr(),
    eslintPlugin({
      cache: false,
      include: ['./src/**/*.ts', './src/**/*.tsx'],
      exclude: [],
    }),
  ],
  test: {
    globals: true,
    minThreads: 0,
    maxThreads: 1,
    environment: 'jsdom',
    silent: true,
    isolate: true,
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    setupFiles: './src/setupTests.ts',
    reporters: ['basic', 'junit', 'vitest-sonar-reporter'],
    outputFile: {
      junit: './junit.xml',
      'vitest-sonar-reporter': './coverage/sonar-report.xml',
    },
    coverage: {
      include: ['src/**'],
      reporter: ['text', 'lcov', 'clover'],
      exclude: ['node_modules/', 'src/setupTests.ts'],
    },
  },
});
