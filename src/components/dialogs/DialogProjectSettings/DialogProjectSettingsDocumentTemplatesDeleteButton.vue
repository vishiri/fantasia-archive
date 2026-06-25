<template>
  <FaDeleteConfirmButton
    button-class="dialogProjectSettingsDocumentTemplatesDeleteButton"
    confirm-button-test-locator="dialogProjectSettings-documentTemplates-deleteConfirmConfirmButton"
    confirm-menu-test-locator="dialogProjectSettings-documentTemplates-deleteConfirmMenu"
    confirm-message-test-locator="dialogProjectSettings-documentTemplates-deleteConfirmMessage"
    countdown-test-locator="dialogProjectSettings-documentTemplates-deleteConfirmCountdown"
    delete-button-label-key="dialogs.projectSettings.panels.documentTemplates.deleteTemplateButton"
    delete-confirm-confirm-button-key="dialogs.projectSettings.panels.documentTemplates.deleteConfirm.confirmDeleteButton"
    delete-confirm-message-key="dialogs.projectSettings.panels.documentTemplates.deleteConfirm.message"
    no-caps
    remove-button-test-locator="dialogProjectSettings-documentTemplates-removeButton"
    :remove-disabled="props.removeDisabled"
    remove-disabled-tooltip-key="dialogs.projectSettings.panels.documentTemplates.removeDisabledHasDocuments"
    @confirm="emit('confirm')"
  />
</template>

<script setup lang="ts">
import FaDeleteConfirmButton from 'app/src/components/elements/FaDeleteConfirmButton/FaDeleteConfirmButton.vue'

defineOptions({
  name: 'DialogProjectSettingsDocumentTemplatesDeleteButton'
})

const props = defineProps<{
  removeDisabled: boolean
}>()

const emit = defineEmits<{
  confirm: []
}>()
</script>
