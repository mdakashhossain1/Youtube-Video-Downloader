import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Express backend (server.js) exposes /info and /download on port 3000.
// During development Vite runs on 5173 and proxies those calls to the API.
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
    server: {
        port: 5173,
        strictPort: true, // fail loudly instead of silently moving to another port
        proxy: {
            '/info': 'http://localhost:3000',
            '/download': 'http://localhost:3000',
        },
    },
});
