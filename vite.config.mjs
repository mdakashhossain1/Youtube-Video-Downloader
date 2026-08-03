import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The Express backend (server.js) exposes the API on port 3000.
// During development Vite runs on 5173; the frontend calls the API directly
// (see `API` in Downloader.jsx), so no proxy is needed for file transfers.
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
    server: {
        port: 5173,
        strictPort: true, // fail loudly instead of silently moving to another port
    },
});
