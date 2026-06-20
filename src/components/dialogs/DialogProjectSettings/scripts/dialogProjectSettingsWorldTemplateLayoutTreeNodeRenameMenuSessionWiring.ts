import { inject, ref } from 'vue'
import type { Ref } from 'vue'
import type { QInput } from 'quasar'

import {
  createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState
} from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring'
import { wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchWiring'
import { dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey } from './dialogProjectSettingsWorldTemplateLayoutRenameMenuProvide'
import {
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftSeed
} from './functions/dialogProjectSettingsWorldTemplateLayoutRenameMenuNodeHelpers'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuSessionWiring (deps: {
  emitRenameGroup: (groupId: string, displayName: string) => void
  emitRenamePlacementNickname: (placementId: string, nickname: string) => void
  getNode: () => I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  isGroupNameInvalid: (displayName: string) => boolean
  nodeAnchorRef: Ref<HTMLElement | null>
  translateGroupNameErrorRequired: () => string
}): {
    computedState: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState>
    handlersWiring: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring>
    menuStyleWiring: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring>
    renameDraft: Ref<string>
    renameInputRef: Ref<QInput | null>
  } {
  const renameDraft = ref('')
  const renameInputRef = ref<QInput | null>(null)

  const openRenameMenuTarget = inject(
    dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey,
    () => ref<string | null>(null),
    true
  )

  const computedState = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState({
    getNode: deps.getNode,
    isGroupNameInvalid: deps.isGroupNameInvalid,
    openRenameMenuTarget,
    renameDraft,
    translateGroupNameErrorRequired: deps.translateGroupNameErrorRequired
  })

  const menuStyleWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring({
    nodeAnchorRef: deps.nodeAnchorRef
  })

  const handlersWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring({
    emitRenameGroup: deps.emitRenameGroup,
    emitRenamePlacementNickname: deps.emitRenamePlacementNickname,
    getNode: deps.getNode,
    getRenameMenuTargetKey: () => computedState.renameMenuTargetKey.value,
    nodeAnchorRef: deps.nodeAnchorRef,
    openRenameMenuTarget,
    renameDraft,
    renameInputRef,
    setRenameMenuOpen: (open) => {
      computedState.renameMenuOpen.value = open
    },
    syncRenameMenuMaxWidth: menuStyleWiring.syncRenameMenuMaxWidth
  })

  wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers({
    getRenameDraftSeed: () => resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftSeed(deps.getNode()),
    renameDraft,
    renameInputRef,
    renameMenuOpen: computedState.renameMenuOpen
  })

  return {
    computedState,
    handlersWiring,
    menuStyleWiring,
    renameDraft,
    renameInputRef
  }
}
