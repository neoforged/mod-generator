<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
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
import { zodResolver } from '@primeuix/forms/resolvers/zod';
import { z } from 'zod';
import {useToast} from "primevue";
import type {FormFieldState, FormSubmitEvent} from "@primevue/forms";

type FormState = {
  [key: string]: FormFieldState
}

const toast = useToast()

const mcVersions = ref<string[]>([]);

const initialValues = reactive({
  modName: 'Example Mod',
  modId: 'examplemod',
  packageName: 'com.example.examplemod',
  minecraftVersion: '',
  gradlePlugin: 'ModDevGradle'
})

onMounted(async () => {
  mcVersions.value = await fetchMinecraftVersions();
  if (mcVersions.value.length > 0) {
    // Select latest MC version by default
    initialValues.minecraftVersion = mcVersions.value[0];
  }
});

function computeModId(modName: string): string {
  return modName.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const automaticModId = ref(true)

const onToggleModId = (form: FormState) => {
  if (automaticModId.value) {
  } else {
    form.modId.value = computeModId(form.modName.value)
  }
  automaticModId.value = !automaticModId.value
}

const onModNameUpdated = (form: FormState, value: string) => {
  if (automaticModId.value) {
    form.modId.value = computeModId(value)
  }
}

async function generateToJSON(fields: Record<string, FormFieldState>) {
  const settings = {
    modName: fields.modName.value,
    modId: fields.modId.value,
    packageName: fields.packageName.value,
    minecraftVersion: fields.minecraftVersion.value,
    useNeoGradle: fields.gradlePlugin.value === "NeoGradle",
    chmodGradlewStep: true,
  };
  return generateTemplate(
    templateInputs,
    settings,
    await fetchVersions(settings, () => new DOMParser(), mcVersions.value),
  );
}

async function downloadZip(fields: Record<string, FormFieldState>) {
  const zip = new JSZip();
  for (let [k, v] of Object.entries(await generateToJSON(fields))) {
    zip.file(k, v);
  }
  await zip.generateAsync({ type: "blob" }).then((blob) => {
    saveAs(
      blob,
      `${computeModId(fields.modId.value)}-template-${fields.minecraftVersion.value}.zip`,
    );
  });
}

const onFormSubmit = (event: FormSubmitEvent) => {
  if (!event.valid) {
    toast.add({
      severity: 'error',
      summary: 'Mod configuration is not valid',
      life: 3000
    })
  } else {
    const msg = {
      severity: 'success',
      summary: 'Mod project is being generated... please wait',
      closable: false
    }
    toast.add(msg)
    downloadZip(event.states)
        .then(() => toast.remove(msg))
  }
}

const resolver = zodResolver(
    z.object({
      modName: z.string()
          .trim()
          // FML doesn't do any check for the mod name,
          // however let's ask for at least 3 non-space characters.
          .min(3, { message: 'Mod name should have at least 3 characters' }),

      modId: z.string()
          .trim()
          .min(2, { message: 'Mod ID must have at least 2 characters '})
          .max(64, { message: 'Mod ID must have at most 64 characters '})
          // Regex sourced from FML
          .regex(/^(?=.{2,64}$)[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/, { message: 'Invalid mod ID' }),

      packageName: z.string()
          .trim()
          // Sourced from https://stackoverflow.com/questions/29783092/regexp-to-match-java-package-name
          .regex(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_]$/, { message: 'Package name is not valid' })
    })
)

</script>

<template>
  <div class="mod-generator" v-if="mcVersions.length > 0">
    <Toast />
    <div class="card flex justify-center">
      <Form v-slot="$form" :initialValues :resolver @submit="onFormSubmit" >
        <FloatLabel variant="on">
          <label for="mod-name">Mod Name</label>
          <InputText @valueChange="(value: string) => onModNameUpdated($form, value)" id="mod-name" name="modName" aria-describedby="mod-name-help" fluid />
        </FloatLabel>
        <Message size="small" severity="secondary" variant="simple">Choose a name for your mod.</Message>
        <Message v-if="$form.modName?.invalid" severity="error" size="small" variant="simple">{{ $form.modName.error?.message }}</Message>

        <br />

        <FloatLabel variant="on">
          <label for="mod-id">Mod ID</label>
          <InputText id="mod-id" name="modId" aria-describedby="mod-id-help" :disabled="automaticModId" fluid />
        </FloatLabel>
        <Message size="small" severity="secondary" variant="simple">
          Choose an identifier for your mod. It should be unique for your mod.
          <br />
          <a @click="onToggleModId($form)">{{ automaticModId ? 'Inferred from mod name. Click here to choose another mod id.' : 'Click here to infer from mod name.' }}</a>
        </Message>
        <Message v-if="$form.modId?.invalid" severity="error" size="small" variant="simple">{{ $form.modId.error?.message }}</Message>

        <br />

        <FloatLabel variant="on">
          <label for="package-name">Package Name</label>
          <InputText id="package-name" name="packageName" aria-describedby="package-name-help" fluid />
        </FloatLabel>
        <Message size="small" severity="secondary" variant="simple">Choose a package name for your mod. It should be unique for your mod.</Message>
        <Message v-if="$form.packageName?.invalid" severity="error" size="small" variant="simple">{{ $form.packageName.error?.message }}</Message>

        <br />

        <FloatLabel variant="on">
          <Select inputId="minecraft-version" name="minecraftVersion" aria-describedby="minecraft-version-help" :options="mcVersions" fluid />
          <label for="minecraft-version">Minecraft Version</label>
        </FloatLabel>
        <Message size="small" severity="secondary" variant="simple">Choose the Minecraft version for your mod.</Message>
        <Message v-if="$form.minecraftVersion?.invalid" severity="error" size="small" variant="simple">{{ $form.minecraftVersion.error?.message }}</Message>

        <br />

        <FloatLabel variant="on">
          <Select inputId="gradle-plugin" name="gradlePlugin" aria-describedby="gradle-plugin-help" :options="['ModDevGradle', 'NeoGradle']" fluid />
          <label for="gradle-plugin">Gradle Plugin</label>
        </FloatLabel>
        <Message size="small" severity="secondary" variant="simple">Choose the Gradle plugin to use for your mod.</Message>

        <br />

        <Button type="submit" :severity="$form.valid ? 'success' : 'danger'">
          <FontAwesomeIcon :icon="faDownload" /> Download Mod Project
        </Button>
      </Form>
    </div>
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
