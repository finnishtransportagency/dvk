/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import eslintPlugin from 'vite-plugin-eslint';
export default defineConfig({
  build: {
    outDir: process.env.BUILD_PATH ? process.env.BUILD_PATH : 'build/esikatselu',
  },
  base: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '/esikatselu',
  server: {
    open: true,
    port: 3000,
  },
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgr(),
    VitePWA({
      /* Cache all imports */
      workbox: {
        globPatterns: ['**/*'],
        maximumFileSizeToCacheInBytes: 3000000,
      },
      registerType: 'autoUpdate',
      filename: 'service-worker.js',
      manifestFilename: 'manifest.json',
      manifest: {
        id: '/esikatselu',
        name: 'Digitaalisen väyläkortin esikatselu',
        short_name: 'DVK esikatselu',
        display: 'fullscreen',
        theme_color: '#0064af',
        background_color: '#ffffff',
        start_url: '.',
        icons: [
          {
            src: 'assets/icon/vayla_v_rgb_144x144.png',
            type: 'image/png',
            sizes: '144x144',
            purpose: 'any',
          },
          {
            src: 'assets/icon/vayla_v_rgb_192x192.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'any',
          },
          {
            src: 'assets/icon/vayla_v_rgb_512x512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'any',
          },
        ],
      },
      useCredentials: true,
    }),
    eslintPlugin({
      cache: false,
      include: ['./src/**/*.ts', './src/**/*.tsx'],
      exclude: [],
    }),
  ],
  test: {
    globals: true,
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
  define: {
    VITE_APP_CONFIG: JSON.stringify('PREVIEW'),
  },
});
