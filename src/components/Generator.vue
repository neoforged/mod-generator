<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { type GeneratedTemplate, generateTemplate } from "../generator/";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import templateInputs from "../generator/io-vite.ts";

const mcVersions = ref<string[]>([]);

const modName = ref("Example Mod");
const overrideModId = ref(false);
const userOverridenModId = ref("");
const packageName = ref("com.example");
const minecraftVersion = ref("1.21.4");

const modId = computed(() => {
  if (overrideModId.value) {
    return userOverridenModId.value;
  } else {
    return computeModId(modName.value);
  }
});

// TODO: remove, this is just for testing
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadMcVersions(): Promise<string[]> {
  await sleep(2000); // TODO: remove, this is just for testing
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

onMounted(async () => (mcVersions.value = await loadMcVersions()));

function computeModId(modName: string): string {
  return modName.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function chooseModIdManually() {
  overrideModId.value = true;
  userOverridenModId.value = computeModId(modName.value);
}

function chooseModIdAutomatically() {
  overrideModId.value = false;
}

async function generateToJSON() {
  return generateTemplate(templateInputs, {
    modName: modName.value,
    modId: modId.value,
    packageName: packageName.value,
    minecraftVersion: minecraftVersion.value,
  });
}

async function downloadZip() {
  const zip = new JSZip();
  for (let [k, v] of Object.entries(await generateToJSON())) {
    zip.file(k, v);
  }
  zip.generateAsync({ type: "blob" }).then((blob) => {
    saveAs(
      blob,
      `${computeModId(modId.value)}-template-${minecraftVersion.value}.zip`,
    );
  });
}

// TODO: remove once testing is over
const generatedFiles = ref<GeneratedTemplate>();
async function updatePreview() {
  generatedFiles.value = await generateToJSON();
}
</script>

<template>
  <div v-if="mcVersions.length > 0">
    <h3>Mod Name</h3>
    <p>Choose a name for your mod.</p>
    <p><input v-model="modName" type="text" /></p>

    <h3>Mod Id</h3>
    <p>Choose an identifier for your mod. It should be unique for your mod.</p>
    <div v-if="overrideModId">
      <p>
        <a @click="chooseModIdAutomatically">Infer from mod name.</a>
      </p>
      <p><input v-model="userOverridenModId" type="text" /></p>
    </div>
    <p v-else>
      Inferred from mod name: <code>{{ modId }} </code>.
      <a @click="chooseModIdManually">Choose another modid.</a>
    </p>

    <h3>Package Name</h3>
    <p>Choose a package name for your mod. It should be unique for your mod.</p>
    <p><input v-model="packageName" type="text" /></p>

    <h3>Minecraft Version</h3>
    <p>Choose the Minecraft version for your mod.</p>
    <p>
      <select v-model="minecraftVersion">
        <option v-for="version in mcVersions">{{ version }}</option>
      </select>
    </p>
    <p>Selected: {{ minecraftVersion }}</p>

    <h3>Generate!</h3>
    <button @click="downloadZip">Download!</button>
    <button @click="updatePreview">Update Preview</button>

    <h3>Result</h3>
    <div v-for="(_value, key) in generatedFiles">
      <h5>{{ key }}</h5>
      <!--      <code style="white-space: pre; text-align: left">{{ value }}</code>-->
    </div>
  </div>
  <div v-else>
    <p>Loading Minecraft versions...</p>
  </div>
</template>

<style scoped></style>
