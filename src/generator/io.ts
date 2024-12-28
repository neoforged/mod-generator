export async function globAssets(): Promise<Record<string, unknown>> {
  if (typeof import.meta !== "undefined" && typeof import.meta.glob !== "undefined") {
    return Promise.resolve(import.meta.glob("@assets/template/raw/**/*", {
      eager: true,
      query: "?raw",
      import: "default"
    }));
  } else {
    return (await import("../assets/template/raw/**/*")).default;
  }
}

export async function globInterpolated(): Promise<Record<string, unknown>> {
  if (typeof import.meta !== "undefined" && typeof import.meta.glob !== "undefined") {
    return Promise.resolve(import.meta.glob("@assets/template/interpolated/**/*", {
      eager: true,
      query: "?raw",
      import: "default"
    }));
  } else {
    return (await import("../assets/template/interpolated/**/*")).default;
  }
}
