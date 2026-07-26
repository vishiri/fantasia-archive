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
          <FaHelpTooltipIcon
            class="dialogAppSettings__settingHelpIcon q-ml-md"
            :data-test-tooltip-text="setting.description"
          >
            <q-tooltip>
              {{ setting.description }}
            </q-tooltip>
          </FaHelpTooltipIcon>
        </div>
      </div>
      <q-toggle
        v-if="setting.control === 'toggle'"
        color="primary-bright"
        :model-value="setting.value"
        @update:model-value="onToggle"
      />
      <q-select
        v-else
        dense
        emit-value
        filled
        map-options
        options-dense
        class="dialogAppSettings__settingSelect"
        color="primary-bright"
        popup-content-class="dialogAppSettings__settingSelectMenu"
        :model-value="setting.value"
        :options="setting.options"
        :data-test-locator="selectLocator"
        @update:model-value="onSelect"
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
import type {
  I_appSettingsSettingRenderItem,
  T_appSettingsSettingUpdateValue
} from 'app/types/I_dialogAppSettings'
import { computed } from 'vue'

import FaHelpTooltipIcon from 'app/src/components/elements/FaHelpTooltipIcon/FaHelpTooltipIcon.vue'

const props = defineProps<{
  displayMode: 'tab' | 'search'
  setting: I_appSettingsSettingRenderItem
  settingKey: string
}>()

const emit = defineEmits<{
  'update-setting': [key: string, value: T_appSettingsSettingUpdateValue]
}>()

const settingLocator = computed(() => {
  const base = props.displayMode === 'tab' ? 'dialogAppSettings-setting' : 'dialogAppSettings-search-setting'
  return `${base}-${props.settingKey}`
})

const labelLocator = computed(() =>
  props.displayMode === 'tab' ? 'dialogAppSettings-settingLabel' : 'dialogAppSettings-search-settingLabel'
)

const selectLocator = computed(() =>
  props.displayMode === 'tab' ? 'dialogAppSettings-settingSelect' : 'dialogAppSettings-search-settingSelect'
)

function onToggle (value: boolean): void {
  emit('update-setting', props.settingKey, value)
}

function onSelect (value: string | null | undefined): void {
  if (typeof value !== 'string') {
    return
  }
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

.dialogAppSettings__settingSelect {
  max-width: $dialogAppSettings-settingSelect-maxWidth;
  padding: $dialogAppSettings-settingSelect-paddingBlock $dialogAppSettings-settingSelect-paddingInline;
  width: 100%;
}

.dialogAppSettings__settingNote {
  margin-left: $dialogAppSettings-settingTitle-marginLeft;
  text-shadow: $dialogAppSettings-settingNote-textShadow;
}
</style>

<style lang="scss" src="./styles/DialogAppSettings.settingSelectMenu.unscoped.scss"></style>
