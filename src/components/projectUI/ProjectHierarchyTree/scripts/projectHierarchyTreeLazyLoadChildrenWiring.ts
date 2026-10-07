import { ResultAsync } from 'neverthrow'

import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeListPlacementChildrenInput
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faProjectTagDocumentChild } from 'app/types/I_faProjectTagDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { isProjectHierarchyTreeAddNewDocumentNode } from '../functions/projectHierarchyTreeAddNewDocumentNodeKind'
import {
  cloneProjectHierarchyTreeLoadedNodeForPublish,
  replaceProjectHierarchyTreeNodeByIdInPlace
} from '../functions/projectHierarchyTreeCloneLoadedNodeForPublish'
import {
  findProjectHierarchyTreeNodeById,
  publishProjectHierarchyTreeRootRevision
} from '../functions/projectHierarchyTreeExpandState'
import {
  beginProjectHierarchyTreeChildLoad,
  isProjectHierarchyTreePlacementDocumentListNotFoundError,
  shouldReloadProjectHierarchyTreeNodeChildren
} from '../functions/projectHierarchyTreeLazyLoadChildReload'
import { createMergeLoadedChildrenIntoNode } from '../functions/projectHierarchyTreeMergeLoadedChildren'
import { beginProjectHierarchyTreeSuppressEmit, endProjectHierarchyTreeSuppressEmit } from '../functions/projectHierarchyTreeSuppressEmitDepth'
import { finalizeProjectHierarchyTreePlacementTopLevelChildren } from './projectHierarchyTreeAddNewDocumentNode'
import { mapHierarchyDocumentChildrenToTreeNodes } from './projectHierarchyTreeSyncMapperWiring'
import { loadProjectHierarchyTreeTagNodeChildrenIfNeeded } from './projectHierarchyTreeLazyLoadTagChildrenWiring'

export const mergeLoadedChildrenIntoNode = createMergeLoadedChildrenIntoNode({
  isAddNewDocumentNode: isProjectHierarchyTreeAddNewDocumentNode
})

type T_lazyLoadPublishDeps = {
  nextTick: () => Promise<void>
  onAfterTreeRevisionPublished: () => void | Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}

type T_projectHierarchyTreeLazyLoadRevisionState = {
  deferredTreeRevisionPublishPending: boolean
  stagedLoadedChildren: Map<string, I_faProjectHierarchyTreeHeTreeNode[]> | null
}

async function notifyAfterProjectHierarchyTreeRevisionPublished (
  deps: T_lazyLoadPublishDeps
): Promise<void> {
  await deps.nextTick()
  await deps.onAfterTreeRevisionPublished()
}

export async function publishProjectHierarchyTreeLazyLoadRevision (
  deps: T_lazyLoadPublishDeps,
  _nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
  nodeId: string,
  options?: { skipRootRevision?: boolean }
): Promise<void> {
  beginProjectHierarchyTreeSuppressEmit(deps.suppressTreeEmit)
  const publishWork = (async () => {
    const loadedNode = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (loadedNode !== null && loadedNode.childrenLoaded) {
      replaceProjectHierarchyTreeNodeByIdInPlace(
        deps.treeData.value,
        nodeId,
        cloneProjectHierarchyTreeLoadedNodeForPublish(loadedNode)
      )
    }
    if (options?.skipRootRevision !== true) {
      deps.treeData.value = publishProjectHierarchyTreeRootRevision(deps.treeData.value)
    }
    await notifyAfterProjectHierarchyTreeRevisionPublished(deps)
  })()
  await publishWork.finally(() => {
    endProjectHierarchyTreeSuppressEmit(deps.suppressTreeEmit)
  })
}

export function commitProjectHierarchyTreeStagedLoadedChildren (deps: {
  revisionState: T_projectHierarchyTreeLazyLoadRevisionState
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): boolean {
  if (
    deps.revisionState.stagedLoadedChildren === null ||
    deps.revisionState.stagedLoadedChildren.size === 0
  ) {
    return false
  }
  // Merge into existing node objects. Do not clone/replace - he-tree keeps those
  // object refs; replacing them makes openNodeAndParents miss stats (opened:false).
  for (const [nodeId, children] of deps.revisionState.stagedLoadedChildren) {
    mergeLoadedChildrenIntoNode(deps.treeData.value, nodeId, children)
  }
  deps.revisionState.stagedLoadedChildren = null
  deps.revisionState.deferredTreeRevisionPublishPending = true
  return true
}

export async function flushProjectHierarchyTreeStagedLoadedChildren (deps: {
  publishDeps: T_lazyLoadPublishDeps
  revisionState: T_projectHierarchyTreeLazyLoadRevisionState
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<boolean> {
  const committed = commitProjectHierarchyTreeStagedLoadedChildren({
    revisionState: deps.revisionState,
    treeData: deps.treeData
  })
  if (!committed && !deps.revisionState.deferredTreeRevisionPublishPending) {
    return false
  }
  deps.revisionState.deferredTreeRevisionPublishPending = false
  // In-place child merge alone does not update he-tree stats. Shallow root slice
  // notifies Vue/he-tree while keeping node object identity (no clone/replace).
  // Soft resync still skips remount / full reapplyHeTreeOpenState (blink source).
  await publishProjectHierarchyTreeLazyLoadRevision(
    deps.publishDeps,
    'document',
    'deferred-batch'
  )
  return true
}

export async function refreshProjectHierarchyTreeNodeChildrenFromDatabase (deps: {
  listDocumentsUnderTag?: (
    input: { tagId: string }
  ) => Promise<{ items: I_faProjectTagDocumentChild[] }>
  listPlacementDocumentChildren: (
    input: I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => Promise<{ items: I_faProjectHierarchyTreeDocumentChild[] }>
  nodeId: string
  preferredLanguageCode: T_faUserSettingsLanguageCode
  publishTreeRevision: (
    nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
    nodeId: string
  ) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const node = findProjectHierarchyTreeNodeById(deps.treeData.value, deps.nodeId)
  if (node === null) {
    return
  }
  node.childrenLoaded = false
  await loadProjectHierarchyTreeNodeChildren({
    listPlacementDocumentChildren: deps.listPlacementDocumentChildren,
    node,
    preferredLanguageCode: deps.preferredLanguageCode,
    publishTreeRevision: deps.publishTreeRevision,
    treeData: deps.treeData,
    ...(deps.listDocumentsUnderTag === undefined
      ? {}
      : { listDocumentsUnderTag: deps.listDocumentsUnderTag })
  })
}

async function listPlacementChildrenOrSkipMissing (
  listPlacementDocumentChildren: (
    input: I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => Promise<{ items: I_faProjectHierarchyTreeDocumentChild[] }>,
  input: I_faProjectHierarchyTreeListPlacementChildrenInput
): Promise<{ items: I_faProjectHierarchyTreeDocumentChild[] } | null> {
  const listed = await ResultAsync.fromPromise(
    listPlacementDocumentChildren(input),
    (error: unknown) => error
  )
  if (listed.isErr()) {
    if (isProjectHierarchyTreePlacementDocumentListNotFoundError(listed.error)) {
      return null
    }
    throw listed.error
  }
  return listed.value
}

export async function loadProjectHierarchyTreeNodeChildren (deps: {
  listDocumentsUnderTag?: (
    input: { tagId: string }
  ) => Promise<{ items: I_faProjectTagDocumentChild[] }>
  listPlacementDocumentChildren: (
    input: I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => Promise<{ items: I_faProjectHierarchyTreeDocumentChild[] }>
  node: I_faProjectHierarchyTreeHeTreeNode
  preferredLanguageCode: T_faUserSettingsLanguageCode
  publishTreeRevision: (
    nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
    nodeId: string
  ) => Promise<void>
  stageLoadedChildrenForNode?: (
    nodeId: string,
    children: I_faProjectHierarchyTreeHeTreeNode[]
  ) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  if (!shouldReloadProjectHierarchyTreeNodeChildren(deps.node)) {
    return
  }
  const isStillCurrent = beginProjectHierarchyTreeChildLoad(deps.node.id)
  if (await loadProjectHierarchyTreeTagNodeChildrenIfNeeded({
    ...deps,
    isStillCurrent
  })) {
    return
  }
  if (deps.node.nodeKind === 'templatePlacement' && deps.node.placementId !== null) {
    const result = await listPlacementChildrenOrSkipMissing(
      deps.listPlacementDocumentChildren,
      { placementId: deps.node.placementId }
    )
    if (result === null || !isStillCurrent()) {
      return
    }
    const docChildren = mapHierarchyDocumentChildrenToTreeNodes({
      items: result.items,
      placementIcon: deps.node.icon,
      worldColor: deps.node.worldColor,
      worldId: deps.node.worldId
    })
    const children = finalizeProjectHierarchyTreePlacementTopLevelChildren({
      children: docChildren,
      placement: deps.node,
      preferredLanguageCode: deps.preferredLanguageCode
    })
    if (deps.stageLoadedChildrenForNode !== undefined) {
      deps.stageLoadedChildrenForNode(deps.node.id, children)
      return
    }
    if (mergeLoadedChildrenIntoNode(deps.treeData.value, deps.node.id, children)) {
      await deps.publishTreeRevision(deps.node.nodeKind, deps.node.id)
    }
    return
  }
  if (!deps.node.hasChildren) {
    return
  }
  if (
    deps.node.nodeKind === 'document' &&
    deps.node.placementId !== null &&
    deps.node.documentId !== null
  ) {
    const result = await listPlacementChildrenOrSkipMissing(
      deps.listPlacementDocumentChildren,
      {
        parentDocumentId: deps.node.documentId,
        placementId: deps.node.placementId
      }
    )
    if (result === null || !isStillCurrent()) {
      return
    }
    const children = mapHierarchyDocumentChildrenToTreeNodes({
      items: result.items,
      placementIcon: deps.node.icon,
      worldColor: deps.node.worldColor,
      worldId: deps.node.worldId
    })
    if (deps.stageLoadedChildrenForNode !== undefined) {
      deps.stageLoadedChildrenForNode(deps.node.id, children)
      return
    }
    if (mergeLoadedChildrenIntoNode(deps.treeData.value, deps.node.id, children)) {
      await deps.publishTreeRevision(deps.node.nodeKind, deps.node.id)
    }
  }
}
