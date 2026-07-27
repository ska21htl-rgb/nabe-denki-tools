import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Apps Script用ビルド設定：JS/CSSをすべて1つのHTMLに埋め込む
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "dist-gas",
  },
});
