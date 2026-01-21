
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Import process from node:process to resolve TypeScript errors for Node-specific properties like cwd()
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Use process.cwd() from the imported process module to ensure correct typing in the Vite config context
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    server: {
      port: 5173,
      host: true
    }
  };
});
