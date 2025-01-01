import type { TemplateInputs } from "./index.ts";
import { glob } from "glob";
import * as path from "node:path";
import { readFileSync } from "fs";

async function readFolder(folder: string): Promise<Record<string, Uint8Array>> {
  console.debug("Reading %o", folder);
  const files = await glob(folder + "/**", {
    absolute: false,
    cwd: folder,
    nodir: true,
    dot: true,
  });

  return Object.fromEntries(
    files.map((file) => {
      const p = path.join(folder, file).replace(/\\/g, "/");
      return [p, readFileSync(p)];
    }),
  );
}

export default async function loadInputs(
  folder: string,
): Promise<TemplateInputs> {
  return {
    raw: await readFolder(path.join(folder, "raw")),
    interpolated: await readFolder(path.join(folder, "interpolated")),
  };
}
