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
              :current-language-code="props.currentLanguageCode"
              :document-templates="props.documentTemplates"
              :worlds="props.worlds"
              @add-world="emit('addWorld')"
              @remove-world="emit('removeWorld', $event)"
              @update:worlds="emit('update:worlds', $event)"
              @update-world-color="onUpdateWorldColor"
              @update-world-color-pallete="onUpdateWorldColorPallete"
              @update-world-display-name-translations="onUpdateWorldDisplayNameTranslations"
              @update-document-template-title-translations="onUpdateDocumentTemplateTitleTranslations"
              @update-world-template-layout="onUpdateWorldTemplateLayout"
            />
          </div>
        </div>
      </q-tab-panel>
      <q-tab-panel
        :name="documentTemplatesTabKey"
        class="dialogProjectSettings__tabPanel q-pa-none"
      >
        <div class="dialogProjectSettings__panelScroll hasScrollbar">
          <div class="dialogProjectSettings__panelScrollInner q-py-sm">
            <DialogProjectSettingsDocumentTemplatesPanel
              v-if="props.documentTemplates !== null"
              :current-language-code="props.currentLanguageCode"
              :templates="props.documentTemplates"
              @add-template="emit('addDocumentTemplate')"
              @remove-template="emit('removeDocumentTemplate', $event)"
              @update:templates="emit('update:documentTemplates', $event)"
              @update-template-title-translations="onUpdateDocumentTemplateTitleTranslations"
              @update-template-icon="onUpdateDocumentTemplateIcon"
              @update-template-world-appendix-translations="onUpdateDocumentTemplateWorldAppendixTranslations"
            />
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsWorldTemplateLayoutDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faProjectDocumentTemplateWorldAppendixTranslations } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import DialogProjectSettingsDocumentTemplatesPanel from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsDocumentTemplatesPanel.vue'
import DialogProjectSettingsGeneralPanel from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsGeneralPanel.vue'
import DialogProjectSettingsWorldsPanel from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsWorldsPanel.vue'
import {
  FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB,
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
  FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsDialogInput'

const props = defineProps<{
  currentLanguageCode: T_faUserSettingsLanguageCode
  documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
  projectName: string
  projectNameHasError: boolean
  selectedCategoryTab: string
  worlds: I_dialogProjectSettingsWorldDraft[] | null
}>()

const emit = defineEmits<{
  addDocumentTemplate: []
  addWorld: []
  removeDocumentTemplate: [id: string]
  removeWorld: [id: string]
  'update:documentTemplates': [templates: I_dialogProjectSettingsDocumentTemplateDraft[]]
  'update:projectName': [value: string]
  'update:worlds': [worlds: I_dialogProjectSettingsWorldDraft[]]
  updateDocumentTemplateIcon: [id: string, icon: string]
  updateDocumentTemplateTitleTranslations: [
    id: string,
    titleTranslations: I_faLocaleSingularPluralTranslations
  ]
  updateDocumentTemplateWorldAppendixTranslations: [
    id: string,
    worldAppendixTranslations: I_faProjectDocumentTemplateWorldAppendixTranslations
  ]
  updateWorldColor: [id: string, color: string]
  updateWorldColorPallete: [id: string, colorPallete: string]
  updateWorldDisplayNameTranslations: [id: string, displayNameTranslations: I_faProjectWorldDisplayNameTranslations]
  updateWorldTemplateLayout: [id: string, layout: I_dialogProjectSettingsWorldTemplateLayoutDraft]
}>()

const generalTabKey = FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB
const worldsTabKey = FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB
const documentTemplatesTabKey = FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB

function onUpdateWorldColor (id: string, color: string): void {
  emit('updateWorldColor', id, color)
}

function onUpdateWorldColorPallete (id: string, colorPallete: string): void {
  emit('updateWorldColorPallete', id, colorPallete)
}

function onUpdateWorldDisplayNameTranslations (
  id: string,
  displayNameTranslations: I_faProjectWorldDisplayNameTranslations
): void {
  emit('updateWorldDisplayNameTranslations', id, displayNameTranslations)
}

function onUpdateWorldTemplateLayout (
  id: string,
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): void {
  emit('updateWorldTemplateLayout', id, layout)
}

function onUpdateDocumentTemplateTitleTranslations (
  id: string,
  titleTranslations: I_faLocaleSingularPluralTranslations
): void {
  emit('updateDocumentTemplateTitleTranslations', id, titleTranslations)
}

function onUpdateDocumentTemplateIcon (id: string, icon: string): void {
  emit('updateDocumentTemplateIcon', id, icon)
}

function onUpdateDocumentTemplateWorldAppendixTranslations (
  id: string,
  worldAppendixTranslations: I_faProjectDocumentTemplateWorldAppendixTranslations
): void {
  emit('updateDocumentTemplateWorldAppendixTranslations', id, worldAppendixTranslations)
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

  :deep(.q-panel) {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
  }
}

.dialogProjectSettings__tabPanel {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  max-height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  padding: 0;
}

.dialogProjectSettings__panelScroll {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.dialogProjectSettings__panelScrollInner {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}
</style>
