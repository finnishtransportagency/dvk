import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build'
  },
  server: {
    open: true,
  },
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    /*
    VitePWA({
        injectRegister: null
    }),
    */
  ],
});
