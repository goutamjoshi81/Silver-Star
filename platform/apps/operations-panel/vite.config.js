import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5175,
        host: '0.0.0.0',
    },
    resolve: {
        alias: {
            '@mock': resolve(__dirname, '../../packages/mock-data'),
        },
    },
});
