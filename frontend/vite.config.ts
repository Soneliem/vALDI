import vue from "@vitejs/plugin-vue";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import dns from "dns";
import { defineConfig } from "vite";
dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [vue(), VitePWA({ registerType: "autoUpdate" })],
  server: {
    port: 8100,
    open: true,
  },
});
