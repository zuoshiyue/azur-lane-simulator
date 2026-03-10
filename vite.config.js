import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/azur-lane-simulator/',
    server: {
        host: '127.0.0.1',
        port: 5173
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'esnext',
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: {
                    // React 核心库单独打包
                    'react-vendor': ['react', 'react-dom'],
                    // lucide-react 图标库单独打包
                    'icons-vendor': ['lucide-react'],
                    // dnd-kit 拖拽库单独打包
                    'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
                }
            }
        }
    }
});
