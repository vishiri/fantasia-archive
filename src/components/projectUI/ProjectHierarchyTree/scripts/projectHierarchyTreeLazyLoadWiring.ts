import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  findProjectHierarchyTreeNodeById
} from '../functions/projectHierarchyTreeExpandState'
import {
  commitProjectHierarchyTreeStagedLoadedChildren,
  flushProjectHierarchyTreeStagedLoadedChildren,
  loadProjectHierarchyTreeNodeChildren,
  publishProjectHierarchyTreeLazyLoadRevision,
  refreshProjectHierarchyTreeNodeChildrenFromDatabase
} from './projectHierarchyTreeLazyLoadChildrenWiring'

type T_revisionState = {
  deferredTreeRevisionPublishPending: boolean
  stagedLoadedChildren: Map<string, I_faProjectHierarchyTreeHeTreeNode[]> | null
}

type T_publishDeps = {
  nextTick: () => Promise<void>
  onAfterTreeRevisionPublished: () => void | Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}

async function loadProjectHierarchyTreeChildrenAlongRevealPath (deps: {
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  nodeIds: string[]
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  for (const nodeId of deps.nodeIds) {
    const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (node === null) {
      continue
    }
    await deps.loadChildrenForNode(node)
  }
}

function createPublishTreeRevision (deps: {
  publishDeps: T_publishDeps
  revisionState: T_revisionState
  shouldDeferTreeRevisionPublish: () => boolean
}) {
  return async function publishTreeRevision (
    nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
    nodeId: string
  ): Promise<void> {
    if (deps.shouldDeferTreeRevisionPublish()) {
      deps.revisionState.deferredTreeRevisionPublishPending = true
      return
    }
    deps.revisionState.deferredTreeRevisionPublishPending = false
    await publishProjectHierarchyTreeLazyLoadRevision(deps.publishDeps, nodeKind, nodeId)
  }
}

/**
 * Loads lazy tree rows without publishing or opening he-tree until the batch finishes.
 */
export async function runProjectHierarchyTreeDeferredLazyLoadBatch (deps: {
  deferLazyLoadTreeRevisionPublish: Ref<boolean>
  flushDeferredTreeRevisionPublish: () => Promise<void>
  nextTick?: () => Promise<void>
  reapplyHeTreeOpenState: () => void
  runBatch: () => Promise<void>
  skipReapplyHeTreeOpenState?: boolean
}): Promise<void> {
  if (deps.deferLazyLoadTreeRevisionPublish.value) {
    await deps.runBatch()
    return
  }
  deps.deferLazyLoadTreeRevisionPublish.value = true
  try {
    await deps.runBatch()
    await deps.flushDeferredTreeRevisionPublish()
    if (deps.nextTick !== undefined) {
      await deps.nextTick()
      await deps.nextTick()
    }
    if (deps.skipReapplyHeTreeOpenState !== true) {
      deps.reapplyHeTreeOpenState()
    }
  } finally {
    deps.deferLazyLoadTreeRevisionPublish.value = false
  }
}

export function createProjectHierarchyTreeLazyLoadWiring (deps: {
  deferLazyLoadTreeRevisionPublish: Ref<boolean>
  getPreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  listPlacementDocumentChildren: (
    input: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => Promise<{ items: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDocumentChild[] }>
  nextTick: () => Promise<void>
  onAfterTreeRevisionPublished: () => void | Promise<void>
  shouldDeferTreeRevisionPublish: () => boolean
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  const revisionState: T_revisionState = {
    deferredTreeRevisionPublishPending: false,
    stagedLoadedChildren: null
  }
  const publishDeps: T_publishDeps = {
    nextTick: deps.nextTick,
    onAfterTreeRevisionPublished: deps.onAfterTreeRevisionPublished,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  }
  const publishTreeRevision = createPublishTreeRevision({
    publishDeps,
    revisionState,
    shouldDeferTreeRevisionPublish: deps.shouldDeferTreeRevisionPublish
  })

  function commitStagedLoadedChildren (): boolean {
    return commitProjectHierarchyTreeStagedLoadedChildren({
      revisionState,
      treeData: deps.treeData
    })
  }

  async function flushDeferredTreeRevisionPublish (): Promise<void> {
    await flushProjectHierarchyTreeStagedLoadedChildren({
      publishDeps,
      revisionState,
      treeData: deps.treeData
    })
  }

  async function loadChildrenForNode (
    node: I_faProjectHierarchyTreeHeTreeNode
  ): Promise<void> {
    const stageLoadedChildrenForNode = !deps.deferLazyLoadTreeRevisionPublish.value
      ? undefined
      : (nodeId: string, children: I_faProjectHierarchyTreeHeTreeNode[]) => {
          if (revisionState.stagedLoadedChildren === null) {
            revisionState.stagedLoadedChildren = new Map()
          }
          revisionState.stagedLoadedChildren.set(nodeId, children)
        }
    await loadProjectHierarchyTreeNodeChildren({
      listPlacementDocumentChildren: deps.listPlacementDocumentChildren,
      node,
      preferredLanguageCode: deps.getPreferredLanguageCode(),
      publishTreeRevision,
      treeData: deps.treeData,
      ...(stageLoadedChildrenForNode === undefined
        ? {}
        : { stageLoadedChildrenForNode })
    })
  }

  async function loadChildrenAlongRevealPath (nodeIds: string[]): Promise<void> {
    await loadProjectHierarchyTreeChildrenAlongRevealPath({
      loadChildrenForNode,
      nodeIds,
      treeData: deps.treeData
    })
  }

  const refreshNodeChildrenFromDatabase = (nodeId: string) => {
    return refreshProjectHierarchyTreeNodeChildrenFromDatabase({
      listPlacementDocumentChildren: deps.listPlacementDocumentChildren,
      nodeId,
      preferredLanguageCode: deps.getPreferredLanguageCode(),
      publishTreeRevision,
      treeData: deps.treeData
    })
  }

  return {
    commitStagedLoadedChildren,
    flushDeferredTreeRevisionPublish,
    loadChildrenAlongRevealPath,
    loadChildrenForNode,
    refreshNodeChildrenFromDatabase
  }
}
