import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance } from 'app/types/I_faProjectHierarchyTreeDomain'

export function createProjectHierarchyTreeSessionRefs (deps: {
  ref: <T>(initial: T) => Ref<T>
}) {
  const suppressTreeEmit = deps.ref(false)
  const isTreeDragActive = deps.ref(false)
  const dragCommitPending = deps.ref(false)
  const dragCommitScheduled = deps.ref(false)
  const dragDropCommitted = deps.ref(false)
  const dragExpandUiFrozen = deps.ref(false)
  const dragExpandPostCommitGuard = deps.ref(false)
  const openNodeIds = deps.ref<Set<string>>(new Set())
  const treeComponentRef = deps.ref<I_faProjectHierarchyTreeHeTreeInstance | null>(null)
  const treeMountKey = deps.ref(0)
  const treeScrollHostRef = deps.ref<HTMLElement | null>(null)

  return {
    dragCommitPending,
    dragCommitScheduled,
    dragDropCommitted,
    dragExpandPostCommitGuard,
    dragExpandUiFrozen,
    isTreeDragActive,
    openNodeIds,
    suppressTreeEmit,
    treeComponentRef,
    treeMountKey,
    treeScrollHostRef
  }
}
