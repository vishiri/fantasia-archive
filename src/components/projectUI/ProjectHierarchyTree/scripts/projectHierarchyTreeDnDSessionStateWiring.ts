import type { Ref } from 'vue'
import type { I_faProjectHierarchyTreeDragSiblingOrderSnapshot, I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions } from 'app/types/I_faProjectHierarchyTreeDomain'
import { clearFaVerticalDraggableTabsDocumentDragCursor } from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import { shouldClearDragSessionWithoutCommit } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import { PROJECT_HIERARCHY_TREE_DRAG_OPEN_REMOUNT_QUIET_MS } from '../functions/projectHierarchyTreeConstants'

export function createProjectHierarchyTreeDragCancelWiring (deps: {
  clearDragSessionFlags: () => void
  dragCommitPending: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  dragExpandedSnapshot: () => string[] | null
  nextTick: () => Promise<void>
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
    void remountProjectHierarchyTreeAndRestoreExpandedSnapshot({
      expandedNodeIds: expandedSnapshot,
      nextTick: deps.nextTick,
      restoreExpandedSnapshot: deps.restoreExpandedSnapshot
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

export function createProjectHierarchyTreeDragSessionState (deps: {
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  isTreeDragActive: Ref<boolean>
}) {
  let draggedDocumentId: string | null = null
  let dragExpandedSnapshot: string[] | null = null
  let dragSiblingOrderSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null = null
  let dragSiblingOrderAtDragStart: string[] | null = null
  let dragParentDocumentIdAtDragStart: string | null = null
  let dragModelValueRevision = 0
  let dragModelValueRevisionAtDragStart = 0
  let dragModelValueRevisionAtDrop = 0

  function clearDragSessionFlags (): void {
    deps.isTreeDragActive.value = false
    deps.dragCommitPending.value = false
    deps.dragCommitScheduled.value = false
    deps.dragDropCommitted.value = false
    draggedDocumentId = null
    dragExpandedSnapshot = null
    dragSiblingOrderSnapshot = null
    dragSiblingOrderAtDragStart = null
    dragParentDocumentIdAtDragStart = null
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

  function readDragModelValueRevision (): number {
    return dragModelValueRevision
  }

  function readDragModelValueRevisionAtDragStart (): number {
    return dragModelValueRevisionAtDragStart
  }

  function readDragModelValueRevisionAtDrop (): number {
    return dragModelValueRevisionAtDrop
  }

  function captureDragParentDocumentIdAtDragStart (parentDocumentId: string | null): void {
    dragParentDocumentIdAtDragStart = parentDocumentId
  }

  function readDragParentDocumentIdAtDragStart (): string | null {
    return dragParentDocumentIdAtDragStart
  }

  function captureDragSiblingOrderAtDragStart (orderedDocumentIds: string[] | null): void {
    dragSiblingOrderAtDragStart = orderedDocumentIds === null ? null : [...orderedDocumentIds]
  }

  function readDragSiblingOrderAtDragStart (): string[] | null {
    return dragSiblingOrderAtDragStart
  }

  function readDragModelValueSettledForCommit (): boolean {
    return dragModelValueRevision > dragModelValueRevisionAtDrop
  }

  const draggedDocumentIdBinding = {
    get: () => draggedDocumentId,
    set: (value: string | null) => {
      draggedDocumentId = value
    }
  }
  const dragExpandedSnapshotBinding = {
    get: () => dragExpandedSnapshot,
    set: (value: string[] | null) => {
      dragExpandedSnapshot = value
    }
  }
  const dragSiblingOrderSnapshotBinding = {
    get: () => dragSiblingOrderSnapshot,
    set: (value: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null) => {
      dragSiblingOrderSnapshot = value
    }
  }

  return {
    captureDragParentDocumentIdAtDragStart,
    captureDragSiblingOrderAtDragStart,
    captureDragModelValueRevisionAtDrop,
    clearDragSessionFlags,
    dragExpandedSnapshot: dragExpandedSnapshotBinding,
    draggedDocumentId: draggedDocumentIdBinding,
    dragSiblingOrderSnapshot: dragSiblingOrderSnapshotBinding,
    incrementDragModelValueRevision,
    readDragParentDocumentIdAtDragStart,
    readDragSiblingOrderAtDragStart,
    readDragModelValueRevision,
    readDragModelValueRevisionAtDragStart,
    readDragModelValueRevisionAtDrop,
    readDragModelValueSettledForCommit,
    resetDragModelValueRevisionForDragStart
  }
}

/**
 * Restores he-tree expand snapshot after drag quiet period so drag-open timers
 * cannot call beforeDragOpen on a torn-down Draggable instance.
 */
function waitForProjectHierarchyTreeDragOpenRemountQuietPeriod (): Promise<void> {
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
  const waitBeforeRemount = deps.waitBeforeRemount ?? waitForProjectHierarchyTreeDragOpenRemountQuietPeriod
  await waitBeforeRemount()
  await deps.restoreExpandedSnapshot(deps.expandedNodeIds, deps.restoreOptions)
  await deps.nextTick()
  await deps.nextTick()
}
