import type { Ref } from 'vue'
import type { I_faProjectHierarchyTreeDragSiblingOrderSnapshot, I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions } from 'app/types/I_faProjectHierarchyTreeDomain'
import { clearFaVerticalDraggableTabsDocumentDragCursor } from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import { shouldClearDragSessionWithoutCommit } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import { PROJECT_HIERARCHY_TREE_DRAG_OPEN_REMOUNT_QUIET_MS } from '../functions/projectHierarchyTreeConstants'
import { runWithPreservedProjectHierarchyTreeScrollTop } from './projectHierarchyTreeScrollPreserveWiring'

export function createProjectHierarchyTreeDragCancelWiring (deps: {
  clearDragSessionFlags: () => void
  dragCommitPending: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  dragExpandedSnapshot: () => string[] | null
  getTreeScrollHost: () => HTMLElement | null
  nextTick: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
}) {
  function removeDragCancelListeners (): void {
    window.removeEventListener('pointerup', onWindowPointerUpDuringDrag)
    window.removeEventListener('keydown', onWindowKeydownDuringDrag)
  }

  function attachDragCancelListeners (): void {
    window.addEventListener('pointerup', onWindowPointerUpDuringDrag)
    window.addEventListener('keydown', onWindowKeydownDuringDrag)
  }
  function finishDragSessionWithoutCommit (): void {
    if (!shouldClearDragSessionWithoutCommit({
      dragDropCommitted: deps.dragDropCommitted.value
    })) {
      return
    }
    removeDragCancelListeners()
    clearFaVerticalDraggableTabsDocumentDragCursor()
    deps.resyncTreeDataFromLayout()
    const expandedSnapshot = deps.dragExpandedSnapshot() ?? []
    void runWithPreservedProjectHierarchyTreeScrollTop({
      getTreeScrollHost: deps.getTreeScrollHost,
      nextTick: deps.nextTick,
      requestAnimationFrame: deps.requestAnimationFrame,
      run: async () => {
        await remountProjectHierarchyTreeAndRestoreExpandedSnapshot({
          expandedNodeIds: expandedSnapshot,
          nextTick: deps.nextTick,
          restoreExpandedSnapshot: deps.restoreExpandedSnapshot
        })
      }
    }).finally(() => {
      deps.dragExpandPostCommitGuard.value = false
      deps.dragExpandUiFrozen.value = false
      deps.clearDragSessionFlags()
    })
  }

  function onWindowPointerUpDuringDrag (): void {
    void deps.nextTick().then(() => {
      if (deps.dragDropCommitted.value) {
        return
      }
      finishDragSessionWithoutCommit()
    }).catch((err: unknown) => {
      console.error('[ProjectHierarchyTree] drag cancel nextTick chain failed', err)
    })
  }

  function onWindowKeydownDuringDrag (event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      return
    }
    finishDragSessionWithoutCommit()
  }

  return {
    attachDragCancelListeners,
    finishDragSessionWithoutCommit,
    onWindowKeydownDuringDrag,
    onWindowPointerUpDuringDrag,
    removeDragCancelListeners
  }
}

function createProjectHierarchyTreeDragSessionNullableBinding<T> (initial: T): {
  get: () => T
  set: (value: T) => void
  read: () => T
  write: (value: T) => void
} {
  let current = initial
  const get = (): T => current
  const set = (value: T): void => {
    current = value
  }
  return {
    get,
    set,
    read: get,
    write: set
  }
}

export function createProjectHierarchyTreeDragSessionState (deps: {
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  isTreeDragActive: Ref<boolean>
}) {
  const draggedDocumentId = createProjectHierarchyTreeDragSessionNullableBinding<string | null>(null)
  const draggedTreeNodeId = createProjectHierarchyTreeDragSessionNullableBinding<string | null>(null)
  const dragExpandedSnapshot = createProjectHierarchyTreeDragSessionNullableBinding<string[] | null>(null)
  const dragSiblingOrderSnapshot = createProjectHierarchyTreeDragSessionNullableBinding<
    I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  >(null)
  let dragSiblingOrderAtDragStart: string[] | null = null
  let dragParentDocumentIdAtDragStart: string | null = null
  let dragScrollTopPxAtDragStart = 0
  let dragModelValueRevision = 0
  let dragModelValueRevisionAtDragStart = 0
  let dragModelValueRevisionAtDrop = 0

  function clearDragSessionFlags (): void {
    deps.isTreeDragActive.value = false
    deps.dragCommitPending.value = false
    deps.dragCommitScheduled.value = false
    deps.dragDropCommitted.value = false
    draggedDocumentId.write(null)
    draggedTreeNodeId.write(null)
    dragExpandedSnapshot.write(null)
    dragSiblingOrderSnapshot.write(null)
    dragSiblingOrderAtDragStart = null
    dragParentDocumentIdAtDragStart = null
    dragScrollTopPxAtDragStart = 0
    dragModelValueRevision = 0
    dragModelValueRevisionAtDragStart = 0
    dragModelValueRevisionAtDrop = 0
  }

  function resetDragModelValueRevisionForDragStart (): void {
    dragModelValueRevision = 0
    dragModelValueRevisionAtDragStart = 0
    dragModelValueRevisionAtDrop = 0
  }

  function captureDragModelValueRevisionAtDrop (): void {
    dragModelValueRevisionAtDrop = dragModelValueRevision
  }

  function incrementDragModelValueRevision (): void {
    dragModelValueRevision += 1
  }

  function captureDragParentDocumentIdAtDragStart (parentDocumentId: string | null): void {
    dragParentDocumentIdAtDragStart = parentDocumentId
  }

  function captureDragScrollTopPxAtDragStart (scrollTopPx: number): void {
    dragScrollTopPxAtDragStart = scrollTopPx
  }

  function captureDragSiblingOrderAtDragStart (orderedDocumentIds: string[] | null): void {
    dragSiblingOrderAtDragStart = orderedDocumentIds === null ? null : [...orderedDocumentIds]
  }

  const readDragParentDocumentIdAtDragStart = (): string | null => dragParentDocumentIdAtDragStart
  const readDragScrollTopPxAtDragStart = (): number => dragScrollTopPxAtDragStart
  const readDragSiblingOrderAtDragStart = (): string[] | null => dragSiblingOrderAtDragStart
  const readDragModelValueRevision = (): number => dragModelValueRevision
  const readDragModelValueRevisionAtDragStart = (): number => dragModelValueRevisionAtDragStart
  const readDragModelValueRevisionAtDrop = (): number => dragModelValueRevisionAtDrop
  const readDragModelValueSettledForCommit = (): boolean =>
    dragModelValueRevision > dragModelValueRevisionAtDrop
  const draggedDocumentIdApi = {
    get: draggedDocumentId.get,
    set: draggedDocumentId.set
  }
  const draggedTreeNodeIdApi = {
    get: draggedTreeNodeId.get,
    set: draggedTreeNodeId.set
  }
  const dragExpandedSnapshotApi = {
    get: dragExpandedSnapshot.get,
    set: dragExpandedSnapshot.set
  }
  const dragSiblingOrderSnapshotApi = {
    get: dragSiblingOrderSnapshot.get,
    set: dragSiblingOrderSnapshot.set
  }

  return {
    captureDragParentDocumentIdAtDragStart,
    captureDragScrollTopPxAtDragStart,
    captureDragSiblingOrderAtDragStart,
    captureDragModelValueRevisionAtDrop,
    clearDragSessionFlags,
    dragExpandedSnapshot: dragExpandedSnapshotApi,
    draggedDocumentId: draggedDocumentIdApi,
    draggedTreeNodeId: draggedTreeNodeIdApi,
    dragSiblingOrderSnapshot: dragSiblingOrderSnapshotApi,
    incrementDragModelValueRevision,
    readDragParentDocumentIdAtDragStart,
    readDragScrollTopPxAtDragStart,
    readDragSiblingOrderAtDragStart,
    readDragModelValueRevision,
    readDragModelValueRevisionAtDragStart,
    readDragModelValueRevisionAtDrop,
    readDragModelValueSettledForCommit,
    resetDragModelValueRevisionForDragStart
  }
}

/**
 * Restores expand snapshot after drag settle so drag-open cannot race restore.
 */
function waitForProjectHierarchyTreeDragOpenRestoreSettle (): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, PROJECT_HIERARCHY_TREE_DRAG_OPEN_REMOUNT_QUIET_MS)
  })
}

export async function remountProjectHierarchyTreeAndRestoreExpandedSnapshot (deps: {
  expandedNodeIds: string[]
  nextTick: () => Promise<void>
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
  restoreOptions?: I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  waitBeforeRemount?: () => Promise<void>
}): Promise<void> {
  const waitBeforeRemount = deps.waitBeforeRemount ?? waitForProjectHierarchyTreeDragOpenRestoreSettle
  await waitBeforeRemount()
  await deps.restoreExpandedSnapshot(deps.expandedNodeIds, deps.restoreOptions)
  await deps.nextTick()
  await deps.nextTick()
}
