import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

function hasAnyLocaleStringTranslation (
  translations: I_faLocaleStringTranslations
): boolean {
  for (const value of Object.values(translations)) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return true
    }
  }
  return false
}

export function resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind (
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
): 'group' | 'template' | null {
  if (node.nodeKind === 'group' || node.nodeKind === 'template') {
    return node.nodeKind
  }
  return null
}

export function resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators (
  nodeKind: 'group' | 'template' | null
): {
    contextMenuTestLocator: string | undefined
    renameInputTestLocator: string | undefined
  } {
  if (nodeKind === 'group') {
    return {
      contextMenuTestLocator: 'dialogProjectSettings-worldTemplateLayoutGroupContextMenu',
      renameInputTestLocator: 'dialogProjectSettings-worldTemplateLayoutGroupRenameInput'
    }
  }
  if (nodeKind === 'template') {
    return {
      contextMenuTestLocator: 'dialogProjectSettings-worldTemplateLayoutTemplateContextMenu',
      renameInputTestLocator: 'dialogProjectSettings-worldTemplateLayoutTemplateRenameInput'
    }
  }
  return {
    contextMenuTestLocator: undefined,
    renameInputTestLocator: undefined
  }
}

export function resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage (params: {
  displayNameTranslations: I_faLocaleStringTranslations
  isGroupNameInvalid: (displayNameTranslations: I_faLocaleStringTranslations) => boolean
  nodeKind: 'group' | 'template' | null
  translateGroupNameErrorRequired: () => string
}): string | undefined {
  const {
    displayNameTranslations,
    isGroupNameInvalid,
    nodeKind,
    translateGroupNameErrorRequired
  } = params
  if (nodeKind === 'group') {
    return isGroupNameInvalid(displayNameTranslations) ? translateGroupNameErrorRequired() : undefined
  }
  return undefined
}

export function resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError (params: {
  displayNameTranslations: I_faLocaleStringTranslations
  isGroupNameInvalid: (displayNameTranslations: I_faLocaleStringTranslations) => boolean
  nodeKind: 'group' | 'template' | null
}): boolean {
  const {
    displayNameTranslations,
    isGroupNameInvalid,
    nodeKind
  } = params
  if (nodeKind === 'group') {
    return isGroupNameInvalid(displayNameTranslations)
  }
  return false
}

export function emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate (params: {
  displayNameTranslations?: I_faLocaleStringTranslations
  emitRenameGroup: (groupId: string, displayNameTranslations: I_faLocaleStringTranslations) => void
  emitRenamePlacementNickname: (
    placementId: string,
    nicknameTranslations: I_faLocaleSingularPluralTranslations
  ) => void
  nicknameTranslations?: I_faLocaleSingularPluralTranslations
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
}): void {
  const {
    displayNameTranslations,
    emitRenameGroup,
    emitRenamePlacementNickname,
    nicknameTranslations,
    node
  } = params
  if (node.nodeKind === 'group') {
    if (displayNameTranslations === undefined) {
      return
    }
    emitRenameGroup(node.id, displayNameTranslations)
    return
  }
  if (node.nodeKind !== 'template') {
    return
  }
  if (nicknameTranslations === undefined) {
    return
  }
  emitRenamePlacementNickname(node.id, nicknameTranslations)
}

export function isDialogProjectSettingsWorldTemplateLayoutGroupNameTranslationsInvalid (
  displayNameTranslations: I_faLocaleStringTranslations
): boolean {
  return !hasAnyLocaleStringTranslation(displayNameTranslations)
}
