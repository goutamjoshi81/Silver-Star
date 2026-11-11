import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
export default defineConfig({
    base: './',
    plugins: [react(), tailwindcss()],
    server: {
        port: 5177,
        host: '0.0.0.0',
    },
    resolve: {
        alias: {
            '@mock': resolve(__dirname, '../../packages/mock-data'),
        },
    },
    build: {
        target: 'es2020',
        sourcemap: false,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
                        return 'vendor-react';
                    }
                    if (id.includes('node_modules/lucide-react/')) {
                        return 'vendor-icons';
                    }
                },
            },
        },
    },
});
