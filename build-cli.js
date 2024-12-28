import * as esbuild from "esbuild";
import path from "node:path";
import { readFile } from "node:fs/promises";

/**
 * @type import("esbuild").Plugin
 */
const ImportRawPlugin = {
  name: "raw",
  setup: (build) => {
    build.onResolve({ filter: /\?raw$/ }, (args) => {
      return {
        path: args.path,
        pluginData: {
          isAbsolute: path.isAbsolute(args.path),
          resolveDir: args.resolveDir,
        },
        namespace: "raw-loader",
      };
    });
    build.onLoad(
      { filter: /\?raw$/, namespace: "raw-loader" },
      async (args) => {
        const fullPath = args.pluginData.isAbsolute
          ? args.path
          : path.join(args.pluginData.resolveDir, args.path);
        return {
          contents: await readFile(fullPath.replace(/\?raw$/, "")),
          loader: "text",
        };
      },
    );
  },
};

await esbuild.build({
  entryPoints: ["src/cli/cli.ts"],
  bundle: true,
  outdir: "build",
  format: "esm",
  platform: "node",
  loader: {
    ".java": "text",
  },
  packages: "external",
  sourcemap: true,
  plugins: [ImportRawPlugin],
});
