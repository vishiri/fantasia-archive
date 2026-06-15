<template>
  <q-btn
    outline
    class="dialogProjectSettingsDocumentTemplatesDeleteButton"
    color="negative"
    :disable="props.removeDisabled"
    :label="$t('dialogs.projectSettings.panels.documentTemplates.deleteTemplateButton')"
    data-test-locator="dialogProjectSettings-documentTemplates-removeButton"
    no-caps
  >
    <q-tooltip v-if="props.removeDisabled">
      {{ $t('dialogs.projectSettings.panels.documentTemplates.removeDisabledHasDocuments') }}
    </q-tooltip>

    <q-menu
      v-if="!props.removeDisabled"
      v-model="menuOpen"
      anchor="bottom middle"
      class="dialogProjectSettingsDocumentTemplatesDeleteConfirm"
      dark
      data-test-locator="dialogProjectSettings-documentTemplates-deleteConfirmMenu"
      no-focus
      :offset="menuOffset"
      self="top middle"
      transition-hide="fade"
      transition-show="fade"
    >
      <div class="dialogProjectSettingsDocumentTemplatesDeleteConfirm__inner">
        <p
          class="dialogProjectSettingsDocumentTemplatesDeleteConfirm__message fa-text-body"
          data-test-locator="dialogProjectSettings-documentTemplates-deleteConfirmMessage"
        >
          {{ $t('dialogs.projectSettings.panels.documentTemplates.deleteConfirm.message') }}
        </p>
        <div class="dialogProjectSettingsDocumentTemplatesDeleteConfirm__actions">
          <q-btn
            outline
            class="dialogProjectSettingsDocumentTemplatesDeleteConfirm__confirmButton"
            :class="confirmDeleteCountdownActiveClass"
            color="negative"
            data-test-locator="dialogProjectSettings-documentTemplates-deleteConfirmConfirmButton"
            :disable="confirmDeleteDisabled"
            @click="onConfirmDeleteClick"
          >
            <span class="dialogProjectSettingsDocumentTemplatesDeleteConfirm__confirmLabel">
              {{ $t('dialogs.projectSettings.panels.documentTemplates.deleteConfirm.confirmDeleteButton') }}
            </span>
            <span
              v-if="confirmDeleteDisabled"
              class="dialogProjectSettingsDocumentTemplatesDeleteConfirm__countdown"
              data-test-locator="dialogProjectSettings-documentTemplates-deleteConfirmCountdown"
            >
              {{ secondsRemaining }}
            </span>
          </q-btn>
        </div>
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useDialogProjectSettingsDocumentTemplatesDeleteConfirm } from './scripts/dialogProjectSettingsDocumentTemplatesDeleteButton_manager'

defineOptions({
  name: 'DialogProjectSettingsDocumentTemplatesDeleteButton'
})

const props = defineProps<{
  removeDisabled: boolean
}>()

const emit = defineEmits<{
  confirm: []
}>()

const {
  confirmDeleteDisabled,
  menuOffset,
  menuOpen,
  onConfirmDelete,
  secondsRemaining
} = useDialogProjectSettingsDocumentTemplatesDeleteConfirm()

const confirmDeleteCountdownActiveClass = computed(() => {
  if (confirmDeleteDisabled.value) {
    return 'dialogProjectSettingsDocumentTemplatesDeleteConfirm__confirmButton--countdownActive'
  }
  return null
})

function onConfirmDeleteClick (): void {
  onConfirmDelete(() => {
    emit('confirm')
  })
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.worldsDeleteConfirm.unscoped.scss"></style>

<style lang="scss" scoped>
.dialogProjectSettingsDocumentTemplatesDeleteButton {
  min-height: auto;
  padding:
    $dialogProjectSettings-worldsDeleteButton-paddingY
    $dialogProjectSettings-worldsDeleteButton-paddingX;

  :deep(.q-btn__content) {
    min-height: auto;
    padding: 0;
  }
}
</style>
