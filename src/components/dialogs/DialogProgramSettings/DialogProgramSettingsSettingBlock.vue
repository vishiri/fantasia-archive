<script setup lang="ts">
import type { I_programSettingRenderItem } from 'app/types/I_dialogProgramSettings'
import { computed } from 'vue'

const props = defineProps<{
  displayMode: 'tab' | 'search'
  setting: I_programSettingRenderItem
  settingKey: string
}>()

const emit = defineEmits<{
  'update-setting': [key: string, value: boolean]
}>()

const settingLocator = computed(() => {
  const base = props.displayMode === 'tab' ? 'dialogProgramSettings-setting' : 'dialogProgramSettings-search-setting'
  return `${base}-${props.settingKey}`
})

const labelLocator = computed(() =>
  props.displayMode === 'tab' ? 'dialogProgramSettings-settingLabel' : 'dialogProgramSettings-search-settingLabel'
)

function onToggle (value: boolean): void {
  emit('update-setting', props.settingKey, value)
}
</script>

<template>
  <div
    class="col-12 col-sm-6 col-lg-4"
  >
    <div
      class="dialogProgramSettings__setting"
      :data-test-locator="settingLocator"
      :data-test-setting-id="String(settingKey)"
      :data-test-tags="setting.tags"
    >
      <div class="row items-center no-wrap q-mb-xs">
        <div class="dialogProgramSettings__settingTitle">
          <span
            class="dialogProgramSettings__settingLabel text-grey-3 text-weight-regular text-body2"
            :data-test-locator="labelLocator"
          >{{ setting.title }}</span>
          <q-icon
            name="mdi-help-circle"
            size="16px"
            class="dialogProgramSettings__settingHelpIcon q-ml-md"
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
        class="dialogProgramSettings__settingNote text-caption q-mt-xs q-mb-none text-red-12"
        data-test-locator="dialogProgramSettings-settingNote"
      >
        {{ setting.note }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dialogProgramSettings__settingTitle {
  align-items: center;
  display: flex;
  font-weight: 500;
  justify-content: flex-start;
  margin-bottom: $dialogProgramSettings-settingTitle-marginBottom;
  margin-left: $dialogProgramSettings-settingTitle-marginLeft;
  margin-top: $dialogProgramSettings-settingTitle-marginTop;
  width: calc(100% - #{$dialogProgramSettings-settingTitle-widthSubtract});
}

.dialogProgramSettings__settingHelpIcon {
  align-self: flex-start;
  margin-top: $dialogProgramSettings-settingHelpIcon-marginTop;
}

.dialogProgramSettings__settingNote {
  margin-left: $dialogProgramSettings-settingTitle-marginLeft;
  text-shadow: $dialogProgramSettings-settingNote-textShadow;
}
</style>
