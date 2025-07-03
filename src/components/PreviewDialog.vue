<script setup lang="ts">
import type {GeneratedTemplate} from "../generator";
import {computed, ref, watch} from "vue";

const props = defineProps<{
  template?: GeneratedTemplate
  zipName?: string
}>();

const fileIcons: {
  [key: string]: string
} = {
  'java': 'fab fa-java',
  'gitignore': 'fab fa-git',
  'gitattributes': 'fab fa-git',
  'yml': 'fab fa-github',
  'jar': 'fas fa-box-archive',
  'gradle': 'fas fa-file-code',

  'toml': 'fas fa-file-pen',
  'json': 'fas fa-file-pen',
  'properties': 'fas fa-file-pen'
}

const isTextFile = (type: string): boolean => {
  return type != 'jar'
}

interface FileTreeElement {
  title: string
  path: string
}

interface File extends FileTreeElement {
  file?: string
}
const createFile = (name: string, path: string): File => {
  if (name.includes('.')) {
    const lastDot = name.lastIndexOf('.')
    const type = name.substring(lastDot + 1)
    return {
      title: name,
      path: path,
      file: type,
    }
  }
  return {
    title: name,
    path: path
  }
}

class Folder implements FileTreeElement {
  title: string
  path: string
  children: FileTreeElement[] = []

  public constructor(name: string, path: string) {
    this.title = name
    this.path = path
  }

  public getChildFolder(name: string): Folder {
    const child = this.children.find(f => f instanceof Folder && f.title == name)
    if (child) return <Folder>child
    const subFolder = new Folder(name, this.path ? this.path + '/' + name : name)
    this.children.push(subFolder)
    return subFolder
  }

  public addFile(name: string) {
    this.children.push(createFile(name, this.path ? this.path + '/' + name : name))
  }

  public sort() {
    this.children.sort((a, b) => {
      if (a instanceof Folder && !(b instanceof Folder)) {
        return -1
      } else if (!(a instanceof Folder) && b instanceof Folder) {
        return 1
      }
      return a.title.localeCompare(b.title)
    })
    this.children.forEach(c => {
      if (c instanceof Folder) {
        c.sort()
      }
    })
  }
}

const isEnabled = computed(() => !!props.template)
const emit = defineEmits<{
  close: []
  generate: []
}>()

const treeItems = computed(() => {
  if (!props.template) return []
  const rootFolder = new Folder('', '')
  Object.keys(props.template).forEach(name => {
    const splitName = name.split('/')
    let folder = rootFolder
    for (let i = 0; i < splitName.length - 1; i++) {
      folder = folder.getChildFolder(splitName[i])
    }
    folder.addFile(splitName[splitName.length - 1])
  })
  rootFolder.sort()
  return rootFolder.children
})

const codeDisplayState = ref<{
  name: string
  content: string
  extension: string
} | undefined>()

const openItems = ref<string[]>([])

const lastElement = <T>(array: T[]): T => {
  return array[array.length - 1]
}

const updateActiveFile = (activeFiles: unknown) => {
  const activeFile = (activeFiles as string[])[0]
  if (!activeFile) {
    codeDisplayState.value = undefined
    return
  }

  const name = lastElement(activeFile.split('/'))
  const extension = lastElement(name.split('.'))
  if (isTextFile(extension)) {
    codeDisplayState.value = {
      name,
      extension,
      content: new TextDecoder('utf-8').decode(props.template!![activeFile])
    }
  } else {
    codeDisplayState.value = undefined
  }
}

const messageQueue = ref<any[]>([])

const copyActiveFile = async () => {
  await navigator.clipboard.writeText(codeDisplayState.value!.content)
  messageQueue.value.push({
    text: 'Copied file content to clipboard',
    timeout: 500,
    color: 'green',
    location: 'top right'
  })
}

watch(() => props.template, (newTemplate) => {
  if (!newTemplate) {
    messageQueue.value = []
    openItems.value = []
    codeDisplayState.value = undefined
  }
})

</script>

<template>
  <v-dialog
      v-model="isEnabled"
      fullscreen
      class="bg-surface-variant"
  >
    <v-snackbar-queue v-model="messageQueue" />
    <v-toolbar class="bg-surface-variant">
      <v-toolbar-title>Preview template</v-toolbar-title>
      <v-toolbar-items>
        <v-btn
            text="Close"
            variant="text"
            @click="emit('close')"
        ></v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-container class="fill-height overflow-auto" fluid>
      <v-row class="fill-height overflow-auto">
        <v-col cols="4" class="fill-height overflow-auto">
          <div class="text-center text-h6 border-surface-light border-lg">{{ props.zipName }}</div>
          <v-treeview
            :items="treeItems"
            v-model:opened="openItems"
            density="compact"
            open-on-click
            class="bg-surface-variant"
            elevation=10
            height="90%"
            activatable
            active-strategy="single-leaf"
            item-value="path"
            @update:activated="updateActiveFile"
          >
            <template v-slot:prepend="{ item }">
              <v-icon class="ma-1" v-if="item instanceof Folder" :icon="openItems.includes(item.path) ? 'far fa-folder-open' : 'fas fa-folder'" />
              <v-icon class="ma-1" v-else :icon="fileIcons[(item as File).file ?? ''] ?? 'fas fa-file'" />
            </template>
          </v-treeview>
        </v-col>
        <v-col cols="8" class="fill-height overflow-auto">
          <div v-if="codeDisplayState != undefined" class="elevation-5">
            <v-toolbar class="bg-surface-variant" density="compact" rounded elevation=6>
              <v-toolbar-title>{{ codeDisplayState.name }}</v-toolbar-title>
              <v-toolbar-items>
                <v-btn
                    variant="text"
                    @click="copyActiveFile"
                ><v-icon icon="fas fa-copy"/></v-btn>
              </v-toolbar-items>
            </v-toolbar>
            <pre><highlightjs :language="codeDisplayState.extension" :code="codeDisplayState.content" /></pre>
          </div>
          <div v-else class="text-center">
            <h3><i>Select a text file to preview it</i></h3>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <div class="text-center pa-6">
      <v-btn
          prepend-icon="fas fa-download"
          @click="emit('generate')"
          color="primary"
          rounded="lg"
      >Download Mod Project</v-btn>
    </div>
  </v-dialog>
</template>