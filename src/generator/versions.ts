import type { Settings } from "./index.ts";

export interface ComputedVersions {
  mdgVersion: string;
  parchmentMinecraftVersion: string;
  parchmentMappingsVersion: string;
  minecraftVersionRange: string;
  neoForgeVersion: string;
  neoForgeVersionRange: string;
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
  const mcSplit = settings.minecraftVersion.split(".");
  const neoForgePrefix = `${mcSplit[1]}.${mcSplit.length == 3 ? mcSplit[2] : 0}`;

  const versions = await Promise.all([
    fetchLatestMavenVersion("net.neoforged", "moddev-gradle", "1.0"),
    fetchParchmentVersions(
      settings.minecraftVersion,
      xmlParser,
      minecraftVersions,
    ),
    fetchLatestMavenVersion("net.neoforged", "neoforge", neoForgePrefix),
  ]);
  return {
    mdgVersion: versions[0],
    parchmentMinecraftVersion: versions[1].parchmentMinecraftVersion,
    parchmentMappingsVersion: versions[1].parchmentMappingsVersion,
    minecraftVersionRange: `[${settings.minecraftVersion}]`,
    neoForgeVersion: versions[2],
    neoForgeVersionRange: `[${versions[2]},)`,
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
    if (entry.id === "1.20.1") {
      break; // We don't support 1.20.1 or older releases.
    }
    ret.push(entry.id);
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
    `https://maven.neoforged.net/api/maven/latest/version/releases/${group.replace(".", "/")}/${artifact}${filterSuffix}`,
  );
  return (await req.json()).version;
}

async function fetchParchmentVersions(
  mcVersion: string,
  xmlParser: () => DOMParser | import("@xmldom/xmldom").DOMParser,
  minecraftVersions?: string[],
) {
  if (!minecraftVersions) {
    minecraftVersions = await fetchMinecraftVersions();
  }

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
