import * as esbuild from "esbuild";
import { glob } from "glob";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * @type Plugin
 */
export const EsbuildPluginImportGlob = {
  name: "import-glob",
  setup: (build) => {
    build.onResolve({ filter: /\*/ }, async (args) => {
      if (args.resolveDir === "") {
        return; // Ignore unresolvable paths
      }

      return {
        path: args.path,
        namespace: "import-glob",
        pluginData: {
          resolveDir: args.resolveDir,
        },
      };
    });

    build.onLoad({ filter: /.*/, namespace: "import-glob" }, async (args) => {
      const files = (
        await glob(args.path, {
          cwd: args.pluginData.resolveDir,
          dotRelative: true,
          nodir: true,
        })
      )
        .sort()
        .map((file) => [
          file.replaceAll("\\", "/"),
          readFileSync(path.join(args.pluginData.resolveDir, file)).toString(
            "base64",
          ),
        ]);
      const fileMap = Object.fromEntries(files);

      let importerCode = `
        const files = ${JSON.stringify(fileMap, null, 2)};
        export default files;
      `;

      return { contents: importerCode, resolveDir: args.pluginData.resolveDir };
    });
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
  plugins: [EsbuildPluginImportGlob],
});
