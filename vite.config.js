import { defineConfig } from "vite";
import path, { resolve } from "path";
import pugPlugin from "vite-plugin-pug";

const options = { pretty: true };
const locals = { name: "My Pug" };

export default defineConfig({
  root: "src", // Thư mục gốc của dự án
  base: "./", // Base URL
  plugins: [pugPlugin(options, locals)], // Tích hợp Pug
  build: {
    outDir: resolve(__dirname, "dist"), // Thư mục đầu ra
    emptyOutDir: true, // Xóa thư mục cũ trước khi build
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"), // File HTML chính
        slot: resolve(__dirname, "src/slot/index.html"), // File HTML phụ
      },
      output: {
        dir: resolve(__dirname, "dist"), // Thư mục đầu ra chính
        chunkFileNames: "assets/js/[name].[hash].chunk.js",
        entryFileNames: "assets/js/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split(".").pop();
          if (extType === "css") {
            return "assets/css/[name].[hash][extname]";
          } else if (["png", "jpg", "jpeg", "svg", "ico"].includes(extType)) {
            return "assets/images/[name].[hash][extname]";
          } else if (["js", "ts"].includes(extType)) {
            return "assets/js/[name].[hash][extname]";
          }
          return "assets/[name].[hash][extname]";
        },
      },
    },
  },
  server: {
    open: true, // Tự động mở trình duyệt
  },
  assetsInclude: [
    "**/*.pug",
    "**/*.png",
    "**/*.jpg",
    "**/*.svg",
    "**/*.scss",
    "**/*.js",
  ], // Bao gồm các tệp tài nguyên
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: ` @use "@/assets/scss/_colors.scss" as *;
          @use "@/assets/scss/_breakpoints.scss" as *;
          @use "@/assets/scss/_variables.scss" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@images": path.resolve(__dirname, "./src/assets/images"),
      "@scss": path.resolve(__dirname, "./src/assets/scss"),
      "@js": path.resolve(__dirname, "./src/assets/js"),
    },
  },
});
