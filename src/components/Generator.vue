<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { generateTemplate } from "../generator/";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import templateInputs from "../generator/io-vite.ts";
import {
  fetchMinecraftVersions,
  fetchVersions,
} from "../generator/versions.ts";
import AdvancedOption from "./AdvancedOption.vue";

const mcVersions = ref<string[]>([]);

const modName = ref("Example Mod");
const overrideModId = ref(false);
const userOverridenModId = ref("");
const packageName = ref("com.example");
const minecraftVersion = ref("1.21.4");
const useNeoGradle = ref(false);

const modId = computed(() => {
  if (overrideModId.value) {
    return userOverridenModId.value;
  } else {
    return computeModId(modName.value);
  }
});

onMounted(async () => (mcVersions.value = await fetchMinecraftVersions()));

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
  const settings = {
    modName: modName.value,
    modId: modId.value,
    packageName: packageName.value,
    minecraftVersion: minecraftVersion.value,
    useNeoGradle: useNeoGradle.value,
  };
  return generateTemplate(
    templateInputs,
    settings,
    await fetchVersions(settings, () => new DOMParser(), mcVersions.value),
  );
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
        <a @click="chooseModIdAutomatically">
          Click here to infer from mod name.
        </a>
      </p>
      <p><input v-model="userOverridenModId" type="text" /></p>
    </div>
    <p v-else>
      Inferred from mod name: <code>{{ modId }} </code>.
      <a @click="chooseModIdManually">Click here to choose another modid.</a>
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

    <h3>Advanced Options</h3>
    <AdvancedOption
      v-model="useNeoGradle"
      id="useNeoGradle"
      option-name="Use NeoGradle instead of ModDevGradle."
    >
      For the most part, these two plugins are functionally equivalent, but
      ModDevGradle is aimed for simpler and more streamlined buildscripts and
      Gradle setups, while NeoGradle supports having multiple NeoForge/Minecraft
      versions in the same project.
    </AdvancedOption>

    <h3>Download</h3>
    <button @click="downloadZip">Download Template</button>
  </div>
  <div v-else>
    <p>Loading Minecraft versions...</p>
  </div>
</template>

<style scoped></style>
