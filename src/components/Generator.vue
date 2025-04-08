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
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const mcVersions = ref<string[]>([]);

const modName = ref("Example Mod");
const overrideModId = ref(false);
const userOverridenModId = ref("");
const packageName = ref("com.example.examplemod");
const minecraftVersion = ref("1.21.4");
const gradlePlugin = ref("ModDevGradle");

const modId = computed(() => {
  if (overrideModId.value) {
    return userOverridenModId.value;
  } else {
    return computeModId(modName.value);
  }
});

const isFormValid = computed(() => {
  return (
    isModIdValid(modId.value) &&
    isModNameValid(modName.value) &&
    isPackageNameValid(packageName.value)
  );
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

function isModNameValid(modName: string): boolean {
  // FML doesn't do any check for the mod name,
  // however let's ask for at least 3 non-space characters.
  let nameWithoutSpaces = modName.replace(/\s/g, "");
  return nameWithoutSpaces.length >= 3;
}

// Sourced from FML. Should work in JS too?
const MOD_ID_REGEX = /^(?=.{2,64}$)[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/;

function isModIdValid(modId: string): boolean {
  return MOD_ID_REGEX.test(modId);
}

// Sourced from https://stackoverflow.com/questions/29783092/regexp-to-match-java-package-name
const PACKAGE_NAME_REGEX = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_]$/;

function isPackageNameValid(packageName: string): boolean {
  return PACKAGE_NAME_REGEX.test(packageName);
}

async function generateToJSON() {
  const settings = {
    modName: modName.value,
    modId: modId.value,
    packageName: packageName.value,
    minecraftVersion: minecraftVersion.value,
    useNeoGradle: gradlePlugin.value === "NeoGradle",
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
  <div class="mod-generator" v-if="mcVersions.length > 0">
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

    <h3>Gradle Plugin</h3>
    <p>Choose the Gradle plugin to use for your mod.</p>
    <p>
      <select v-model="gradlePlugin">
        <option>ModDevGradle</option>
        <option>NeoGradle</option>
      </select>
    </p>

    <h3 v-if="!isFormValid">Invalid input!</h3>
    <p v-if="!isModNameValid(modName)">
      Please choose a valid mod name. <code>{{ modName }}</code> is not a valid
      mod name.
    </p>
    <p v-if="!isModIdValid(modId)">
      Please choose a valid mod identifier. <code>{{ modId }}</code> is not a
      valid mod identifier.
    </p>
    <p v-if="!isPackageNameValid(packageName)">
      Please choose a valid package name. <code>{{ packageName }}</code> is not
      a valid package name.
    </p>
    <button
      class="download-button"
      @click="downloadZip"
      :disabled="!isFormValid"
    >
      <FontAwesomeIcon :icon="faDownload" /> Download Mod Project
    </button>
  </div>
  <div v-else>
    <p>Loading Minecraft versions...</p>
  </div>
</template>

<style>
.mod-generator > h3 {
  margin-bottom: 0.25em;
}
</style>
