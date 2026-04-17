<template>
  <q-dialog
    :model-value="modelValue"
    :aria-describedby="captureAriaDescribedBy"
    :aria-labelledby="titleRegionId"
    @update:model-value="onDialogModel"
  >
    <q-card
      class="dialogKeybindSettingsCapture"
      data-test-locator="dialogKeybindSettings-capture-card"
    >
      <!-- Close -->
      <q-btn
        class="dialogKeybindSettingsCapture__close"
        dense
        flat
        round
        :aria-label="$t('dialogs.keybindSettings.captureCloseAria')"
        color="dark"
        data-test-locator="dialogKeybindSettings-capture-close"
        icon="close"
        type="button"
        @click="onDialogModel(false)"
      />

      <!-- Action title -->
      <div
        :id="titleRegionId"
        class="dialogKeybindSettingsCapture__actionTitle text-center text-weight-medium"
      >
        {{ actionName }}
      </div>

      <DialogKeybindSettingsCaptureField
        :capture-error="captureError"
        :capture-error-message="captureErrorMessage"
        :capture-info-message="captureInfoMessage"
        :capture-label="captureLabel"
        :status-region-id="statusRegionId"
      />

      <div class="dialogKeybindSettingsCapture__actions flex justify-around q-mt-md">
        <q-btn
          class="dialogKeybindSettingsCapture__btnClear text-uppercase text-weight-bold"
          color="secondary"
          data-test-locator="dialogKeybindSettings-capture-clear"
          :disable="!canClearCapture"
          unelevatedd
          :label="$t('dialogs.keybindSettings.captureClear')"
          @click="emit('captureClear')"
        />
        <q-btn
          class="dialogKeybindSettingsCapture__btnSet text-uppercase text-weight-bold"
          color="dark"
          data-test-locator="dialogKeybindSettings-capture-set"
          :disable="!canSubmitChord"
          text-color="white"
          unelevated
          :label="$t('dialogs.keybindSettings.captureSet')"
          @click="emit('captureSet')"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

import DialogKeybindSettingsCaptureField from 'app/src/components/dialogs/DialogKeybindSettings/DialogKeybindSettingsCaptureField.vue'
// Storybook SFC compile resolves this import without the 'app' alias; keep a repo-relative path to 'types/'.
import type { I_dialogKeybindSettingsCaptureDialogProps } from '../../../../types/I_dialogKeybindSettings'

const props = defineProps<I_dialogKeybindSettingsCaptureDialogProps>()

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  captureClear: []
  captureSet: []
}>()

const titleRegionId = useId()
const statusRegionId = useId()

const canClearCapture = computed(() => {
  return props.captureLabel.length > 0
})

const canSubmitChord = computed(() => {
  return props.hasPendingChord && !props.captureError
})

const captureAriaDescribedBy = computed(() => {
  const hasInfo = props.captureInfoMessage.length > 0
  const hasErr = props.captureError && props.captureErrorMessage.length > 0
  if (hasInfo || hasErr) {
    return statusRegionId
  }
  return undefined
})

function onDialogModel (open: boolean): void {
  emit('update:modelValue', open)
}
</script>

<style lang="scss" scoped>
.dialogKeybindSettingsCapture {
  background: $dialogKeybindSettingsCapture-cardBackground;
  color: $dialogKeybindSettingsCapture-text;
  max-height: calc(100vh - #{$dialogKeybindSettingsCapture-card-maxHeightViewportSubtract}) !important;
  max-width: $dialogKeybindSettingsCapture-card-maxWidth !important;
  min-width: $dialogKeybindSettingsCapture-card-minWidth;
  padding: $dialogKeybindSettingsCapture-card-padding;
  position: relative;

  &__actionTitle {
    color: $dialogKeybindSettingsCapture-titleText;
    font-size: $dialogKeybindSettingsCapture-title-fontSize;
    margin-top: $dialogKeybindSettingsCapture-title-marginTop;
  }

  &__actions {
  }

  &__btnClear,
  &__btnSet {
    min-width: $dialogKeybindSettingsCapture-actionBtn-minWidth !important;
    padding: $dialogKeybindSettingsCapture-actionBtn-padding;
  }

  &__close {
    position: absolute;
    right: $dialogKeybindSettingsCapture-closeButton-inset;
    top: $dialogKeybindSettingsCapture-closeButton-inset;
  }
}
</style>
