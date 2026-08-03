import type { Ref } from 'vue'
import type { watch as WatchFn } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faOpenedDocumentOpenMode } from 'app/types/I_faOpenedDocumentsDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import { resolveTrimmedIconOrDefault } from 'app/src/scripts/faIcons/faIconDisplay_manager'

import { createMapHierarchyDocumentChildrenToTreeNodes } from '../functions/mapHierarchyDocumentChildrenToTreeNodes'
import { createMapWorkspaceLayoutToHierarchyTreeSkeleton } from '../functions/mapWorkspaceLayoutToHierarchyTreeSkeleton'
import {
  PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON,
  PROJECT_HIERARCHY_TREE_GROUP_ICON
} from '../functions/projectHierarchyTreeConstants'
import { createProjectHierarchyTreeLazyPlaceholderApi } from '../functions/projectHierarchyTreeLazyPlaceholder'
import { findProjectHierarchyTreeDocumentsWithInvalidPlacementParent } from '../functions/projectHierarchyTreeDocumentPlacementGuard'
import { resolveProjectHierarchyTreeNewDocumentDisplayName } from '../functions/projectHierarchyTreeAddNewDocumentLabel'
import {
  isProjectHierarchyTreeAddNewDocumentCreateSourceNode,
  refreshProjectHierarchyTreeAddNewDocumentLabelsInTree
} from './projectHierarchyTreeAddNewDocumentNode'
import { projectHierarchyTreeLayoutStructureMatchesTree } from './projectHierarchyTreeLayoutStructureMatch'

const lazyPlaceholderApi = createProjectHierarchyTreeLazyPlaceholderApi()

function resolvePlacementDisplayIcon (icon: string): string {
  return resolveTrimmedIconOrDefault(icon, PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON)
}

const workspaceLayoutMapperApi = createMapWorkspaceLayoutToHierarchyTreeSkeleton({
  groupIcon: PROJECT_HIERARCHY_TREE_GROUP_ICON,
  lazyPlaceholderApi,
  resolvePlacementDisplayIcon
})

export const mapWorkspaceLayoutToHierarchyTreeSkeleton =
  workspaceLayoutMapperApi.mapWorkspaceLayoutToHierarchyTreeSkeleton

export const patchHierarchyTreeSkeletonLabelsInPlace =
  workspaceLayoutMapperApi.patchHierarchyTreeSkeletonLabelsInPlace

export const mapHierarchyDocumentChildrenToTreeNodes = createMapHierarchyDocumentChildrenToTreeNodes({
  lazyPlaceholderApi,
  resolvePlacementDisplayIcon
})

export function createProjectHierarchyTreeSyncWiring (deps: {
  getPreferredLanguageCode: () => T_faUserSettingsLanguageCode
  getWorlds: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeWorkspaceWorld[]
  nextTick: () => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  function resyncTreeDataFromLayout (): { structureMatched: boolean } {
    const worlds = deps.getWorlds()
    if (worlds.length === 0) {
      deps.treeData.value = []
      return { structureMatched: false }
    }
    const nextSkeleton = mapWorkspaceLayoutToHierarchyTreeSkeleton(worlds)
    const escapedDocuments = findProjectHierarchyTreeDocumentsWithInvalidPlacementParent(
      deps.treeData.value
    )
    const structureMatches = deps.treeData.value.length > 0 &&
      escapedDocuments.length === 0 &&
      projectHierarchyTreeLayoutStructureMatchesTree(deps.treeData.value, worlds)
    if (structureMatches) {
      patchHierarchyTreeSkeletonLabelsInPlace(
        deps.treeData.value,
        worlds
      )
      refreshProjectHierarchyTreeAddNewDocumentLabelsInTree(
        deps.treeData.value,
        deps.getPreferredLanguageCode()
      )
      return { structureMatched: true }
    }
    deps.suppressTreeEmit.value = true
    deps.treeData.value = nextSkeleton
    void deps.nextTick().then(() => {
      deps.suppressTreeEmit.value = false
    })
    return { structureMatched: false }
  }

  return {
    resyncTreeDataFromLayout
  }
}

export function bindProjectHierarchyTreeAddNewDocumentLanguageRefresh (deps: {
  getPreferredLanguageCode: () => T_faUserSettingsLanguageCode
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  watch: typeof WatchFn
}): void {
  deps.watch(() => deps.getPreferredLanguageCode(), () => {
    refreshProjectHierarchyTreeAddNewDocumentLabelsInTree(
      deps.treeData.value,
      deps.getPreferredLanguageCode()
    )
  })
}

export function createProjectHierarchyTreeAddNewDocumentClickHandlers (deps: {
  createTemporaryDocument: (input: {
    displayName: string
    openMode: T_faOpenedDocumentOpenMode
    parentDocumentId: null
    templateId: string
    worldId: string
  }) => Promise<string>
  resolvePreferredLanguageCode: () => T_faUserSettingsLanguageCode
}): {
    onAddNewDocumentRowAuxClick: (node: I_faProjectHierarchyTreeHeTreeNode, event: MouseEvent) => void
    onAddNewDocumentRowClick: (node: I_faProjectHierarchyTreeHeTreeNode, event?: MouseEvent) => void
  } {
  function resolveCreateInput (
    node: I_faProjectHierarchyTreeHeTreeNode,
    openMode: T_faOpenedDocumentOpenMode
  ): {
    displayName: string
    openMode: T_faOpenedDocumentOpenMode
    parentDocumentId: null
    templateId: string
    worldId: string
  } | null {
    if (!isProjectHierarchyTreeAddNewDocumentCreateSourceNode(node)) {
      return null
    }
    const templateId = node.documentTemplateId
    if (templateId === undefined || templateId === null || templateId.length === 0) {
      return null
    }
    const displayName = resolveProjectHierarchyTreeNewDocumentDisplayName({
      preferredLanguageCode: deps.resolvePreferredLanguageCode(),
      titlePluralTranslations: node.titlePluralTranslations ?? {},
      titleSingularTranslations: node.titleSingularTranslations ?? {}
    })
    return {
      displayName,
      openMode,
      parentDocumentId: null,
      templateId,
      worldId: node.worldId
    }
  }

  function onAddNewDocumentRowClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    event?: MouseEvent
  ): void {
    const input = resolveCreateInput(node, 'leftNavigate')
    if (input === null) {
      return
    }
    event?.stopPropagation()
    void deps.createTemporaryDocument(input)
  }

  function onAddNewDocumentRowAuxClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    event: MouseEvent
  ): void {
    if (event.button !== 1) {
      return
    }
    const input = resolveCreateInput(node, 'middleBackground')
    if (input === null) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    void deps.createTemporaryDocument(input)
  }

  return {
    onAddNewDocumentRowAuxClick,
    onAddNewDocumentRowClick
  }
}
