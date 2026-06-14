<template>
  <div
    class="col-12 col-sm-6 col-lg-4"
  >
    <div
      class="dialogAppSettings__setting"
      :data-test-locator="settingLocator"
      :data-test-setting-id="String(settingKey)"
      :data-test-tags="setting.tags"
    >
      <div class="row items-center no-wrap q-mb-xs">
        <div class="dialogAppSettings__settingTitle">
          <span
            class="dialogAppSettings__settingLabel fa-text-label text-body2"
            :data-test-locator="labelLocator"
          >{{ setting.title }}</span>
          <q-icon
            name="mdi-help-circle"
            size="16px"
            class="dialogAppSettings__settingHelpIcon q-ml-md"
            :data-test-tooltip-text="setting.description"
          >
            <q-tooltip
              :delay="500"
            >
              {{ setting.description }}
            </q-tooltip>
          </q-icon>
        </div>
      </div>
      <q-toggle
        color="primary-bright"
        :model-value="setting.value"
        @update:model-value="onToggle"
      />
      <p
        v-if="setting.note !== undefined && setting.note !== ''"
        class="dialogAppSettings__settingNote fa-text-danger-emphasis text-caption q-mt-xs q-mb-none"
        data-test-locator="dialogAppSettings-settingNote"
      >
        {{ setting.note }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { I_appSettingsSettingRenderItem } from 'app/types/I_dialogAppSettings'
import { computed } from 'vue'

const props = defineProps<{
  displayMode: 'tab' | 'search'
  setting: I_appSettingsSettingRenderItem
  settingKey: string
}>()

const emit = defineEmits<{
  'update-setting': [key: string, value: boolean]
}>()

const settingLocator = computed(() => {
  const base = props.displayMode === 'tab' ? 'dialogAppSettings-setting' : 'dialogAppSettings-search-setting'
  return `${base}-${props.settingKey}`
})

const labelLocator = computed(() =>
  props.displayMode === 'tab' ? 'dialogAppSettings-settingLabel' : 'dialogAppSettings-search-settingLabel'
)

function onToggle (value: boolean): void {
  emit('update-setting', props.settingKey, value)
}
</script>

<style lang="scss" scoped>
.dialogAppSettings__settingTitle {
  align-items: center;
  display: flex;
  justify-content: flex-start;
  margin-bottom: $dialogAppSettings-settingTitle-marginBottom;
  margin-left: $dialogAppSettings-settingTitle-marginLeft;
  margin-top: $dialogAppSettings-settingTitle-marginTop;
  width: calc(100% - #{$dialogAppSettings-settingTitle-widthSubtract});
}

.dialogAppSettings__settingLabel {
  font-weight: $dialogAppSettings-settingLabel-fontWeight;
  letter-spacing: $dialogAppSettings-settingLabel-letterSpacing;
}

.dialogAppSettings__settingHelpIcon {
  align-self: flex-start;
  margin-top: $dialogAppSettings-settingHelpIcon-marginTop;
}

.dialogAppSettings__settingNote {
  margin-left: $dialogAppSettings-settingTitle-marginLeft;
  text-shadow: $dialogAppSettings-settingNote-textShadow;
}
</style>
