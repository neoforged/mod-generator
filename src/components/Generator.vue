<script setup lang="ts">
import {computed, onMounted, reactive, type Ref, ref} from "vue";
import {type GeneratedTemplate, generateTemplate} from "../generator/";
import templateInputs from "../generator/io-vite.ts";
import {fetchMinecraftVersions, fetchVersions,} from "../generator/versions.ts";
import {helpers, maxLength, minLength, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import PreviewDialog from "./PreviewDialog.vue";
import {saveAs} from "file-saver";
import JSZip from "jszip";

const mcVersions = ref<string[]>([]);

const state = reactive({
  modName: 'Example Mod',
  modId: 'examplemod',
  packageName: 'com.example.examplemod',
  minecraftVersion: '',
  gradlePlugin: 'ModDevGradle',
  mixins: false
})

onMounted(async () => {
  mcVersions.value = await fetchMinecraftVersions();
  if (mcVersions.value.length > 0) {
    // Select latest MC version by default
    state.minecraftVersion = mcVersions.value[0];
  }
});

function computeModId(modName: string): string {
  return modName.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const automaticModId = ref(true)
const previewTemplate = ref<GeneratedTemplate | undefined>()

const onToggleModId = (value: boolean | null) => {
  if (value) {
    state.modId = computeModId(state.modName)
  }
}

const onModNameUpdated = (value: string) => {
  if (automaticModId.value) {
    state.modId = computeModId(value)
  }
}

async function generateToJSON() {
  const settings = {
    modName: state.modName,
    modId: state.modId,
    packageName: state.packageName,
    minecraftVersion: state.minecraftVersion,
    useNeoGradle: state.gradlePlugin === "NeoGradle",
    chmodGradlewStep: true,
    mixins: state.mixins
  };
  return generateTemplate(
      templateInputs,
      settings,
      await fetchVersions(settings, () => new DOMParser(), mcVersions.value),
  );
}

const zipName = computed(() => `${computeModId(state.modId)}-template-${state.minecraftVersion}.zip`)

async function generateAndDownload() {
  await downloadZip(await generateToJSON())
}

async function generateAndPreview() {
  previewTemplate.value = await generateToJSON()
}

async function downloadGeneratedTemplate() {
  await downloadZip(previewTemplate.value!!)
}

async function downloadZip(template: GeneratedTemplate) {
  const zip = new JSZip();
  for (let [k, v] of Object.entries(template)) {
    zip.file(k, v);
  }
  await zip.generateAsync({type: "blob"}).then((blob) => {
    saveAs(
        blob,
        zipName.value,
    );
  });
}

const validations = {
  modName: {
    required,
    minLength: helpers.withMessage('Mod name should have at least 3 characters', minLength(3))
  },
  modId: {
    required,
    minLength: helpers.withMessage('Mod ID must have at least 2 characters', minLength(2)),
    maxLength: helpers.withMessage('Mod ID must have at most 64 characters', maxLength(64)),
    // Regex sourced from FML
    pattern: helpers.withMessage('Invalid mod ID', helpers.regex(/^(?=.{2,64}$)[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/))
  },
  packageName: {
    required,
    // Sourced from https://stackoverflow.com/questions/29783092/regexp-to-match-java-package-name
    pattern: helpers.withMessage('Package name is not valid', helpers.regex(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_]$/))
  }
}

const v$ = useVuelidate(validations, state)
const errors: Ref<string[]> = ref([])
const overlay = ref(false)

const submit = async (generator: () => Promise<any>) => {
  const isCorrect = await v$.value.$validate()
  if (isCorrect) {
    overlay.value = true
    await generator()
        .finally(() => overlay.value = false)
  } else {
    errors.value.push('Inputs are not valid!')
  }
}

</script>

<template>
  <div class="mod-generator" v-if="mcVersions.length > 0">
    <v-overlay v-model="overlay" class="screen-center">
      <v-progress-circular
          color="primary"
          indeterminate
          size="64"
      />
    </v-overlay>
    <v-snackbar-queue timeout="1000" color="error" v-model="errors"/>
    <v-form @submit.prevent>
      <v-text-field
          v-model="state.modName"
          @update:model-value="onModNameUpdated"
          label="Mod Name"
          hint="Choose a name for your mod"
          persistent-hint
          required
          :error-messages="v$.modName.$errors.map(e => e.$message as string)"
          @blur="v$.modName.$validate"
          @input="v$.modName.$validate().then(() => automaticModId ? v$.modId.$validate() : undefined)"
          variant="outlined"
          class="rounded"
      />
      <br/>

      <v-text-field
          v-model="state.modId"
          label="Mod ID"
          hint="Choose an identifier for your mod. It should be unique for your mod."
          persistent-hint
          required
          :error-messages="v$.modId.$errors.map(e => e.$message as string)"
          @blur="v$.modId.$validate"
          @input="v$.modId.$validate"
          variant="outlined"
          class="rounded"
          :disabled="automaticModId"
          :bg-color="v$.modId.$errors.length > 0 && automaticModId ? 'red' : undefined"
      />
      <v-checkbox
          v-model="automaticModId"
          @update:model-value="onToggleModId"
          label="Generate mod ID from name"
      />

      <v-text-field
          v-model="state.packageName"
          label="Package Name"
          hint="Choose a package name for your mod. It should be unique for your mod"
          persistent-hint
          required
          :error-messages="v$.packageName.$errors.map(e => e.$message as string)"
          @blur="v$.packageName.$validate"
          @input="v$.packageName.$validate"
          variant="outlined"
      />
      <br/>

      <v-select
          v-model="state.minecraftVersion"
          :items="mcVersions"
          label="Minecraft Version"
          hint="Choose the Minecraft version for your mod"
          persistent-hint
          required
          variant="outlined"
          :menu-props="{scrollStrategy: 'none'}"
      />
      <br/>

      <v-select
          v-model="state.gradlePlugin"
          :items="['ModDevGradle', 'NeoGradle']"
          label="Gradle Plugin"
          hint="Choose the Gradle plugin to use in your mod"
          persistent-hint
          required
          variant="outlined"
          :menu-props="{scrollStrategy: 'none'}"
      />
      <br/>

      <details>
        <summary>Advanced Options</summary>
        <br/>
        <div style="margin-left: 1rem">
          <input id="mixins" type="checkbox" v-model="state.mixins" style="width: 1rem; height: 1rem"/>
          <label for="mixins" style="margin-left: 0.5rem"><b>Add mixin configuration</b></label>
          <div style="margin-left: 2rem">Tick to add a mixin configuration to the generated project</div>
        </div>
      </details>
      <br />

      <v-btn
          prepend-icon="fas fa-magnifying-glass"
          @click="submit(generateAndPreview)"
          :color="v$.$invalid ? 'error' : 'secondary'"
          rounded="lg"
          class="ma-2"
      >Preview Mod Project
      </v-btn>
      <v-btn
          prepend-icon="fas fa-download"
          @click="submit(generateAndDownload)"
          :color="v$.$invalid ? 'error' : 'primary'"
          rounded="lg"
          class="ma-2"
      >Download Mod Project
      </v-btn>
    </v-form>

    <PreviewDialog
        :template="previewTemplate"
        :zip-name="zipName"
        @close="previewTemplate = undefined"
        @generate="downloadGeneratedTemplate"
    />
  </div>
  <div v-else>
    <p>Loading Minecraft versions...</p>
  </div>
</template>

<style>
.mod-generator > h3 {
  margin-bottom: 0.25em;
}

.screen-center {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
