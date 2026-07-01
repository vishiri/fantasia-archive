import type { Ref } from 'vue'

export function createProjectHierarchyTreeDragSessionState (deps: {
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  isTreeDragActive: Ref<boolean>
}) {
  let draggedDocumentId: string | null = null
  let dragExpandedSnapshot: string[] | null = null

  function clearDragSessionFlags (): void {
    deps.isTreeDragActive.value = false
    deps.dragCommitPending.value = false
    deps.dragCommitScheduled.value = false
    deps.dragDropCommitted.value = false
    draggedDocumentId = null
    dragExpandedSnapshot = null
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

  return {
    clearDragSessionFlags,
    dragExpandedSnapshot: dragExpandedSnapshotBinding,
    draggedDocumentId: draggedDocumentIdBinding
  }
}
