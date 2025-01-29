/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import eslintPlugin from 'vite-plugin-eslint';
// https://vitejs.dev/config/
export default defineConfig((env) => ({
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
    VitePWA({
      registerType: 'autoUpdate',
      filename: 'service-worker.js',
      manifestFilename: 'manifest.json',
      manifest: {
        id: '/vaylakortti/',
        name: 'Digitaalinen väyläkortti',
        short_name: 'DVK',
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
      /* Cache all imports, ignore icons in manifest */
      workbox: {
        globPatterns: ['**/*'],
        globIgnores: ['assets/icon/vayla_v_rgb_*.png', '**/node_modules/**/*'],
        maximumFileSizeToCacheInBytes: 4000000,
        cleanupOutdatedCaches: true,
      },
    }),
    env.mode !== 'test' &&
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
    reporters: ['default', 'junit', 'vitest-sonar-reporter'],
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
    VITE_APP_CONFIG: JSON.stringify('DVK'),
  },
}));
