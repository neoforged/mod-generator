import { Command, Option } from "commander";
import { generateTemplate } from "../generator";
import loadInputs from "../generator/io-node.ts";
import { fileURLToPath } from "url";
import * as fs from "node:fs";
import * as path from "node:path";
import { fetchVersions } from "../generator/versions.ts";
import { DOMParser } from "@xmldom/xmldom";

const program = new Command();

program.name("mod-template-generator");

program
  .command("generate")
  .requiredOption("--mod-name <string>", "name of the mod")
  .requiredOption("--mod-id <string>", "id of the mod")
  .requiredOption("--package-name <string>", "package name")
  .requiredOption("--minecraft-version <string>", "minecraft version")
  .requiredOption("--output-folder <string>", "output folder")
  .addOption(
    new Option(
      "--gradle-plugin <string>",
      "choose between ModDevGradle and NeoGradle",
    )
      .makeOptionMandatory(true)
      .default("mdg")
      .choices(["moddevgradle", "mdg", "neogradle", "ng"]),
  )
  .addOption(
    new Option(
      "--executable-gradlew <string>",
      "strategy to make gradlew executable",
    )
      .default("workflow-step")
      .choices(["no", "workflow-step"]),
  )
  .action(async (options) => {
    const {
      modName,
      modId,
      packageName,
      minecraftVersion,
      outputFolder,
      gradlePlugin,
      executableGradlew,
    } = options;

    const templatesFolder = fileURLToPath(
      import.meta.resolve("../src/assets/template"),
    );
    const templateInputs = await loadInputs(templatesFolder);
    const settings = {
      modName,
      modId,
      packageName,
      minecraftVersion,
      useNeoGradle: gradlePlugin === "ng" || gradlePlugin === "neogradle",
      chmodGradlewStep: executableGradlew === "workflow-step",
    };
    const result = await generateTemplate(
      templateInputs,
      settings,
      await fetchVersions(settings, () => new DOMParser()),
    );

    fs.rmSync(outputFolder, { recursive: true, force: true });
    fs.mkdirSync(outputFolder, { recursive: true });
    for (const [itemPath, itemContent] of Object.entries(result)) {
      const p = path.join(outputFolder, itemPath);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, itemContent);
    }
    console.log("Wrote %d files", Object.keys(result).length);
  })
  .parse();
