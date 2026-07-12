import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

export function resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeTestLocator (
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
): string {
  const suffix = node.nodeKind === 'group' ? 'group' : 'template'
  return `dialogProjectSettings-worldTemplateLayoutTreeNode-${suffix}-${node.id}`
}

export function resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeDisplayIcon (params: {
  emptyPlaceholderIcon: string
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  resolveDocumentTemplateDisplayIcon: (icon: string, emptyPlaceholderIcon: string) => string
}): string {
  if (params.node.nodeKind === 'group') {
    return params.node.icon
  }
  return params.resolveDocumentTemplateDisplayIcon(
    params.node.icon,
    params.emptyPlaceholderIcon
  )
}

export function resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeHasValidationError (params: {
  blankGroupIds?: ReadonlySet<string>
  duplicateDocumentTemplateIds?: ReadonlySet<string>
  invalidDocumentTemplateIds?: ReadonlySet<string>
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
}): boolean {
  const { blankGroupIds, duplicateDocumentTemplateIds, invalidDocumentTemplateIds, node } = params
  if (node.nodeKind === 'group') {
    return blankGroupIds?.has(node.id) ?? false
  }
  if (node.nodeKind !== 'template') {
    return false
  }
  const templateId = node.documentTemplateId
  if (templateId === null || templateId.length === 0) {
    return false
  }
  if (invalidDocumentTemplateIds?.has(templateId) ?? false) {
    return true
  }
  return duplicateDocumentTemplateIds?.has(templateId) ?? false
}

export function resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRootClassList (params: {
  nodeKind: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode['nodeKind']
  rowHasValidationError: boolean
}): Record<string, boolean> {
  return {
    'dialogProjectSettingsWorldTemplateLayoutTreeNode--error': params.rowHasValidationError,
    'dialogProjectSettingsWorldTemplateLayoutTreeNode--group': params.nodeKind === 'group',
    'dialogProjectSettingsWorldTemplateLayoutTreeNode--template': params.nodeKind === 'template'
  }
}

export function resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeEditTooltipI18nKey (
  nodeKind: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode['nodeKind']
): string {
  if (nodeKind === 'group') {
    return 'dialogs.projectSettings.fields.worldTemplateLayout.editGroupTooltip'
  }
  return 'dialogs.projectSettings.fields.worldTemplateLayout.editTemplateTooltip'
}

export function isDialogProjectSettingsWorldTemplateLayoutPlacementRemoveDisabled (
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
): boolean {
  return node.nodeKind === 'template' && node.documentCountInWorld > 0
}

export function resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRemoveTooltipI18nKey (
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
): string {
  if (node.nodeKind === 'group') {
    return 'dialogs.projectSettings.fields.worldTemplateLayout.removeGroupTooltip'
  }
  if (isDialogProjectSettingsWorldTemplateLayoutPlacementRemoveDisabled(node)) {
    return 'dialogs.projectSettings.fields.worldTemplateLayout.removeTemplateDisabledHasDocuments'
  }
  return 'dialogs.projectSettings.fields.worldTemplateLayout.removeTemplateTooltip'
}

export function resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeShowsPlacementNicknameHoverTooltip (
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
): boolean {
  return node.nodeKind === 'template' && node.usesNickname
}

export function resolveDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameHoverTooltipLines (params: {
  nicknameLabel: string
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  originalNameLabel: string
  resolvedNickname: string
}): { nicknameLine: string, originalNameLine: string } | null {
  if (!resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeShowsPlacementNicknameHoverTooltip(params.node)) {
    return null
  }
  const nickname = params.resolvedNickname.trim()
  const originalName = params.node.templateDisplayName
  const nicknameLine = `${params.nicknameLabel} - ${nickname}`
  const originalNameLine = `${params.originalNameLabel} - ${originalName}`
  return {
    nicknameLine,
    originalNameLine
  }
}
