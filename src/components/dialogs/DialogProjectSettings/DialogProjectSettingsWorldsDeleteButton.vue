<template>
  <q-btn
    outline
    class="dialogProjectSettingsWorldsDeleteButton"
    color="negative"
    :disable="props.removeDisabled"
    :label="$t('dialogs.projectSettings.panels.worlds.deleteWorldButton')"
    data-test-locator="dialogProjectSettings-worlds-removeButton"
  >
    <q-tooltip v-if="props.removeDisabled">
      {{ $t(removeDisabledTooltipKey) }}
    </q-tooltip>

    <q-menu
      v-if="!props.removeDisabled"
      v-model="menuOpen"
      anchor="bottom middle"
      class="dialogProjectSettingsWorldsDeleteConfirm"
      dark
      data-test-locator="dialogProjectSettings-worlds-deleteConfirmMenu"
      no-focus
      :offset="menuOffset"
      self="top middle"
      transition-hide="fade"
      transition-show="fade"
      @hide="onMenuHide"
      @show="onMenuShow"
    >
      <div class="dialogProjectSettingsWorldsDeleteConfirm__inner">
        <p
          class="dialogProjectSettingsWorldsDeleteConfirm__message fa-text-body"
          data-test-locator="dialogProjectSettings-worlds-deleteConfirmMessage"
        >
          {{ $t('dialogs.projectSettings.panels.worlds.deleteConfirm.message') }}
        </p>
        <div class="dialogProjectSettingsWorldsDeleteConfirm__actions">
          <q-btn
            outline
            class="dialogProjectSettingsWorldsDeleteConfirm__confirmButton"
            :class="confirmDeleteCountdownActiveClass"
            color="negative"
            data-test-locator="dialogProjectSettings-worlds-deleteConfirmConfirmButton"
            :disable="confirmDeleteDisabled"
            @click="onConfirmDeleteClick"
          >
            <span class="dialogProjectSettingsWorldsDeleteConfirm__confirmLabel">
              {{ $t('dialogs.projectSettings.panels.worlds.deleteConfirm.confirmDeleteButton') }}
            </span>
            <span
              v-if="confirmDeleteDisabled"
              class="dialogProjectSettingsWorldsDeleteConfirm__countdown"
              data-test-locator="dialogProjectSettings-worlds-deleteConfirmCountdown"
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

import { useDialogProjectSettingsWorldsDeleteConfirm } from './scripts/dialogProjectSettingsWorldsDeleteButton_manager'

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

const {
  confirmDeleteDisabled,
  menuOffset,
  menuOpen,
  onMenuHide,
  onMenuShow,
  onConfirmDelete,
  secondsRemaining
} = useDialogProjectSettingsWorldsDeleteConfirm()

const removeDisabledTooltipKey = computed(() => {
  if (props.removeDisabledReason === 'hasDocuments') {
    return 'dialogs.projectSettings.panels.worlds.removeDisabledHasDocuments'
  }
  return 'dialogs.projectSettings.panels.worlds.removeDisabledLastWorld'
})

const confirmDeleteCountdownActiveClass = computed(() => {
  if (confirmDeleteDisabled.value) {
    return 'dialogProjectSettingsWorldsDeleteConfirm__confirmButton--countdownActive'
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
.dialogProjectSettingsWorldsDeleteButton {
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
