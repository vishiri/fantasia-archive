import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

type T_hideTreeIconSettingKey =
  | 'hideTreeIconAddUnder'
  | 'hideTreeIconEdit'
  | 'hideTreeIconView'

type T_hideTreeIconDefaults = Pick<I_faUserSettings, T_hideTreeIconSettingKey>

function resolveEffectiveHideTreeIconSetting (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  settingKey: T_hideTreeIconSettingKey,
  defaults: T_hideTreeIconDefaults
): boolean {
  const previewValue = preview?.[settingKey]
  if (previewValue !== undefined) {
    return previewValue
  }
  if (settings !== null) {
    return settings[settingKey]
  }
  return defaults[settingKey]
}

export function resolveProjectHierarchyTreeDocumentButtonVisibility (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_hideTreeIconDefaults
): {
    showsAddUnder: boolean
    showsEdit: boolean
    showsOpen: boolean
  } {
  const showsOpen = !resolveEffectiveHideTreeIconSetting(settings, preview, 'hideTreeIconView', defaults)
  const showsEdit = !resolveEffectiveHideTreeIconSetting(settings, preview, 'hideTreeIconEdit', defaults)
  const showsAddUnder = !resolveEffectiveHideTreeIconSetting(settings, preview, 'hideTreeIconAddUnder', defaults)

  return {
    showsAddUnder,
    showsEdit,
    showsOpen
  }
}

export function resolveProjectHierarchyTreeDocumentButtonVisibilityForNode (
  node: Pick<I_faProjectHierarchyTreeHeTreeNode, 'documentId' | 'nodeKind' | 'tagId'>,
  visibility: {
    showsAddUnder: boolean
    showsEdit: boolean
    showsOpen: boolean
  }
): {
    showsAddUnder: boolean
    showsEdit: boolean
    showsOpen: boolean
  } {
  const underTag = typeof node.tagId === 'string' && node.tagId.length > 0
  return {
    showsAddUnder: underTag ? false : visibility.showsAddUnder,
    showsEdit: visibility.showsEdit,
    showsOpen: visibility.showsOpen
  }
}

export function projectHierarchyTreeNodeShowsDocumentButtonGroup (
  node: Pick<I_faProjectHierarchyTreeHeTreeNode, 'documentId' | 'nodeKind' | 'tagId'>,
  visibility: {
    showsAddUnder: boolean
    showsEdit: boolean
    showsOpen: boolean
  }
): boolean {
  if (node.nodeKind !== 'document' || node.documentId === null) {
    return false
  }
  const resolved = resolveProjectHierarchyTreeDocumentButtonVisibilityForNode(node, visibility)
  return resolved.showsAddUnder || resolved.showsEdit || resolved.showsOpen
}
