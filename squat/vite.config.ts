/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy'
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
    svgrPlugin(),
    legacy(),
    VitePWA({ registerType: 'autoUpdate' }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    reporters: ['basic', 'junit', 'vitest-sonar-reporter'],
    outputFile: {
      junit: './junit.xml',
      'vitest-sonar-reporter': './coverage/sonar-report.xml',
    },
    coverage: {
      reporter: ['text', 'lcov', 'clover'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
      ],
    },
  },
});
