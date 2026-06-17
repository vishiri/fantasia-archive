<template>
  <div
    class="dialogProjectSettingsWorldTemplateLayoutPanel dialogProjectSettings__field"
    data-test-locator="dialogProjectSettings-worldTemplateLayoutPanel"
  >
    <div class="dialogProjectSettingsWorldTemplateLayoutPanel__columns row no-wrap">
      <div class="dialogProjectSettingsWorldTemplateLayoutPanel__layoutCol col">
        <div class="dialogProjectSettings__panelTitle">
          <span
            class="dialogProjectSettings__fieldLabel fa-text-label text-body2"
            data-test-locator="dialogProjectSettings-worldTemplateLayoutTitle"
          >
            {{ $t('dialogs.projectSettings.fields.worldTemplateLayout.layoutTitle') }}
          </span>
        </div>
        <div class="dialogProjectSettingsWorldTemplateLayoutPanel__treeHost">
          <DialogProjectSettingsWorldTemplateLayoutTree
            :blank-group-ids="blankGroupIds"
            :duplicate-document-template-ids="duplicateDocumentTemplateIds"
            :invalid-document-template-ids="invalidDocumentTemplateIds"
            :template-layout="props.world.templateLayout"
            @delete-group="onDeleteGroup"
            @remove-placement="onRemovePlacement"
            @rename-document-template="onRenameDocumentTemplate"
            @rename-group="onRenameGroup"
            @update:template-layout="emitTemplateLayout"
          />
        </div>
        <q-btn
          class="dialogProjectSettingsWorldTemplateLayoutPanel__addGroup q-mt-sm"
          color="primary-bright"
          data-test-locator="dialogProjectSettings-worldTemplateLayoutAddGroup"
          flat
          :label="$t('dialogs.projectSettings.fields.worldTemplateLayout.addGroupButton')"
          @click="onAddGroup"
        />
      </div>

      <q-separator
        class="dialogProjectSettingsWorldTemplateLayoutPanel__separator"
        vertical
      />

      <div class="dialogProjectSettingsWorldTemplateLayoutPanel__availableCol col">
        <div class="dialogProjectSettings__panelTitle">
          <span
            class="dialogProjectSettings__fieldLabel fa-text-label text-body2"
            data-test-locator="dialogProjectSettings-worldAvailableTemplatesTitle"
          >
            {{ $t('dialogs.projectSettings.fields.worldTemplateLayout.availableTemplatesTitle') }}
          </span>
        </div>
        <DialogProjectSettingsWorldAvailableTemplatesList
          :templates="availableTemplates"
          @add-template="onAddTemplate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type {
  I_dialogProjectSettingsWorldDraft,
  I_dialogProjectSettingsWorldTemplateLayoutDraft
} from 'app/types/I_dialogProjectSettingsWorlds'
import {
  appendDialogProjectSettingsWorldTemplateGroupDraft,
  appendDialogProjectSettingsWorldTemplatePlacementDraft,
  removeDialogProjectSettingsWorldTemplateGroupDraft,
  removeDialogProjectSettingsWorldTemplatePlacementDraft,
  renameDialogProjectSettingsWorldTemplateGroupDraft
} from './scripts/dialogProjectSettingsWorldTemplateLayoutDraft'
import {
  collectBlankTemplateGroupIdsInWorldTemplateLayout,
  collectDuplicateDocumentTemplateIdsInWorldTemplateLayout
} from './scripts/functions/dialogProjectSettingsWorldTemplateLayoutDuplicateValidation'
import {
  isDialogProjectSettingsDocumentTemplateNameInvalid
} from './scripts/functions/dialogProjectSettingsDocumentTemplatesDraft'
import DialogProjectSettingsWorldAvailableTemplatesList from './DialogProjectSettingsWorldAvailableTemplatesList.vue'
import DialogProjectSettingsWorldTemplateLayoutTree from './DialogProjectSettingsWorldTemplateLayoutTree.vue'

defineOptions({
  name: 'DialogProjectSettingsWorldTemplateLayoutPanel'
})

const props = defineProps<{
  documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[]
  world: I_dialogProjectSettingsWorldDraft
}>()

const emit = defineEmits<{
  updateDocumentTemplateDisplayName: [documentTemplateId: string, displayName: string]
  'update:templateLayout': [layout: I_dialogProjectSettingsWorldTemplateLayoutDraft]
}>()

const defaultNewGroupName = i18n.global.t(
  'dialogs.projectSettings.fields.worldTemplateLayout.defaultNewGroupName'
)

const assignedTemplateIds = computed(() => {
  return new Set(props.world.templateLayout.placements.map((placement) => {
    return placement.documentTemplateId
  }))
})

const duplicateDocumentTemplateIds = computed(() => {
  return collectDuplicateDocumentTemplateIdsInWorldTemplateLayout(props.world.templateLayout)
})

const blankGroupIds = computed(() => {
  return collectBlankTemplateGroupIdsInWorldTemplateLayout(props.world.templateLayout)
})

const invalidDocumentTemplateIds = computed(() => {
  const invalid = new Set<string>()
  for (const template of props.documentTemplates) {
    if (isDialogProjectSettingsDocumentTemplateNameInvalid(template.displayName)) {
      invalid.add(template.id)
    }
  }
  return invalid
})

const availableTemplates = computed(() => {
  return props.documentTemplates.filter((template) => {
    return !assignedTemplateIds.value.has(template.id)
  })
})

function emitTemplateLayout (layout: I_dialogProjectSettingsWorldTemplateLayoutDraft): void {
  emit('update:templateLayout', layout)
}

function onAddGroup (): void {
  const nextLayout = appendDialogProjectSettingsWorldTemplateGroupDraft(
    props.world.templateLayout,
    defaultNewGroupName
  )
  emitTemplateLayout(nextLayout)
}

function onAddTemplate (templateId: string): void {
  const template = props.documentTemplates.find((row) => row.id === templateId)
  if (template === undefined) {
    return
  }
  const nextLayout = appendDialogProjectSettingsWorldTemplatePlacementDraft(
    props.world.templateLayout,
    {
      displayName: template.displayName,
      documentTemplateId: template.id,
      icon: template.icon,
      worldAppendix: template.worldAppendix
    }
  )
  emitTemplateLayout(nextLayout)
}

function onDeleteGroup (groupId: string): void {
  const nextLayout = removeDialogProjectSettingsWorldTemplateGroupDraft(
    props.world.templateLayout,
    groupId
  )
  emitTemplateLayout(nextLayout)
}

function onRenameGroup (groupId: string, displayName: string): void {
  const nextLayout = renameDialogProjectSettingsWorldTemplateGroupDraft(
    props.world.templateLayout,
    groupId,
    displayName
  )
  emitTemplateLayout(nextLayout)
}

function onRenameDocumentTemplate (documentTemplateId: string, displayName: string): void {
  emit('updateDocumentTemplateDisplayName', documentTemplateId, displayName)
}

function onRemovePlacement (placementId: string): void {
  const nextLayout = removeDialogProjectSettingsWorldTemplatePlacementDraft(
    props.world.templateLayout,
    placementId
  )
  emitTemplateLayout(nextLayout)
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.panelTitle.unscoped.scss"></style>

<style lang="scss" scoped>
.dialogProjectSettingsWorldTemplateLayoutPanel {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  margin-top: $dialogProjectSettings-worldTemplateLayout-sectionMarginTop;
  min-height: 0;
  width: 100%;
}

.dialogProjectSettingsWorldTemplateLayoutPanel__columns {
  flex: 1 1 auto;
  gap: $dialogProjectSettings-worldTemplateLayout-columnsGap;
  min-height: 0;
  min-width: 0;
}

.dialogProjectSettingsWorldTemplateLayoutPanel__layoutCol {
  padding-right: $dialogProjectSettings-worldTemplateLayout-layoutCol-paddingRight;
}

.dialogProjectSettingsWorldTemplateLayoutPanel__layoutCol,
.dialogProjectSettingsWorldTemplateLayoutPanel__availableCol {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.dialogProjectSettingsWorldTemplateLayoutPanel__separator {
  align-self: stretch;
  margin:
    0
    $dialogProjectSettings-worldTemplateLayout-separatorMarginRight
    0
    $dialogProjectSettings-worldTemplateLayout-separatorMarginLeft;
}

.dialogProjectSettingsWorldTemplateLayoutPanel__treeHost {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.dialogProjectSettingsWorldTemplateLayoutPanel :deep(.dialogProjectSettings__panelTitle) {
  margin-top: 0;
}

.dialogProjectSettingsWorldTemplateLayoutPanel__availableCol :deep(.dialogProjectSettings__panelTitle) {
  padding-left: $dialogProjectSettings-worldTemplateLayout-availableCol-paddingInline;
  padding-right: $dialogProjectSettings-worldTemplateLayout-availableCol-paddingInline;
}

.dialogProjectSettingsWorldTemplateLayoutPanel__addGroup {
  flex-shrink: 0;
}
</style>
