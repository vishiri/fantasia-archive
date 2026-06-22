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
            @rename-placement-nickname="onRenamePlacementNickname"
            @rename-group="onRenameGroup"
            @update:template-layout="emitTemplateLayout"
          />
        </div>
        <div class="dialogProjectSettingsWorldTemplateLayoutPanel__addGroupRow faVerticalDraggableTabs__addButtonRow q-mt-sm">
          <q-btn
            outline
            class="faVerticalDraggableTabs__addButton"
            color="primary-bright"
            data-test-locator="dialogProjectSettings-worldTemplateLayoutAddGroup"
            :label="$t('dialogs.projectSettings.fields.worldTemplateLayout.addGroupButton')"
            @click="onAddGroup"
          />
        </div>
      </div>

      <q-separator
        class="dialogProjectSettingsWorldTemplateLayoutPanel__separator"
        vertical
      />

      <div class="dialogProjectSettingsWorldTemplateLayoutPanel__availableCol col">
        <div
          class="dialogProjectSettings__panelTitle dialogProjectSettingsWorldTemplateLayoutPanel__availableTitleRow"
        >
          <span
            class="dialogProjectSettings__fieldLabel fa-text-label text-body2"
            data-test-locator="dialogProjectSettings-worldAvailableTemplatesTitle"
          >
            {{ $t('dialogs.projectSettings.fields.worldTemplateLayout.availableTemplatesTitle') }}
          </span>
          <DialogProjectSettingsVerticalTabListFilterInput
            v-model="availableTemplatesFilterQuery"
          />
        </div>
        <DialogProjectSettingsWorldAvailableTemplatesList
          :current-language-code="props.currentLanguageCode"
          :show-filter-empty="showAvailableTemplatesFilterEmpty"
          :templates="filteredAvailableTemplates"
          @add-template="onAddTemplate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

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
  renameDialogProjectSettingsWorldTemplateGroupDraft,
  renameDialogProjectSettingsWorldTemplatePlacementNicknameDraft
} from './scripts/dialogProjectSettingsWorldTemplateLayoutDraft'
import {
  collectBlankTemplateGroupIdsInWorldTemplateLayout,
  collectDuplicateDocumentTemplateIdsInWorldTemplateLayout
} from './scripts/functions/dialogProjectSettingsWorldTemplateLayoutDuplicateValidation'
import {
  isDialogProjectSettingsDocumentTemplateNameInvalid,
  resolveDialogProjectSettingsDocumentTemplateResolvedTitle
} from './scripts/dialogProjectSettingsDocumentTemplatesDraft'
import { resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix } from './scripts/dialogProjectSettingsDocumentTemplateWorldAppendixDraft'
import { filterDialogProjectSettingsDocumentTemplatesByQuery } from './scripts/filterDialogProjectSettingsDocumentTemplatesByQuery'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import DialogProjectSettingsVerticalTabListFilterInput from './DialogProjectSettingsVerticalTabListFilterInput.vue'
import DialogProjectSettingsWorldAvailableTemplatesList from './DialogProjectSettingsWorldAvailableTemplatesList.vue'
import DialogProjectSettingsWorldTemplateLayoutTree from './DialogProjectSettingsWorldTemplateLayoutTree.vue'

defineOptions({
  name: 'DialogProjectSettingsWorldTemplateLayoutPanel'
})

const props = defineProps<{
  currentLanguageCode: T_faUserSettingsLanguageCode
  documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[]
  world: I_dialogProjectSettingsWorldDraft
}>()

const emit = defineEmits<{
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
    if (isDialogProjectSettingsDocumentTemplateNameInvalid(template.titleTranslations)) {
      invalid.add(template.id)
    }
  }
  return invalid
})

const availableTemplatesFilterQuery = ref('')

const availableTemplates = computed(() => {
  return props.documentTemplates.filter((template) => {
    return !assignedTemplateIds.value.has(template.id)
  })
})

const filteredAvailableTemplates = computed(() => {
  return filterDialogProjectSettingsDocumentTemplatesByQuery(
    availableTemplates.value,
    availableTemplatesFilterQuery.value,
    props.currentLanguageCode
  )
})

const showAvailableTemplatesFilterEmpty = computed(() => {
  return availableTemplatesFilterQuery.value.trim().length > 0 &&
    filteredAvailableTemplates.value.length === 0 &&
    availableTemplates.value.length > 0
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
      documentTemplateId: template.id,
      icon: template.icon,
      templateDisplayName: resolveDialogProjectSettingsDocumentTemplateResolvedTitle(
        template,
        props.currentLanguageCode
      ),
      worldAppendix: resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix(
        template,
        props.currentLanguageCode
      )
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

function onRenamePlacementNickname (placementId: string, nickname: string): void {
  const nextLayout = renameDialogProjectSettingsWorldTemplatePlacementNicknameDraft(
    props.world.templateLayout,
    placementId,
    nickname
  )
  emitTemplateLayout(nextLayout)
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
<style lang="scss" src="./styles/DialogProjectSettings.worldTemplateLayoutPanel.unscoped.scss"></style>
