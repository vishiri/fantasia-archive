import { inject, ref } from 'vue'
import type { Ref } from 'vue'

import {
  createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState
} from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring'
import { wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchWiring'
import { dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey } from './dialogProjectSettingsWorldTemplateLayoutRenameMenuProvide'
import {
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsDraftSeed
} from './dialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsWiring'
import type { T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft } from 'app/types/T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuSessionWiring (deps: {
  emitRenameGroup: (groupId: string, displayNameTranslations: I_faLocaleStringTranslations) => void
  emitRenamePlacementNickname: (
    placementId: string,
    nicknameTranslations: I_faLocaleSingularPluralTranslations
  ) => void
  getNode: () => I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  isGroupNameInvalid: (displayNameTranslations: I_faLocaleStringTranslations) => boolean
  nodeAnchorRef: Ref<HTMLElement | null>
  translateGroupNameErrorRequired: () => string
}): {
    computedState: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState>
    handlersWiring: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring>
    menuStyleWiring: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring>
    renameTranslationsDraft: Ref<T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft>
  } {
  const renameTranslationsDraft = ref<T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft>({})

  const openRenameMenuTarget = inject(
    dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey,
    () => ref<string | null>(null),
    true
  )

  const computedState = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState({
    getNode: deps.getNode,
    isGroupNameInvalid: deps.isGroupNameInvalid,
    openRenameMenuTarget,
    renameTranslationsDraft,
    translateGroupNameErrorRequired: deps.translateGroupNameErrorRequired
  })

  const menuStyleWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring({
    getHasMenuPinnedAside: () => computedState.hasMenuPinnedAside.value,
    getUsesSingularPluralRenameMenu: () => deps.getNode().nodeKind === 'template',
    nodeAnchorRef: deps.nodeAnchorRef
  })

  const handlersWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring({
    emitRenameGroup: deps.emitRenameGroup,
    emitRenamePlacementNickname: deps.emitRenamePlacementNickname,
    getNode: deps.getNode,
    getRenameMenuTargetKey: () => computedState.renameMenuTargetKey.value,
    nodeAnchorRef: deps.nodeAnchorRef,
    openRenameMenuTarget,
    renameTranslationsDraft,
    setRenameMenuOpen: (open) => {
      computedState.renameMenuOpen.value = open
    },
    syncRenameMenuMaxWidth: menuStyleWiring.syncRenameMenuMaxWidth
  })

  wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers({
    getRenameTranslationsDraftSeed: () => {
      return resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsDraftSeed(deps.getNode())
    },
    renameMenuOpen: computedState.renameMenuOpen,
    renameTranslationsDraft
  })

  return {
    computedState,
    handlersWiring,
    menuStyleWiring,
    renameTranslationsDraft
  }
}
