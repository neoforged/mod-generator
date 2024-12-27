<script setup lang="ts">
import { ref } from "vue";
import { generateTemplate } from "../generator/";

const MC_VERSIONS = ["1.21.4", "1.21.3"];

const modName = ref("Example Mod");
const packageName = ref("com.example");
const minecraftVersion = ref("1.21.4");

function computeModId(modName: string): string {
  return modName.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function generateToJSON() {
  return generateTemplate({
    modName: modName.value,
    modId: computeModId(modName.value),
    packageName: packageName.value,
    minecraftVersion: minecraftVersion.value,
  });
}

function handleClick() {
  alert(JSON.stringify(generateToJSON));
}
</script>

<template>
  <h3>Mod Name</h3>
  <p>
    Choose a name for your mod. The mod id will be: <code>{{ modName }}</code>
  </p>
  <p><input v-model="modName" type="text" /></p>

  <h3>Package Name</h3>
  <p>Choose a package name for your mod. It should be unique for your mod.</p>
  <p><input v-model="packageName" type="text" /></p>

  <h3>Minecraft Version</h3>
  <p>Choose the Minecraft version for your mod.</p>
  <p>
    <select v-model="minecraftVersion">
      <option v-for="version in MC_VERSIONS">{{ version }}</option>
    </select>
  </p>
  <p>Selected: {{ minecraftVersion }}</p>

  <h3>Generate!</h3>
  <button @click="handleClick">Generate!</button>

  <h3>Result</h3>
  <div v-for="(value, key) in generateToJSON()">
    <h5>{{ key }}</h5>
    <code style="white-space: pre; text-align: left">{{ value }}</code>
  </div>
</template>

<style scoped></style>
