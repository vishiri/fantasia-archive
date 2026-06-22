import { computed } from 'vue'
import type { ComputedRef, Ref, WritableComputedRef } from 'vue'

import {
  buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey
} from './dialogProjectSettingsWorldTemplateLayoutRenameMenuProvide'
import {
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage
} from './functions/dialogProjectSettingsWorldTemplateLayoutRenameMenuNodeHelpers'
import type { T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft } from 'app/types/T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState = {
  contextMenuTestLocator: ComputedRef<string | undefined>
  hasMenuPinnedAside: ComputedRef<boolean>
  renameHasError: ComputedRef<boolean>
  renameInputTestLocator: ComputedRef<string | undefined>
  renameMenuErrorMessage: ComputedRef<string | undefined>
  renameMenuOpen: WritableComputedRef<boolean>
  renameMenuTargetKey: ComputedRef<string | null>
  showTemplatePinnedAside: ComputedRef<boolean>
  supportsRenameMenu: ComputedRef<boolean>
  templateCanonicalName: ComputedRef<string>
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState (deps: {
  getNode: () => I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  isGroupNameInvalid: (displayNameTranslations: I_faLocaleStringTranslations) => boolean
  openRenameMenuTarget: Ref<string | null>
  renameTranslationsDraft: Ref<T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft>
  translateGroupNameErrorRequired: () => string
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState {
  const renameMenuTargetKey = computed(() => {
    const nodeKind = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind(deps.getNode())
    if (nodeKind === null) {
      return null
    }
    return buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey(
      nodeKind,
      deps.getNode().id
    )
  })

  const supportsRenameMenu = computed(() => renameMenuTargetKey.value !== null)

  const renameMenuOpen = computed({
    get (): boolean {
      if (renameMenuTargetKey.value === null) {
        return false
      }
      return deps.openRenameMenuTarget.value === renameMenuTargetKey.value
    },
    set (open: boolean): void {
      if (renameMenuTargetKey.value === null) {
        return
      }
      if (open) {
        deps.openRenameMenuTarget.value = renameMenuTargetKey.value
        return
      }
      if (deps.openRenameMenuTarget.value === renameMenuTargetKey.value) {
        deps.openRenameMenuTarget.value = null
      }
    }
  })

  const contextMenuTestLocator = computed(() => {
    const nodeKind = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind(deps.getNode())
    return resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators(nodeKind)
      .contextMenuTestLocator
  })

  const renameInputTestLocator = computed(() => {
    const nodeKind = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind(deps.getNode())
    return resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators(nodeKind)
      .renameInputTestLocator
  })

  const showTemplatePinnedAside = computed(() => {
    return resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind(deps.getNode()) === 'template'
  })

  const hasMenuPinnedAside = computed(() => showTemplatePinnedAside.value)

  const templateCanonicalName = computed(() => {
    if (!showTemplatePinnedAside.value) {
      return ''
    }
    return deps.getNode().templateDisplayName
  })

  const renameHasError = computed(() => {
    const nodeKind = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind(deps.getNode())
    const draft = deps.renameTranslationsDraft.value
    const displayNameTranslations = 'plural' in draft ? draft.plural : draft
    return resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError({
      displayNameTranslations,
      isGroupNameInvalid: deps.isGroupNameInvalid,
      nodeKind
    })
  })

  const renameMenuErrorMessage = computed(() => {
    const nodeKind = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind(deps.getNode())
    const draft = deps.renameTranslationsDraft.value
    const displayNameTranslations = 'plural' in draft ? draft.plural : draft
    return resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage({
      displayNameTranslations,
      isGroupNameInvalid: deps.isGroupNameInvalid,
      nodeKind,
      translateGroupNameErrorRequired: deps.translateGroupNameErrorRequired
    })
  })

  return {
    contextMenuTestLocator,
    hasMenuPinnedAside,
    renameHasError,
    renameInputTestLocator,
    renameMenuErrorMessage,
    renameMenuOpen,
    renameMenuTargetKey,
    showTemplatePinnedAside,
    supportsRenameMenu,
    templateCanonicalName
  }
}
