<template>
  <FaDeleteConfirmButton
    button-class="dialogProjectSettingsWorldsDeleteButton"
    confirm-button-test-locator="dialogProjectSettings-worlds-deleteConfirmConfirmButton"
    confirm-menu-test-locator="dialogProjectSettings-worlds-deleteConfirmMenu"
    confirm-message-test-locator="dialogProjectSettings-worlds-deleteConfirmMessage"
    countdown-test-locator="dialogProjectSettings-worlds-deleteConfirmCountdown"
    delete-button-label-key="dialogs.projectSettings.panels.worlds.deleteWorldButton"
    delete-confirm-confirm-button-key="dialogs.projectSettings.panels.worlds.deleteConfirm.confirmDeleteButton"
    delete-confirm-message-key="dialogs.projectSettings.panels.worlds.deleteConfirm.message"
    remove-button-test-locator="dialogProjectSettings-worlds-removeButton"
    :remove-disabled="props.removeDisabled"
    :remove-disabled-tooltip-key="removeDisabledTooltipKey"
    @confirm="emit('confirm')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import FaDeleteConfirmButton from 'app/src/components/elements/FaDeleteConfirmButton/FaDeleteConfirmButton.vue'

defineOptions({
  name: 'DialogProjectSettingsWorldsDeleteButton'
})

const props = defineProps<{
  removeDisabled: boolean
  removeDisabledReason: 'hasDocuments' | 'lastWorld' | null
}>()

const emit = defineEmits<{
  confirm: []
}>()

const removeDisabledTooltipKey = computed(() => {
  if (props.removeDisabledReason === 'hasDocuments') {
    return 'dialogs.projectSettings.panels.worlds.removeDisabledHasDocuments'
  }
  return 'dialogs.projectSettings.panels.worlds.removeDisabledLastWorld'
})
</script>
