import { Command } from "commander";
import { generateTemplate } from "../generator";
import loadInputs from "../generator/io-node.ts";
import { fileURLToPath } from "url";
import * as fs from "node:fs";
import * as path from "node:path";

const program = new Command();

program.name("mod-template-generator");

program
  .command("generate")
  .requiredOption("--mod-name <string>", "name of the mod")
  .requiredOption("--mod-id <string>", "id of the mod")
  .requiredOption("--package-name <string>", "package name")
  .requiredOption("--minecraft-version <string>", "minecraft version")
  .requiredOption("--output-folder <string>", "output folder")
  .action(async (options) => {
    const { modName, modId, packageName, minecraftVersion, outputFolder } =
      options;

    const templatesFolder = fileURLToPath(
      import.meta.resolve("../src/assets/template"),
    );
    const templateInputs = await loadInputs(templatesFolder);
    const result = await generateTemplate(templateInputs, {
      modName,
      modId,
      packageName,
      minecraftVersion,
    });

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
