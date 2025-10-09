import type { Settings } from "./index.ts";

export interface MinecraftVersion {
  major: number;
  minor: number;
  patch: number;
}

export function parseMinecraftVersion(version: string): MinecraftVersion {
  const mcSplit = version.split(".");
  return {
    major: parseInt(mcSplit[0]),
    minor: parseInt(mcSplit[1]),
    patch: mcSplit.length == 3 ? parseInt(mcSplit[2]) : 0,
  };
}

export function compareMinecraftVersions(
  v1: MinecraftVersion,
  v2: MinecraftVersion,
): number {
  if (v1.major !== v2.major) {
    return v1.major - v2.major;
  }
  if (v1.minor !== v2.minor) {
    return v1.minor - v2.minor;
  }
  return v1.patch - v2.patch;
}

export interface ComputedVersions {
  minecraftVersions: string[];
  minecraftVersion: MinecraftVersion;
  gradlePluginVersion: string;
  parchmentMinecraftVersion: string;
  parchmentMappingsVersion: string;
  minecraftVersionRange: string;
  neoForgeVersion: string;
  loaderVersionRange: string;
}

/**
 * Fetch versions used in the template generator.
 */
export async function fetchVersions(
  settings: Settings,
  xmlParser: () => DOMParser | import("@xmldom/xmldom").DOMParser,
  minecraftVersions?: string[],
): Promise<ComputedVersions> {
  const mcVersion = parseMinecraftVersion(settings.minecraftVersion);
  const neoForgePrefix = `${mcVersion.minor}.${mcVersion.patch}.`;

  if (!minecraftVersions) {
    minecraftVersions = await fetchMinecraftVersions();
  }
  const versions = await Promise.all([
    settings.useNeoGradle
      ? fetchLatestMavenVersion("net.neoforged.gradle", "userdev", "7.0")
      : fetchLatestMavenVersion("net.neoforged", "moddev-gradle", "2.0"),
    fetchParchmentVersions(
      settings.minecraftVersion,
      xmlParser,
      minecraftVersions,
    ),
    fetchLatestMavenVersion("net.neoforged", "neoforge", neoForgePrefix),
  ]);
  return {
    minecraftVersions,
    minecraftVersion: mcVersion,
    gradlePluginVersion: versions[0],
    parchmentMinecraftVersion: versions[1].parchmentMinecraftVersion,
    parchmentMappingsVersion: versions[1].parchmentMappingsVersion,
    minecraftVersionRange: `[${settings.minecraftVersion}]`,
    neoForgeVersion: versions[2],
    // TODO: this is kinda useless, shouldn't we remove it altogether?
    loaderVersionRange: `[1,)`,
  };
}

/**
 * Fetch the list of existing Minecraft releases, new to old.
 * Stops at {@code 1.20.2}.
 */
export async function fetchMinecraftVersions(): Promise<string[]> {
  const result = await fetch(
    "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json",
  );
  const json = await result.json();
  const ret: string[] = [];
  for (const entry of json.versions) {
    if (entry.type !== "release") {
      continue;
    }
    ret.push(entry.id);
    if (entry.id === "1.20.4") {
      break; // We don't support releases older than 1.20.4.
    }
  }
  return ret;
}

async function fetchLatestMavenVersion(
  group: string,
  artifact: string,
  filter?: string,
): Promise<string> {
  const filterSuffix = filter ? `?filter=${filter}` : "";
  const req = await fetch(
    `https://maven.neoforged.net/api/maven/latest/version/releases/${group.replace(/\./g, "/")}/${artifact}${filterSuffix}`,
  );
  return (await req.json()).version;
}

async function fetchParchmentVersions(
  mcVersion: string,
  xmlParser: () => DOMParser | import("@xmldom/xmldom").DOMParser,
  minecraftVersions: string[],
) {
  let foundMcVersion = false;
  // Scan each MC version, new to old, to find suitable parchment data.
  for (const candidateVersion of minecraftVersions) {
    if (candidateVersion === mcVersion) {
      foundMcVersion = true;
    }
    if (!foundMcVersion) {
      continue;
    }
    const req = await fetch(
      `https://maven.neoforged.net/releases/org/parchmentmc/data/parchment-${candidateVersion}/maven-metadata.xml`,
    );
    if (!req.ok) {
      continue; // MC version might not have parchment data yet.
    }
    const xmlDocument = xmlParser().parseFromString(
      await req.text(),
      "text/xml",
    );
    const release = xmlDocument
      .getElementsByTagName("metadata")[0]
      .getElementsByTagName("versioning")[0]
      .getElementsByTagName("release");
    if (release.length === 1) {
      if (!release[0].textContent) {
        throw new Error("Unexpected null text content for node " + release[0]);
      }
      return {
        parchmentMinecraftVersion: candidateVersion,
        parchmentMappingsVersion: release[0].textContent,
      };
    }
  }
  throw new Error(
    `Failed to find Parchment version for Minecraft ${mcVersion} or older.`,
  );
}
