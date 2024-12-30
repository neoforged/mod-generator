import Mustache from "mustache";
import type { ComputedVersions } from "./versions.ts";

export interface Settings {
  modName: string;
  modId: string;
  packageName: string;
  minecraftVersion: string;
}

/**
 * Maps a template file name to its contents.
 */
export type GeneratedTemplate = Record<string, Uint8Array>;

export interface TemplateInputs {
  raw: Record<string, Uint8Array>;
  interpolated: Record<string, Uint8Array>;
}

/**
 * Main entrypoint of template generation.
 */
export async function generateTemplate(
  inputs: TemplateInputs,
  settings: Settings,
  versions: ComputedVersions,
): Promise<GeneratedTemplate> {
  const ret: GeneratedTemplate = {};

  generateRaw(inputs, ret);
  generateInterpolated(inputs, settings, versions, ret);
  generateSpecial(settings, versions, ret);

  return ret;
}

function iterateGlob(
  globResult: Record<string, Uint8Array>,
  folderMarker: string,
  callback: (file: string, contents: Uint8Array) => void,
) {
  for (let key in globResult) {
    const rawStart = key.indexOf(folderMarker);
    if (rawStart === -1) {
      throw new Error(`Missing ${folderMarker} in ${key}`);
    }
    const filePath = key.substring(rawStart + folderMarker.length);
    callback(filePath, globResult[key]);
  }
}

function interpolateTemplate(template: string, view: any): string {
  return Mustache.render(template, view, undefined, {
    // No escaping since we're not rendering to HTML.
    // TODO: double check since there is a TS "unused property escape" warning
    escape: (value: any) => value,
  });
}

/* RAW FILES - included as is */

function generateRaw(inputs: TemplateInputs, ret: GeneratedTemplate) {
  iterateGlob(inputs.raw, "raw/", (filePath, contents) => {
    ret[filePath] = contents;
  });
}

function generateInterpolated(
  inputs: TemplateInputs,
  settings: Settings,
  versions: ComputedVersions,
  ret: GeneratedTemplate,
) {
  const view: Record<string, any> = {
    mdg_version: versions.mdgVersion,
    parchment_minecraft_version: versions.parchmentMinecraftVersion,
    parchment_mappings_version: versions.parchmentMappingsVersion,
    minecraft_version: settings.minecraftVersion,
    minecraft_version_range: versions.minecraftVersionRange,
    neo_version: versions.neoForgeVersion,
    neo_version_range: versions.neoForgeVersionRange,
    loader_version_range: versions.loaderVersionRange,
    mod_id: settings.modId,
    mod_name: settings.modName,
    mod_group_id: settings.packageName,
  };
  if (
    compareMinecraftVersions(
      versions.minecraftVersion,
      parseMinecraftVersion("1.21.4"),
    ) < 0
  ) {
    view.data_run_type = "data";
  } else {
    view.data_run_type = "clientData";
  }
  iterateGlob(inputs.interpolated, "interpolated/", (filePath, contents) => {
    const textContent = new TextDecoder().decode(contents);
    ret[filePath] = encodeUtf8(interpolateTemplate(textContent, view));
  });
  return ret;
}

/* SPECIAL FILES - included with more complex processing */
import en_us_json from "../assets/template/special/en_us.json?raw";
import Config_java from "../assets/template/special/Config.java?raw";
import ModClass_java from "../assets/template/special/ModClass.java?raw";
import { compareMinecraftVersions, parseMinecraftVersion } from "./versions.ts";

function generateSpecial(
  settings: Settings,
  versions: ComputedVersions,
  ret: GeneratedTemplate,
) {
  const modClassName = settings.modName.replace(/[^A-Za-z0-9]/g, "");
  const view: Record<string, any> = {
    mod_id: settings.modId,
    package_name: settings.packageName,
    mod_class_name: modClassName,
  };
  if (
    compareMinecraftVersions(
      versions.minecraftVersion,
      parseMinecraftVersion("1.21.3"),
    ) < 0
  ) {
    view.registry_get_value = "get";
  } else {
    view.registry_get_value = "getValue";
  }

  ret[`src/main/resources/assets/${settings.modId}/lang/en_us.json`] =
    encodeUtf8(interpolateTemplate(en_us_json, view));

  const javaFolder = `src/main/java/${settings.packageName.replace(".", "/")}`;
  ret[`${javaFolder}/Config.java`] = encodeUtf8(
    interpolateTemplate(Config_java, view),
  );
  ret[`${javaFolder}/${modClassName}.java`] = encodeUtf8(
    interpolateTemplate(ModClass_java, view),
  );
}

function encodeUtf8(content: string): Uint8Array {
  return new TextEncoder().encode(content);
}
