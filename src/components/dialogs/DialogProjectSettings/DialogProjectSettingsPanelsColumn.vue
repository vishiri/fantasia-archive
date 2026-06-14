<template>
  <div class="dialogProjectSettings__tabPanelsHost q-pa-none">
    <q-tab-panels
      :model-value="props.selectedCategoryTab"
      animated
      transition-prev="slide-right"
      transition-next="slide-left"
      class="dialogProjectSettings__tabPanelsRoot q-pa-none"
    >
      <q-tab-panel
        :name="generalTabKey"
        class="dialogProjectSettings__tabPanel q-pa-none"
      >
        <div class="dialogProjectSettings__panelScroll hasScrollbar">
          <div class="dialogProjectSettings__panelScrollInner q-py-sm">
            <DialogProjectSettingsGeneralPanel
              :name-has-error="props.projectNameHasError"
              :project-name="props.projectName"
              @update:project-name="emit('update:projectName', $event)"
            />
          </div>
        </div>
      </q-tab-panel>
      <q-tab-panel
        :name="worldsTabKey"
        class="dialogProjectSettings__tabPanel q-pa-none"
      >
        <div class="dialogProjectSettings__panelScroll hasScrollbar">
          <div class="dialogProjectSettings__panelScrollInner q-py-sm">
            <DialogProjectSettingsWorldsPanel
              v-if="props.worlds !== null"
              :worlds="props.worlds"
              @add-world="emit('addWorld')"
              @remove-world="emit('removeWorld', $event)"
              @update:worlds="emit('update:worlds', $event)"
              @update-world-color="onUpdateWorldColor"
              @update-world-color-pallete="onUpdateWorldColorPallete"
              @update-world-display-name="onUpdateWorldDisplayName"
            />
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import DialogProjectSettingsGeneralPanel from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsGeneralPanel.vue'
import DialogProjectSettingsWorldsPanel from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsWorldsPanel.vue'
import {
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
  FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsDialogInput'

const props = defineProps<{
  projectName: string
  projectNameHasError: boolean
  selectedCategoryTab: string
  worlds: I_dialogProjectSettingsWorldDraft[] | null
}>()

const emit = defineEmits<{
  addWorld: []
  removeWorld: [id: string]
  'update:projectName': [value: string]
  'update:worlds': [worlds: I_dialogProjectSettingsWorldDraft[]]
  updateWorldColor: [id: string, color: string]
  updateWorldColorPallete: [id: string, colorPallete: string]
  updateWorldDisplayName: [id: string, displayName: string]
}>()

const generalTabKey = FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB
const worldsTabKey = FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB

function onUpdateWorldColor (id: string, color: string): void {
  emit('updateWorldColor', id, color)
}

function onUpdateWorldColorPallete (id: string, colorPallete: string): void {
  emit('updateWorldColorPallete', id, colorPallete)
}

function onUpdateWorldDisplayName (id: string, displayName: string): void {
  emit('updateWorldDisplayName', id, displayName)
}
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

.dialogProjectSettings__panelScrollInner {
  height: 100%;
  overflow: hidden;
}

.dialogProjectSettings__worldsPanel {
  height: 100%;
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
