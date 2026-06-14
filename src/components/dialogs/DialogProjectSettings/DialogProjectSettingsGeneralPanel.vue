<template>
  <div class="dialogProjectSettings__generalPanel">
    <div class="dialogProjectSettings__generalPanelContent">
      <div class="dialogProjectSettings__generalPanelTitle text-primary-bright text-weight-bold">
        {{ $t('dialogs.projectSettings.fields.projectName.label') }}
      </div>
      <q-input
        :model-value="props.projectName"
        class="dialogProjectSettings__generalPanelProjectNameInput"
        color="primary-bright"
        counter
        dark
        :data-test-validation-error="props.nameHasError ? 'true' : 'false'"
        data-test-locator="dialogProjectSettings-input-projectName"
        filled
        lazy-rules
        :maxlength="FA_PROJECT_NAME_MAX_LEN"
        :error="props.nameHasError"
        :error-message="props.nameHasError ? $t('dialogs.projectSettings.fields.projectName.errorRequired') : undefined"
        outlined
        @update:model-value="emitProjectName"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FA_PROJECT_NAME_MAX_LEN } from 'app/src-electron/shared/faProjectConstants'

const props = defineProps<{
  nameHasError: boolean
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

<style lang="scss" src="./styles/DialogProjectSettings.generalPanel.unscoped.scss"></style>
