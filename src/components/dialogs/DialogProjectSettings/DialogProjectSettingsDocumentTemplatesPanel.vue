<template>
  <div class="dialogProjectSettings__documentTemplatesPanel row no-wrap">
    <DialogProjectSettingsDocumentTemplatesEmptyState
      v-if="props.templates.length === 0"
      class="dialogProjectSettings__documentTemplatesPanelEmpty col"
      @add-template="emit('addTemplate')"
    />

    <template v-else>
      <DialogProjectSettingsDocumentTemplatesTabList
        :selected-template-id="selectedTemplateId"
        :tab-list-width-px="FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB_LIST_WIDTH_PX"
        :templates="props.templates"
        @add-template="emit('addTemplate')"
        @select="onSelectTemplate"
        @update:templates="emit('update:templates', $event)"
      />

      <q-separator vertical />

      <div class="dialogProjectSettings__documentTemplatesDetailHost col">
        <DialogProjectSettingsDocumentTemplatesDetailPanel
          v-if="selectedTemplate !== null"
          :name-has-error="isTemplateNameInvalid(selectedTemplate.displayName)"
          :remove-disabled="isTemplateRemoveDisabled(selectedTemplate)"
          :template="selectedTemplate"
          @remove="emitRemove(selectedTemplate.id)"
          @update:display-name="emitUpdateDisplayName(selectedTemplate.id, $event)"
          @update:icon="emitUpdateIcon(selectedTemplate.id, $event)"
          @update:world-appendix="emitUpdateWorldAppendix(selectedTemplate.id, $event)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import {
  isDialogProjectSettingsDocumentTemplateNameInvalid,
  isDialogProjectSettingsDocumentTemplateRemoveDisabled
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsDocumentTemplatesDraft'
import { resolveDialogProjectSettingsDocumentTemplatesPanelSelection } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsDocumentTemplatesSelection'
import { FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB_LIST_WIDTH_PX } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsDialogInput'
import DialogProjectSettingsDocumentTemplatesDetailPanel from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsDocumentTemplatesDetailPanel.vue'
import DialogProjectSettingsDocumentTemplatesEmptyState from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsDocumentTemplatesEmptyState.vue'
import DialogProjectSettingsDocumentTemplatesTabList from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsDocumentTemplatesTabList.vue'

defineOptions({
  name: 'DialogProjectSettingsDocumentTemplatesPanel'
})

const props = defineProps<{
  templates: I_dialogProjectSettingsDocumentTemplateDraft[]
}>()

const emit = defineEmits<{
  addTemplate: []
  removeTemplate: [id: string]
  'update:templates': [templates: I_dialogProjectSettingsDocumentTemplateDraft[]]
  updateTemplateDisplayName: [id: string, displayName: string]
  updateTemplateIcon: [id: string, icon: string]
  updateTemplateWorldAppendix: [id: string, worldAppendix: string]
}>()

const selectedTemplateId = ref<string | null>(null)
const previousTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[]>([])

const selectedTemplate = computed(() => {
  if (selectedTemplateId.value === null) {
    return null
  }
  return props.templates.find((template) => template.id === selectedTemplateId.value) ?? null
})

watch(() => props.templates, (nextTemplates) => {
  selectedTemplateId.value = resolveDialogProjectSettingsDocumentTemplatesPanelSelection(
    nextTemplates,
    previousTemplates.value,
    selectedTemplateId.value
  )
  previousTemplates.value = nextTemplates.map((template) => ({ ...template }))
}, {
  immediate: true
})

function isTemplateNameInvalid (displayName: string): boolean {
  return isDialogProjectSettingsDocumentTemplateNameInvalid(displayName)
}

function isTemplateRemoveDisabled (
  template: I_dialogProjectSettingsDocumentTemplateDraft
): boolean {
  return isDialogProjectSettingsDocumentTemplateRemoveDisabled(template)
}

function onSelectTemplate (id: string): void {
  selectedTemplateId.value = id
}

function emitRemove (id: string): void {
  emit('removeTemplate', id)
}

function emitUpdateDisplayName (id: string, displayName: string): void {
  emit('updateTemplateDisplayName', id, displayName)
}

function emitUpdateWorldAppendix (id: string, worldAppendix: string): void {
  emit('updateTemplateWorldAppendix', id, worldAppendix)
}

function emitUpdateIcon (id: string, icon: string): void {
  emit('updateTemplateIcon', id, icon)
}
</script>

<style lang="scss" scoped>
.dialogProjectSettings__documentTemplatesPanel {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}

.dialogProjectSettings__documentTemplatesPanelEmpty {
  min-height: 0;
  min-width: 0;
}

.dialogProjectSettings__documentTemplatesDetailHost {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden auto;
}
</style>
