import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@component': path.resolve(__dirname, 'src/components'),
      '@images': path.resolve(__dirname, 'src/assets/images'),
      '@fonts': path.resolve(__dirname, 'src/assets/fonts'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@utility': path.resolve(__dirname, 'src/utilities'),
      '@layout': path.resolve(__dirname, 'src/containers/layout'),
      '@containers': path.resolve(__dirname, 'src/containers'),
      '@routes': path.resolve(__dirname, 'src/appRoutes')
    }
  },
  plugins: [svgr(), react()],
  server: {
    host: '0.0.0.0',
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
});
