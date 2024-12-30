<script setup lang="ts">
const enabled = defineModel<boolean>({ required: true });
const props = defineProps<{
  id: string;
  optionName: string;
}>();
</script>

<template>
  <div class="advanced-option">
    <div class="option-name">
      <input v-model="enabled" type="checkbox" :id="props.id" />
      <label :for="props.id">{{ props.optionName }}</label>
    </div>
    <p class="option-description">
      <slot></slot>
    </p>
  </div>
</template>

<style scoped>
.advanced-option > .option-name > label {
  padding-left: 5px;
}
.advanced-option > .option-description {
  padding-left: 26px;
}
</style>
