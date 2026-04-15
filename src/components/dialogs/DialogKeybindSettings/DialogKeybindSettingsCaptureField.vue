<template>
  <div class="dialogKeybindSettingsCapture__fieldRow row items-start justify-center no-wrap">
    <div class="dialogKeybindSettingsCapture__field col">
      <div
        :id="statusRegionId"
        class="dialogKeybindSettingsCapture__srStatus"
        data-test-locator="dialogKeybindSettings-capture-field-message"
        role="status"
        aria-live="polite"
      >
        {{ activeFieldMessage }}
      </div>
      <div class="dialogKeybindSettingsCapture__keybindUpdateField">
        <q-field
          filled
          readonly
          dense
          class="dialogKeybindSettingsCapture__fieldShell q-ml-lg"
          data-test-locator="dialogKeybindSettings-capture-qfield"
          :data-test-keybind-field-has-error="hasError ? 'true' : 'false'"
          :dark="false"
          :label="(captureLabel.length === 0) ? $t('dialogs.keybindSettings.captureHint') : ''"
          :error="hasError"
          :error-message="hasError ? activeFieldMessage : ''"
        >
          <template #after>
            <q-icon
              name="mdi-help-circle"
              size="23px"
              class="dialogKeybindSettingsCapture__helpIcon"
              role="img"
              :aria-label="$t('dialogs.keybindSettings.captureHelpAria')"
            >
              <q-tooltip
                :delay="500"
                content-class="dialogKeybindSettingsCapture__tooltip"
              >
                <div class="dialogKeybindSettingsCapture__tooltipShell">
                  <p class="dialogKeybindSettingsCapture__tooltipHeading">
                    {{ $t('dialogs.keybindSettings.captureHelpHeading') }}
                  </p>
                  <ul class="dialogKeybindSettingsCapture__tooltipList">
                    <li
                      v-for="lineKey in captureHelpLineKeys"
                      :key="lineKey"
                      class="dialogKeybindSettingsCapture__tooltipListItem"
                    >
                      {{ $t(lineKey) }}
                    </li>
                  </ul>
                  <p class="dialogKeybindSettingsCapture__tooltipFootnote">
                    {{ $t('dialogs.keybindSettings.captureHelpFootnote') }}
                  </p>
                </div>
              </q-tooltip>
            </q-icon>
          </template>
          <template #control>
            <div class="dialogKeybindSettingsCapture__fieldControl self-center full-width no-outline">
              {{ captureLabel }}
            </div>
          </template>
        </q-field>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Storybook SFC compile resolves this import without the 'app' alias; keep a repo-relative path to 'types/'.
import type { I_dialogKeybindSettingsCaptureFieldProps } from '../../../../types/I_dialogKeybindSettings'
import {
  DIALOG_KEYBIND_CAPTURE_HELP_LINE_KEYS,
  useDialogKeybindSettingsCaptureFieldDisplay
} from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsCaptureFieldDisplay'

const props = defineProps<I_dialogKeybindSettingsCaptureFieldProps>()

const captureHelpLineKeys = DIALOG_KEYBIND_CAPTURE_HELP_LINE_KEYS

const {
  activeFieldMessage,
  hasError
} = useDialogKeybindSettingsCaptureFieldDisplay(props)
</script>

<style lang="scss" scoped>
.dialogKeybindSettingsCapture__field {
  min-width: 0;
}

.dialogKeybindSettingsCapture__fieldControl {
  min-width: 0;
}

.dialogKeybindSettingsCapture__fieldRow {
  margin-top: $dialogKeybindSettingsCapture-fieldRow-marginTop;
}

.dialogKeybindSettingsCapture__fieldShell {
  min-width: 0;
}

.dialogKeybindSettingsCapture__helpIcon {
  margin-left: $dialogKeybindSettingsCapture-helpIcon-marginLeft;
  opacity: 0.95;
  right: 0;
  top: $dialogKeybindSettingsCapture-helpIcon-top;
}

.dialogKeybindSettingsCapture__keybindUpdateField {
  margin-left: auto;
  margin-right: auto;
  max-width: $dialogKeybindSettingsCapture-keybindUpdateField-maxWidth;
  padding: $dialogKeybindSettingsCapture-keybindUpdateField-padding;
  width: 100%;

  :deep(.q-field--filled .q-field__control) {
    background-color: transparent;
  }

  :deep(.q-field__append) {
    position: absolute;
    right: 0;
    top: $dialogKeybindSettingsCapture-fieldAppend-top;
  }

  :deep(.q-field__control-container) {
    text-align: center;
  }

  :deep(.q-field__label) {
    margin-top: $dialogKeybindSettingsCapture-fieldLabel-marginTop;
    text-align: center;
  }

  :deep(.q-field__native) {
    text-align: center;
  }
}

.dialogKeybindSettingsCapture__srStatus {
  clip-path: inset(50%);
  height: $dialogKeybindSettingsCapture-srStatus-dimensionalSize;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: $dialogKeybindSettingsCapture-srStatus-dimensionalSize;
}
</style>

<style lang="scss">
.dialogKeybindSettingsCapture__tooltip {
  font-size: $dialogKeybindSettingsCapture-tooltip-fontSize;
  font-weight: $dialogKeybindSettingsCapture-tooltip-fontWeight;
  max-width: $dialogKeybindSettingsCapture-tooltip-maxWidth;
  text-align: left;
}

.dialogKeybindSettingsCapture__tooltipFootnote {
  margin: $dialogKeybindSettingsCapture-tooltip-footnote-marginTop 0 0;
}

.dialogKeybindSettingsCapture__tooltipHeading {
  font-weight: $dialogKeybindSettingsCapture-tooltip-fontWeight;
  margin: 0 0 $dialogKeybindSettingsCapture-tooltip-heading-marginBottom;
}

.dialogKeybindSettingsCapture__tooltipList {
  list-style: disc;
  margin: 0;
  padding-left: $dialogKeybindSettingsCapture-tooltip-list-paddingLeft;
}

.dialogKeybindSettingsCapture__tooltipListItem {
  margin: $dialogKeybindSettingsCapture-tooltip-listItem-marginVertical 0;
}

.dialogKeybindSettingsCapture__tooltipShell {
  background: $dialogKeybindSettingsCapture-tooltip-background;
  border: $dialogKeybindSettingsCapture-tooltip-border;
  color: $dialogKeybindSettingsCapture-tooltip-text;
  padding: $dialogKeybindSettingsCapture-tooltip-padding;
}
</style>
