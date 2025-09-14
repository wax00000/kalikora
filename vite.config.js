import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'web',
  plugins: [react()],
  server: {
    proxy: {
      '/v1': 'http://localhost:3000'
    }
  }
});
