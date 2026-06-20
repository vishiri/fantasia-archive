import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

export function resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind (
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
): 'group' | 'template' | null {
  if (node.nodeKind === 'group' || node.nodeKind === 'template') {
    return node.nodeKind
  }
  return null
}

export function resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftSeed (
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
): string {
  const nodeKind = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind(node)
  if (nodeKind === 'template') {
    return node.nickname
  }
  return node.label
}

export function resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators (
  nodeKind: 'group' | 'template' | null
): {
    canonicalNameTestLocator: string | undefined
    contextMenuTestLocator: string | undefined
    renameInputTestLocator: string | undefined
  } {
  if (nodeKind === 'group') {
    return {
      canonicalNameTestLocator: undefined,
      contextMenuTestLocator: 'dialogProjectSettings-worldTemplateLayoutGroupContextMenu',
      renameInputTestLocator: 'dialogProjectSettings-worldTemplateLayoutGroupRenameInput'
    }
  }
  if (nodeKind === 'template') {
    return {
      canonicalNameTestLocator: 'dialogProjectSettings-worldTemplateLayoutTemplateCanonicalName',
      contextMenuTestLocator: 'dialogProjectSettings-worldTemplateLayoutTemplateContextMenu',
      renameInputTestLocator: 'dialogProjectSettings-worldTemplateLayoutTemplateRenameInput'
    }
  }
  return {
    canonicalNameTestLocator: undefined,
    contextMenuTestLocator: undefined,
    renameInputTestLocator: undefined
  }
}

export function resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage (params: {
  displayName: string
  isGroupNameInvalid: (displayName: string) => boolean
  nodeKind: 'group' | 'template' | null
  translateGroupNameErrorRequired: () => string
}): string | undefined {
  const {
    displayName,
    isGroupNameInvalid,
    nodeKind,
    translateGroupNameErrorRequired
  } = params
  if (nodeKind === 'group') {
    return isGroupNameInvalid(displayName) ? translateGroupNameErrorRequired() : undefined
  }
  return undefined
}

export function resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError (params: {
  displayName: string
  isGroupNameInvalid: (displayName: string) => boolean
  nodeKind: 'group' | 'template' | null
}): boolean {
  const {
    displayName,
    isGroupNameInvalid,
    nodeKind
  } = params
  if (nodeKind === 'group') {
    return isGroupNameInvalid(displayName)
  }
  return false
}

export function emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate (params: {
  displayName: string
  emitRenameGroup: (groupId: string, displayName: string) => void
  emitRenamePlacementNickname: (placementId: string, nickname: string) => void
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
}): void {
  const {
    displayName,
    emitRenameGroup,
    emitRenamePlacementNickname,
    node
  } = params
  if (node.nodeKind === 'group') {
    emitRenameGroup(node.id, displayName)
    return
  }
  if (node.nodeKind !== 'template') {
    return
  }
  emitRenamePlacementNickname(node.id, displayName)
}
