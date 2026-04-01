import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({ open: true }),
    cssInjectedByJsPlugin(),
    viteCompression({ algorithm: "brotliCompress" }),
    tsconfigPaths(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0", // или просто true
    port: 5173, // можно указать свой порт
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
  build: {
    rollupOptions: {
      output: {
        // Разделяем node_modules на отдельный файл
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "axios", "zustand"], // Явно указываем, что собрать заранее
  },
  test: {
    globals: true, // Позволяет не импортировать 'describe', 'it', 'expect' в каждом файле
    environment: "jsdom", // Эмуляция браузера
    setupFiles: "./src/shared/config/tests/setupTests.ts", // Файл для инициализации (создадим далее)
  },
});
