import { defineConfig, Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { readFileSync } from "fs";

const bufferLoader: Plugin = {
  name: 'buffer-loader',
  transform(_, id) {
    const [path, query] = id.split('?');
    if (query != 'buffer')
      return null;

    const data = readFileSync(path);
    const base64 = data.toString('base64');

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
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), bufferLoader],
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "src/assets"),
    },
  },
});
