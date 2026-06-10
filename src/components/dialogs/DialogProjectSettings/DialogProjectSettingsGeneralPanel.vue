<template>
  <div class="dialogProjectSettings__generalPanel">
    <h6
      class="dialogProjectSettings__panelTitle text-bold q-mb-none text-subtitle1 text-primary-bright"
      data-test-locator="dialogProjectSettings-field-projectName-title"
    >
      {{ $t('dialogs.projectSettings.fields.projectName.title') }}
    </h6>

    <q-input
      :model-value="props.projectName"
      color="primary-bright"
      counter
      dark
      data-test-locator="dialogProjectSettings-input-projectName"
      filled
      lazy-rules
      :maxlength="FA_PROJECT_NAME_MAX_LEN"
      outlined
      @update:model-value="emitProjectName"
    />
  </div>
</template>

<script setup lang="ts">
import { FA_PROJECT_NAME_MAX_LEN } from 'app/src-electron/shared/faProjectConstants'

const props = defineProps<{
  projectName: string
}>()

const emit = defineEmits<{
  'update:projectName': [value: string]
}>()

function emitProjectName (value: string | number | null): void {
  if (value === null || value === undefined) {
    emit('update:projectName', '')
    return
  }
  emit('update:projectName', String(value))
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.panelTitle.unscoped.scss"></style>
