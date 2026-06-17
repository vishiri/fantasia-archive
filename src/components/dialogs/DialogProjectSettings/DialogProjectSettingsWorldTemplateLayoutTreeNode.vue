<template>
  <div
    ref="nodeAnchorRef"
    class="dialogProjectSettingsWorldTemplateLayoutTreeNode column q-hoverable relative-position"
    :class="nodeRootClassList"
    :data-test-locator="nodeTestLocator"
    :data-test-validation-error="rowHasValidationError ? 'true' : 'false'"
  >
    <div
      class="q-focus-helper"
      tabindex="-1"
    />
    <div class="dialogProjectSettingsWorldTemplateLayoutTreeNode__titleRow row items-center no-wrap">
      <q-icon
        class="dialogProjectSettingsWorldTemplateLayoutTreeNode__icon"
        :name="displayIconName"
      />
      <span class="dialogProjectSettingsWorldTemplateLayoutTreeNode__label col ellipsis">
        {{ props.node.label }}
      </span>
      <span
        v-if="props.node.nodeKind === 'template' && props.node.documentCountInWorld > 0"
        class="dialogProjectSettingsWorldTemplateLayoutTreeNode__count fa-text-muted q-mr-sm"
        :data-test-locator="`${nodeTestLocator}-count`"
      >
        ({{ props.node.documentCountInWorld }})
      </span>
      <q-btn
        v-if="props.node.nodeKind === 'template' || props.node.nodeKind === 'group'"
        class="dialogProjectSettingsWorldTemplateLayoutTreeNode__remove"
        color="negative"
        dense
        flat
        icon="mdi-close"
        round
        size="sm"
        :data-test-locator="`${nodeTestLocator}-remove`"
        @click.stop="onRemoveClick"
      />
    </div>
    <div
      v-if="props.node.worldAppendix.trim().length > 0"
      class="dialogProjectSettingsWorldTemplateLayoutTreeNode__affixRow row no-wrap"
    >
      <span
        aria-hidden="true"
        class="dialogProjectSettingsWorldTemplateLayoutTreeNode__affixIndent"
      />
      <span
        class="dialogProjectSettingsWorldTemplateLayoutTreeNode__appendix fa-text-muted text-caption col ellipsis"
      >
        ({{ props.node.worldAppendix.trim() }})
      </span>
    </div>
    <q-menu
      v-if="renameMenuWiring.supportsRenameMenu"
      v-model="renameMenuOpen"
      anchor="bottom left"
      class="dialogProjectSettingsWorldTemplateLayoutTreeNode__contextMenu"
      context-menu
      dark
      :data-test-locator="renameMenuWiring.contextMenuTestLocator"
      :offset="renameMenuWiring.menuOffset"
      no-refocus
      self="top left"
      square
      :target="nodeAnchorRef ?? undefined"
      transition-hide="fade"
      transition-show="fade"
      @before-show="renameMenuWiring.onRenameMenuBeforeShow"
      @hide="renameMenuWiring.onRenameMenuHide"
      @keydown.esc.stop="renameMenuWiring.closeRenameMenu"
    >
      <div
        class="dialogProjectSettingsWorldTemplateLayoutTreeNode__renameMenuBody"
        @keydown.enter.stop.prevent="renameMenuWiring.closeRenameMenu"
        @keydown.esc.stop="renameMenuWiring.closeRenameMenu"
      >
        <q-input
          ref="renameInputRef"
          v-model="renameDraft"
          autofocus
          color="primary-bright"
          dark
          dense
          filled
          :error="renameHasError"
          :error-message="renameMenuErrorMessage"
          :data-test-locator="renameMenuWiring.renameInputTestLocator"
          hide-bottom-space
          @keydown.enter.stop.prevent="renameMenuWiring.closeRenameMenu"
          @keydown.esc.stop="renameMenuWiring.closeRenameMenu"
          @update:model-value="renameMenuWiring.onRenameDraftUpdate"
        />
      </div>
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'
import {
  isDialogProjectSettingsDocumentTemplateNameInvalid,
  resolveDialogProjectSettingsDocumentTemplateDisplayIcon
} from './scripts/functions/dialogProjectSettingsDocumentTemplatesDraft'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring } from './scripts/dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring'
import { FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON } from 'app/types/I_faIconPickerInput'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

defineOptions({
  name: 'DialogProjectSettingsWorldTemplateLayoutTreeNode'
})

const props = defineProps<{
  blankGroupIds?: ReadonlySet<string>
  duplicateDocumentTemplateIds?: ReadonlySet<string>
  invalidDocumentTemplateIds?: ReadonlySet<string>
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
}>()

const emit = defineEmits<{
  deleteGroup: [groupId: string]
  removePlacement: [placementId: string]
  renameDocumentTemplate: [documentTemplateId: string, displayName: string]
  renameGroup: [groupId: string, displayName: string]
}>()

const nodeAnchorRef = ref<HTMLElement | null>(null)
const nodeRef = toRef(props, 'node')

const renameMenuWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring({
  emitRenameDocumentTemplate: (documentTemplateId, displayName) => {
    emit('renameDocumentTemplate', documentTemplateId, displayName)
  },
  emitRenameGroup: (groupId, displayName) => {
    emit('renameGroup', groupId, displayName)
  },
  getNode: () => nodeRef.value,
  isGroupNameInvalid: (displayName) => displayName.trim().length === 0,
  isTemplateNameInvalid: isDialogProjectSettingsDocumentTemplateNameInvalid,
  nodeAnchorRef,
  translateGroupNameErrorRequired: () => {
    return i18n.global.t('dialogs.projectSettings.fields.worldTemplateLayout.groupNameErrorRequired')
  },
  translateTemplateNameErrorRequired: () => {
    return i18n.global.t('dialogs.projectSettings.fields.documentTemplateName.errorRequired')
  }
})

const renameDraft = renameMenuWiring.renameDraft
const renameHasError = renameMenuWiring.renameHasError
const renameInputRef = renameMenuWiring.renameInputRef
const renameMenuErrorMessage = renameMenuWiring.renameMenuErrorMessage
const renameMenuOpen = renameMenuWiring.renameMenuOpen

const nodeTestLocator = computed(() => {
  const suffix = props.node.nodeKind === 'group' ? 'group' : 'template'
  return `dialogProjectSettings-worldTemplateLayoutTreeNode-${suffix}-${props.node.id}`
})

const displayIconName = computed(() => {
  if (props.node.nodeKind === 'group') {
    return props.node.icon
  }
  return resolveDialogProjectSettingsDocumentTemplateDisplayIcon(
    props.node.icon,
    FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON
  )
})

const rowHasValidationError = computed(() => {
  if (props.node.nodeKind === 'group') {
    return props.blankGroupIds?.has(props.node.id) ?? false
  }
  if (props.node.nodeKind !== 'template') {
    return false
  }
  const templateId = props.node.documentTemplateId
  if (templateId === null || templateId.length === 0) {
    return false
  }
  if (props.invalidDocumentTemplateIds?.has(templateId) ?? false) {
    return true
  }
  return props.duplicateDocumentTemplateIds?.has(templateId) ?? false
})

const nodeRootClassList = computed(() => {
  return {
    'dialogProjectSettingsWorldTemplateLayoutTreeNode--error': rowHasValidationError.value,
    'dialogProjectSettingsWorldTemplateLayoutTreeNode--group': props.node.nodeKind === 'group',
    'dialogProjectSettingsWorldTemplateLayoutTreeNode--template': props.node.nodeKind === 'template'
  }
})

function emitDeleteGroup (): void {
  emit('deleteGroup', props.node.id)
}

function onRemoveClick (): void {
  if (props.node.nodeKind === 'group') {
    emitDeleteGroup()
    return
  }
  emitRemovePlacement()
}

function emitRemovePlacement (): void {
  emit('removePlacement', props.node.id)
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.worldTemplateLayoutTreeNode.unscoped.scss"></style>
<style lang="scss" src="./styles/DialogProjectSettings.worldTemplateLayoutTreeNodeContextMenu.unscoped.scss"></style>
