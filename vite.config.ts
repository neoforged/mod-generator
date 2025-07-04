import { defineConfig, Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from 'vite-plugin-vuetify'
import path from "path";
import { readFileSync } from "fs";

const bufferLoader: Plugin = {
  name: "buffer-loader",
  transform(_, id) {
    const [path, query] = id.split("?");
    if (query != "buffer") return null;

    const data = readFileSync(path);
    const base64 = data.toString("base64");

    return `
    function decodeBase64(base64) {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
    
    export default decodeBase64('${base64}');`;
  },
};

// https://vite.dev/config/
export default defineConfig({
  build: {
    // It only includes vite.svg which we don't need in the built output.
    copyPublicDir: false,
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      formats: ["es"],
    },
  },
  define: {
    // Required in library mode to get rid of process.env in the built file.
    "process.env.NODE_ENV": '"production"',
  },
  plugins: [vue(), vuetify({ autoImport: true }), bufferLoader],
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "src/assets"),
    },
  },
});
