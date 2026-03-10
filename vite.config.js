import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        visualizer({ open: false, filename: 'dist/stats.html', gzipSize: true })
    ],
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
