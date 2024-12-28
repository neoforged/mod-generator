export function globAssets(): Record<string, unknown> {
  if (typeof import.meta !== "undefined" && typeof import.meta.glob !== "undefined") {
    return import.meta.glob("@assets/template/raw/**/*", {
      eager: true,
      query: "?raw",
      import: "default",
    });
  } else {
    return {};
  }
}

export function globInterpolated(): Record<string, unknown> {
  if (typeof import.meta !== "undefined" && typeof import.meta.glob !== "undefined") {
    return import.meta.glob("@assets/template/interpolated/**/*", {
      eager: true,
      query: "?raw",
      import: "default",
    });
  } else {
    return {};
  }
}
