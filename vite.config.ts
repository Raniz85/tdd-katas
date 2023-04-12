import { defineConfig } from 'vite';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
  base: "",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ceoBowling: resolve(__dirname, 'ceo-bowling/index.html'),
        testFlight: resolve(__dirname, 'test-flight/index.html'),
      },
    },
  },
});
