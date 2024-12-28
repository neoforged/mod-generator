import { Command } from "commander";
import { generateTemplate } from "../generator";

const program = new Command();

program.name("mod-template-generator");

program
  .command("generate")
  .requiredOption("--mod-name <string>", "name of the mod")
  .requiredOption("--mod-id <string>", "id of the mod")
  .requiredOption("--package-name <string>", "package name")
  .requiredOption("--minecraft-version <string>", "minecraft version");

program.parse();

const { modName, modId, packageName, minecraftVersion } = program.opts();

generateTemplate({
  modName,
  modId,
  packageName,
  minecraftVersion,
});
