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

type T_deferredLazyLoadBatchState = {
  active: number
  hadSuccess: boolean
  nextTick: (() => Promise<void>) | undefined
  reapplyWanted: boolean
}

const deferredLazyLoadBatchStateByDefer = new WeakMap<
  Ref<boolean>,
  T_deferredLazyLoadBatchState
>()

function readDeferredLazyLoadBatchState (
  deferLazyLoadTreeRevisionPublish: Ref<boolean>
): T_deferredLazyLoadBatchState {
  const existing = deferredLazyLoadBatchStateByDefer.get(deferLazyLoadTreeRevisionPublish)
  if (existing !== undefined) {
    return existing
  }
  const created: T_deferredLazyLoadBatchState = {
    active: 0,
    hadSuccess: false,
    nextTick: undefined,
    reapplyWanted: false
  }
  deferredLazyLoadBatchStateByDefer.set(deferLazyLoadTreeRevisionPublish, created)
  return created
}

async function finishDeferredLazyLoadBatch (
  deps: {
    deferLazyLoadTreeRevisionPublish: Ref<boolean>
    flushDeferredTreeRevisionPublish: () => Promise<void>
    reapplyHeTreeOpenState: () => void
  },
  state: T_deferredLazyLoadBatchState
): Promise<void> {
  try {
    await deps.flushDeferredTreeRevisionPublish()
    if (state.active > 0) {
      return
    }
    const nextTick = state.nextTick
    state.nextTick = undefined
    if (nextTick !== undefined) {
      await nextTick()
      await nextTick()
    }
    if (state.active > 0) {
      return
    }
    const reapplyWanted = state.reapplyWanted
    state.reapplyWanted = false
    if (reapplyWanted) {
      deps.reapplyHeTreeOpenState()
    }
  } finally {
    if (state.active === 0) {
      deps.deferLazyLoadTreeRevisionPublish.value = false
    }
  }
}

/**
 * Loads lazy tree rows without publishing or opening he-tree until every overlapping batch finishes.
 * A second load that starts while the first is still running must not publish early or skip the later rows.
 */
export async function runProjectHierarchyTreeDeferredLazyLoadBatch (deps: {
  deferLazyLoadTreeRevisionPublish: Ref<boolean>
  flushDeferredTreeRevisionPublish: () => Promise<void>
  nextTick?: () => Promise<void>
  reapplyHeTreeOpenState: () => void
  runBatch: () => Promise<void>
  skipReapplyHeTreeOpenState?: boolean
}): Promise<void> {
  const state = readDeferredLazyLoadBatchState(deps.deferLazyLoadTreeRevisionPublish)
  state.active += 1
  deps.deferLazyLoadTreeRevisionPublish.value = true
  if (deps.nextTick !== undefined) {
    state.nextTick = deps.nextTick
  }
  if (deps.skipReapplyHeTreeOpenState !== true) {
    state.reapplyWanted = true
  }
  let batchError: unknown
  let batchFailed = false
  try {
    await deps.runBatch()
  } catch (error: unknown) {
    batchFailed = true
    batchError = error
  }
  state.active -= 1
  if (!batchFailed) {
    state.hadSuccess = true
  }
  if (state.active === 0) {
    const hadSuccess = state.hadSuccess
    state.hadSuccess = false
    if (!hadSuccess) {
      state.nextTick = undefined
      state.reapplyWanted = false
      deps.deferLazyLoadTreeRevisionPublish.value = false
    } else {
      await finishDeferredLazyLoadBatch(deps, state)
    }
  }
  if (batchFailed) {
    throw batchError
  }
}

export function createProjectHierarchyTreeLazyLoadWiring (deps: {
  deferLazyLoadTreeRevisionPublish: Ref<boolean>
  getPreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  listDocumentsUnderTag?: (
    input: { tagId: string }
  ) => Promise<{ items: import('app/types/I_faProjectTagDomain').I_faProjectTagDocumentChild[] }>
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
      ...(deps.listDocumentsUnderTag === undefined
        ? {}
        : { listDocumentsUnderTag: deps.listDocumentsUnderTag }),
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
      treeData: deps.treeData,
      ...(deps.listDocumentsUnderTag === undefined
        ? {}
        : { listDocumentsUnderTag: deps.listDocumentsUnderTag })
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
