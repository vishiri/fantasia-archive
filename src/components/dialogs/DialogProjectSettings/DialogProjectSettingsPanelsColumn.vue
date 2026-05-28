<template>
  <q-separator vertical />

  <div class="dialogProjectSettings__tabPanelsHost col q-pa-none">
    <q-tab-panels
      :model-value="props.selectedCategoryTab"
      animated
      vertical
      transition-prev="jump-up"
      transition-next="jump-down"
      class="dialogProjectSettings__tabPanelsRoot q-pa-none"
    >
      <q-tab-panel
        :name="generalTabKey"
        class="dialogProjectSettings__tabPanel q-pa-none"
      >
        <div class="dialogProjectSettings__panelScroll hasScrollbar">
          <div class="dialogProjectSettings__panelScrollInner q-py-sm">
            <DialogProjectSettingsGeneralPanel
              :project-name="props.projectName"
              @update:project-name="emit('update:projectName', $event)"
            />
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import DialogProjectSettingsGeneralPanel from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsGeneralPanel.vue'
import { FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB } from 'app/src/components/dialogs/DialogProjectSettings/scripts/dialogProjectSettingsConstants'

const props = defineProps<{
  projectName: string
  selectedCategoryTab: string
}>()

const emit = defineEmits<{
  'update:projectName': [value: string]
}>()

const generalTabKey = FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB
</script>

<style lang="scss" scoped>
.dialogProjectSettings__tabPanelsHost {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  position: relative;
}

.dialogProjectSettings__tabPanelsRoot {
  background: transparent;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.dialogProjectSettings__tabPanel {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  max-height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 0;
}

.dialogProjectSettings__panelScroll {
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  overflow: hidden auto;
}
</style>
