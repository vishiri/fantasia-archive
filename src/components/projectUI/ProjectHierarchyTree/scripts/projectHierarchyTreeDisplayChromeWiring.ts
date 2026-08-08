import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'
import type {
  I_faProjectHierarchyTreeHeTreeNode,
  T_faProjectHierarchyTreeNodeKind
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import type { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import {
  resolveFaDocumentAppearanceChromeStyle,
  resolveFaDocumentStatusLabelColor
} from 'app/src/scripts/documentAppearance/documentAppearance_manager'
import { resolveTrimmedIconOrDefault } from 'app/src/scripts/faIcons/faIconDisplay_manager'

import {
  PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON,
  PROJECT_HIERARCHY_TREE_NODE_ITEM_SELECTOR
} from '../functions/projectHierarchyTreeConstants'
import { resolveProjectHierarchyTreeShowsOrderNumberBadge } from '../functions/projectHierarchyTreeOrderNumberBadgeVisibility'
import { resolveProjectHierarchyTreePlacementCountSegments } from '../functions/projectHierarchyTreePlacementCountSegments'
import { resolveProjectHierarchyTreePlacementCountVisibility } from '../functions/projectHierarchyTreePlacementCountVisibility'
import { resolveProjectHierarchyTreeShowsProjectNameTitle } from '../functions/projectHierarchyTreeProjectNameTitleVisibility'
import {
  PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_LIST,
  resolveProjectHierarchyTreeTreeNodeKindClass
} from '../functions/projectHierarchyTreeTreeNodeKindClass'
import { resolveProjectHierarchyTreeUsesExtraTreePadding } from '../functions/projectHierarchyTreeExtraTreePadding'
import { resolveProjectHierarchyTreeShowsTreeLines } from '../functions/projectHierarchyTreeTreeLineVisibility'

export function resolveProjectHierarchyTreeDocumentAppearanceChrome (
  node: Pick<
    I_faProjectHierarchyTreeHeTreeNode,
    'documentBackgroundColor' | 'documentTextColor' | 'isMinor' | 'nodeKind'
  >
): I_faDocumentAppearanceChromeStyle | undefined {
  if (node.nodeKind !== 'document') {
    return undefined
  }
  const baseChrome = resolveFaDocumentAppearanceChromeStyle({
    documentBackgroundColor: node.documentBackgroundColor ?? '',
    documentTextColor: node.documentTextColor ?? ''
  })
  const statusLabelColor = resolveFaDocumentStatusLabelColor({
    documentTextColor: node.documentTextColor ?? '',
    isMinor: node.isMinor === true
  })
  if (baseChrome === undefined && statusLabelColor === undefined) {
    return undefined
  }
  return {
    ...baseChrome,
    color: baseChrome?.color ?? statusLabelColor
  }
}

export function resolveProjectHierarchyTreePlacementDisplayIcon (icon: string): string {
  return resolveTrimmedIconOrDefault(icon, PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON)
}

function resolveHeTreeRowElement (rowElement: HTMLElement | null): HTMLElement | null {
  return rowElement?.closest(PROJECT_HIERARCHY_TREE_NODE_ITEM_SELECTOR) ?? null
}

function clearProjectHierarchyTreeTreeNodeKindClasses (treeNode: HTMLElement): void {
  for (const className of PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_LIST) {
    treeNode.classList.remove(className)
  }
}

export function applyProjectHierarchyTreeTreeNodeKindClass (
  rowElement: HTMLElement | null,
  nodeKind: T_faProjectHierarchyTreeNodeKind
): void {
  const treeNode = resolveHeTreeRowElement(rowElement)
  if (!treeNode) {
    return
  }
  clearProjectHierarchyTreeTreeNodeKindClasses(treeNode)
  const kindClass = resolveProjectHierarchyTreeTreeNodeKindClass(nodeKind)
  treeNode.classList.add(kindClass)
}

export function clearProjectHierarchyTreeTreeNodeKindClass (
  rowElement: HTMLElement | null
): void {
  const treeNode = resolveHeTreeRowElement(rowElement)
  if (!treeNode) {
    return
  }
  clearProjectHierarchyTreeTreeNodeKindClasses(treeNode)
}

export function createProjectHierarchyTreeTreeLineWiring (deps: {
  S_FaUserSettings: typeof S_FaUserSettings
  computed: <T>(getter: () => T) => I_computedRef<T>
  storeToRefs: T_piniaStoreToRefs
}): {
    showsTreeLines: I_computedRef<boolean>
  } {
  const { appSettingsDialogPreview, settings } = deps.storeToRefs(deps.S_FaUserSettings())!

  const showsTreeLines = deps.computed(() => {
    return resolveProjectHierarchyTreeShowsTreeLines(
      settings!.value,
      appSettingsDialogPreview!.value,
      {
        hideTreeLines: FA_USER_SETTINGS_DEFAULTS.hideTreeLines
      }
    )
  })

  return {
    showsTreeLines
  }
}

export function createProjectHierarchyTreeExtraTreePaddingWiring (deps: {
  S_FaUserSettings: typeof S_FaUserSettings
  computed: <T>(getter: () => T) => I_computedRef<T>
  storeToRefs: T_piniaStoreToRefs
}): {
    usesExtraTreePadding: I_computedRef<boolean>
  } {
  const { appSettingsDialogPreview, settings } = deps.storeToRefs(deps.S_FaUserSettings())!

  const usesExtraTreePadding = deps.computed(() => {
    return resolveProjectHierarchyTreeUsesExtraTreePadding(
      settings!.value,
      appSettingsDialogPreview!.value,
      {
        extraTreePadding: FA_USER_SETTINGS_DEFAULTS.extraTreePadding
      }
    )
  })

  return {
    usesExtraTreePadding
  }
}

export function createProjectHierarchyTreeOrderNumberBadgeWiring (deps: {
  S_FaUserSettings: typeof S_FaUserSettings
  computed: <T>(getter: () => T) => I_computedRef<T>
  storeToRefs: T_piniaStoreToRefs
}): {
    showsOrderNumberBadge: I_computedRef<boolean>
  } {
  const { appSettingsDialogPreview, settings } = deps.storeToRefs(deps.S_FaUserSettings())!

  const showsOrderNumberBadge = deps.computed(() => {
    return resolveProjectHierarchyTreeShowsOrderNumberBadge(
      settings!.value,
      appSettingsDialogPreview!.value,
      {
        hideTreeOrderNumbers: FA_USER_SETTINGS_DEFAULTS.hideTreeOrderNumbers
      }
    )
  })

  return {
    showsOrderNumberBadge
  }
}

export function createProjectHierarchyTreePlacementCountWiring (deps: {
  S_FaUserSettings: typeof S_FaUserSettings
  computed: <T>(getter: () => T) => I_computedRef<T>
  storeToRefs: T_piniaStoreToRefs
}): {
    placementCountVisibility: I_computedRef<ReturnType<typeof resolveProjectHierarchyTreePlacementCountVisibility>>
    resolvePlacementCountDisplayForCounts: (
      counts: { categoryCount: number, documentCount: number }
    ) => ReturnType<typeof resolveProjectHierarchyTreePlacementCountSegments>
  } {
  const { appSettingsDialogPreview, settings } = deps.storeToRefs(deps.S_FaUserSettings())!

  const placementCountVisibility = deps.computed(() => {
    return resolveProjectHierarchyTreePlacementCountVisibility(
      settings!.value,
      appSettingsDialogPreview!.value,
      {
        disableCategoryCount: FA_USER_SETTINGS_DEFAULTS.disableCategoryCount,
        disableDocumentCounts: FA_USER_SETTINGS_DEFAULTS.disableDocumentCounts,
        doubleDashDocCount: FA_USER_SETTINGS_DEFAULTS.doubleDashDocCount,
        invertCategoryPosition: FA_USER_SETTINGS_DEFAULTS.invertCategoryPosition
      }
    )
  })

  function resolvePlacementCountDisplayForCounts (
    counts: { categoryCount: number, documentCount: number }
  ): ReturnType<typeof resolveProjectHierarchyTreePlacementCountSegments> {
    const visibility = placementCountVisibility.value
    return resolveProjectHierarchyTreePlacementCountSegments({
      categoryCount: counts.categoryCount,
      disableCategoryCount: visibility.disableCategoryCount,
      disableDocumentCounts: visibility.disableDocumentCounts,
      documentCount: counts.documentCount,
      doubleDashDocCount: visibility.doubleDashDocCount,
      invertCategoryPosition: visibility.invertCategoryPosition
    })
  }

  return {
    placementCountVisibility,
    resolvePlacementCountDisplayForCounts
  }
}

export function createProjectHierarchyTreeProjectNameTitleWiring (deps: {
  S_FaActiveProject: typeof S_FaActiveProject
  S_FaUserSettings: typeof S_FaUserSettings
  computed: <T>(getter: () => T) => I_computedRef<T>
  storeToRefs: T_piniaStoreToRefs
  worldCount: I_computedRef<number>
}): {
    projectDisplayName: I_computedRef<string>
    showsProjectNameTitle: I_computedRef<boolean>
  } {
  const { activeProject } = deps.storeToRefs(deps.S_FaActiveProject())!
  const { appSettingsDialogPreview, settings } = deps.storeToRefs(deps.S_FaUserSettings())!

  const projectDisplayName = deps.computed(() => {
    return activeProject!.value?.name ?? ''
  })

  const showsProjectNameTitle = deps.computed(() => {
    return resolveProjectHierarchyTreeShowsProjectNameTitle(
      deps.worldCount.value,
      projectDisplayName.value,
      settings!.value,
      appSettingsDialogPreview!.value,
      {
        noProjectName: FA_USER_SETTINGS_DEFAULTS.noProjectName
      }
    )
  })

  return {
    projectDisplayName,
    showsProjectNameTitle
  }
}
