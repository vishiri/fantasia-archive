import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

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
  displayName: string
  isGroupNameInvalid: (displayName: string) => boolean
  isTemplateNameInvalid: (displayName: string) => boolean
  nodeKind: 'group' | 'template' | null
  translateGroupNameErrorRequired: () => string
  translateTemplateNameErrorRequired: () => string
}): string | undefined {
  const {
    displayName,
    isGroupNameInvalid,
    isTemplateNameInvalid,
    nodeKind,
    translateGroupNameErrorRequired,
    translateTemplateNameErrorRequired
  } = params
  if (nodeKind === 'group') {
    return isGroupNameInvalid(displayName) ? translateGroupNameErrorRequired() : undefined
  }
  if (nodeKind === 'template') {
    return isTemplateNameInvalid(displayName) ? translateTemplateNameErrorRequired() : undefined
  }
  return undefined
}

export function resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError (params: {
  displayName: string
  isGroupNameInvalid: (displayName: string) => boolean
  isTemplateNameInvalid: (displayName: string) => boolean
  nodeKind: 'group' | 'template' | null
}): boolean {
  const {
    displayName,
    isGroupNameInvalid,
    isTemplateNameInvalid,
    nodeKind
  } = params
  if (nodeKind === 'group') {
    return isGroupNameInvalid(displayName)
  }
  if (nodeKind === 'template') {
    return isTemplateNameInvalid(displayName)
  }
  return false
}

export function emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate (params: {
  displayName: string
  emitRenameDocumentTemplate: (documentTemplateId: string, displayName: string) => void
  emitRenameGroup: (groupId: string, displayName: string) => void
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
}): void {
  const {
    displayName,
    emitRenameDocumentTemplate,
    emitRenameGroup,
    node
  } = params
  if (node.nodeKind === 'group') {
    emitRenameGroup(node.id, displayName)
    return
  }
  if (node.nodeKind !== 'template') {
    return
  }
  const documentTemplateId = node.documentTemplateId
  if (documentTemplateId === null || documentTemplateId.length === 0) {
    return
  }
  emitRenameDocumentTemplate(documentTemplateId, displayName)
}
