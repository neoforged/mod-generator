import type { TemplateInputs } from "./index.ts";

// global syntax taken from https://github.com/vitejs/vite/discussions/12191
const RAW_FILES = import.meta.glob("@assets/template/raw/**/*", {
  eager: true,
  query: "?buffer",
  import: "default",
  exhaustive: true,
}) as Record<string, Uint8Array>;

/* INTERPOLATED FILES - included as is after string replacement */
const INTERPOLATED_FILES = import.meta.glob(
  "@assets/template/interpolated/**/*",
  {
    eager: true,
    query: "?buffer",
    import: "default",
    exhaustive: true,
  },
) as Record<string, Uint8Array>;

const inputs: TemplateInputs = {
  raw: RAW_FILES,
  interpolated: INTERPOLATED_FILES,
};

export default inputs;
