import Mustache from "mustache";

interface Settings {
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
): Promise<GeneratedTemplate> {
  const ret: GeneratedTemplate = {};

  generateRaw(inputs, ret);
  generateInterpolated(inputs, settings, ret);
  generateSpecial(settings, ret);

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
  ret: GeneratedTemplate,
) {
  const view = {
    mdg_version: "1.0.23",
    parchment_minecraft_version: "1.21.4",
    parchment_mappings_version: "2024.12.22",
    minecraft_version: settings.minecraftVersion,
    minecraft_version_range: "[1.21.4, 1.22)",
    neo_version: "21.4.38-beta",
    neo_version_range: "[21.4.0-beta,)",
    loader_version_range: "[4,)",
    mod_id: settings.modId,
    mod_name: settings.modName,
    mod_group_id: settings.packageName,
  };
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

function generateSpecial(settings: Settings, ret: GeneratedTemplate) {
  const modClassName = settings.modName.replace(/[^A-Za-z0-9]/g, "");
  const view = {
    mod_id: settings.modId,
    package_name: settings.packageName,
    mod_class_name: modClassName,
  };

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
