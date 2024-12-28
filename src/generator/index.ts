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
interface GeneratedTemplate {
  [file: string]: string;
}

/**
 * Main entrypoint of template generation.
 */
export function generateTemplate(settings: Settings): GeneratedTemplate {
  const ret: GeneratedTemplate = {};

  generateRaw(ret);
  generateInterpolated(settings, ret);
  generateSpecial(settings, ret);

  return ret;
}

function iterateGlob(
  globResult: Record<string, any>,
  folderMarker: string,
  callback: (file: string, contents: string) => void,
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
    escape: (value: any) => value,
  });
}

/* RAW FILES - included as is */

// global syntax taken from https://github.com/vitejs/vite/discussions/12191
const RAW_FILES = await globAssets();

function generateRaw(ret: GeneratedTemplate) {
  iterateGlob(RAW_FILES, "raw/", (filePath, contents) => {
    ret[filePath] = contents;
  });
}

/* INTERPOLATED FILES - included as is after string replacement */
const INTERPOLATED_FILES = await globInterpolated();

function generateInterpolated(settings: Settings, ret: GeneratedTemplate) {
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
  iterateGlob(INTERPOLATED_FILES, "interpolated/", (filePath, contents) => {
    ret[filePath] = interpolateTemplate(contents, view);
  });
  return ret;
}

/* SPECIAL FILES - included with more complex processing */
import en_us_json from "../assets/template/special/en_us.json?raw";
import Config_java from "../assets/template/special/Config.java?raw";
import ModClass_java from "../assets/template/special/ModClass.java?raw";
import { globAssets, globInterpolated } from "./io.ts";

function generateSpecial(settings: Settings, ret: GeneratedTemplate) {
  const modClassName = settings.modName.replace(/[^A-Za-z0-9]/g, "");
  const view = {
    mod_id: settings.modId,
    package_name: settings.packageName,
    mod_class_name: modClassName,
  };

  ret[`src/main/resources/assets/${settings.modId}/lang/en_us.json`] =
    interpolateTemplate(en_us_json, view);

  const javaFolder = `src/main/java/${settings.packageName.replace(".", "/")}`;
  ret[`${javaFolder}/Config.java`] = interpolateTemplate(Config_java, view);
  ret[`${javaFolder}/${modClassName}.java`] = interpolateTemplate(
    ModClass_java,
    view,
  );
}
