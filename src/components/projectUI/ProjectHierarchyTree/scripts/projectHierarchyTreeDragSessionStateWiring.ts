import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeDragSiblingOrderSnapshot } from 'app/types/I_faProjectHierarchyTreeDomain'

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
