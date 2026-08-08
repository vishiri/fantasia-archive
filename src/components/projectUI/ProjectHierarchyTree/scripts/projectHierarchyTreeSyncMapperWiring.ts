import type { Ref } from 'vue'
import type { watch as WatchFn } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faOpenedDocumentOpenMode } from 'app/types/I_faOpenedDocumentsDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import { resolveTrimmedIconOrDefault } from 'app/src/scripts/faIcons/faIconDisplay_manager'

import type { I_faProjectHierarchyTreeTagSettings } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createMapHierarchyDocumentChildrenToTreeNodes } from '../functions/mapHierarchyDocumentChildrenToTreeNodes'
import { createMapWorkspaceLayoutToHierarchyTreeSkeleton } from '../functions/mapWorkspaceLayoutToHierarchyTreeSkeleton'
import { patchWorkspaceLayoutPlacementNodeInPlace } from '../functions/mapWorkspaceLayoutPlacementNodePatch'
import {
  PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON,
  PROJECT_HIERARCHY_TREE_GROUP_ICON
} from '../functions/projectHierarchyTreeConstants'
import { createProjectHierarchyTreeLazyPlaceholderApi } from '../functions/projectHierarchyTreeLazyPlaceholder'
import { findProjectHierarchyTreeDocumentsWithInvalidPlacementParent } from '../functions/projectHierarchyTreeDocumentPlacementGuard'
import { resolveProjectHierarchyTreeNewDocumentDisplayName } from '../functions/projectHierarchyTreeAddNewDocumentLabel'
import {
  mergeProjectHierarchyTreeWorldChildrenWithTags,
  resolveProjectHierarchyTreeTagBranchNodes
} from '../functions/projectHierarchyTreeTagNodes'
import { patchProjectHierarchyTreeTagBranchLabelsInPlace } from './projectHierarchyTreeTagBranchPatchWiring'
import {
  collectProjectHierarchyTreeTagIds,
  publishProjectHierarchyTreeRootRevisionIfTagsRemoved
} from './projectHierarchyTreeTagMembershipRevisionWiring'
import {
  isProjectHierarchyTreeAddNewDocumentCreateSourceNode,
  refreshProjectHierarchyTreeAddNewDocumentLabelsInTree
} from './projectHierarchyTreeAddNewDocumentNode'
import { projectHierarchyTreeLayoutStructureMatchesTree } from './projectHierarchyTreeLayoutStructureMatch'

const lazyPlaceholderApi = createProjectHierarchyTreeLazyPlaceholderApi()

function resolvePlacementDisplayIcon (icon: string): string {
  return resolveTrimmedIconOrDefault(icon, PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON)
}

const tagSkeletonResolvers = {
  resolveTagSettings: (): I_faProjectHierarchyTreeTagSettings => {
    return {
      compactTags: false,
      noTags: false,
      tagsAtTop: false
    }
  },
  resolveTagsLabel: (): string => 'Tags'
}

/**
 * Binds live App Settings + i18n resolvers used by the hierarchy skeleton tag branch.
 */
export function bindProjectHierarchyTreeTagSkeletonResolvers (deps: {
  resolveTagSettings: () => I_faProjectHierarchyTreeTagSettings
  resolveTagsLabel: () => string
}): void {
  tagSkeletonResolvers.resolveTagSettings = deps.resolveTagSettings
  tagSkeletonResolvers.resolveTagsLabel = deps.resolveTagsLabel
}

const workspaceLayoutMapperApi = createMapWorkspaceLayoutToHierarchyTreeSkeleton({
  groupIcon: PROJECT_HIERARCHY_TREE_GROUP_ICON,
  lazyPlaceholderApi,
  patchPlacementNodeInPlace: patchWorkspaceLayoutPlacementNodeInPlace,
  resolvePlacementDisplayIcon,
  resolveTagSettings: () => tagSkeletonResolvers.resolveTagSettings(),
  resolveTagsLabel: () => tagSkeletonResolvers.resolveTagsLabel(),
  tagBranchApi: {
    mergeWorldChildrenWithTags: mergeProjectHierarchyTreeWorldChildrenWithTags,
    patchTagBranchLabelsInPlace: patchProjectHierarchyTreeTagBranchLabelsInPlace,
    resolveTagBranchNodes: resolveProjectHierarchyTreeTagBranchNodes
  }
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
  function applySkeletonTreeData (
    nextSkeleton: I_faProjectHierarchyTreeHeTreeNode[]
  ): void {
    deps.suppressTreeEmit.value = true
    deps.treeData.value = nextSkeleton
    void deps.nextTick().then(() => {
      deps.suppressTreeEmit.value = false
    })
  }

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
    const treeTagIdsBefore = collectProjectHierarchyTreeTagIds(deps.treeData.value)
    if (structureMatches) {
      patchHierarchyTreeSkeletonLabelsInPlace(
        deps.treeData.value,
        worlds
      )
      refreshProjectHierarchyTreeAddNewDocumentLabelsInTree(
        deps.treeData.value,
        deps.getPreferredLanguageCode()
      )
      const tagsRemoved = publishProjectHierarchyTreeRootRevisionIfTagsRemoved({
        nextTick: deps.nextTick,
        suppressTreeEmit: deps.suppressTreeEmit,
        treeData: deps.treeData,
        treeTagIdsBefore
      })
      return { structureMatched: !tagsRemoved }
    }
    applySkeletonTreeData(nextSkeleton)
    return { structureMatched: false }
  }

  function forceResyncTreeDataFromLayout (): void {
    const worlds = deps.getWorlds()
    if (worlds.length === 0) {
      deps.treeData.value = []
      return
    }
    applySkeletonTreeData(mapWorkspaceLayoutToHierarchyTreeSkeleton(worlds))
  }

  return {
    forceResyncTreeDataFromLayout,
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
    initialTagsDraft?: import('app/types/I_faProjectTagDomain').I_faProjectDocumentTagAssignmentInput[] | undefined
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
