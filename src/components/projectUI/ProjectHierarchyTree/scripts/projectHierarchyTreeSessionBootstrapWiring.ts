import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import { bindProjectHierarchyTreeHeTreeNodeTabIndexGuard } from './projectHierarchyTreeHeTreeNodeTabIndexWiring'
import { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowExpandClickGestureWiring'
import { createProjectHierarchyTreeSessionRefs } from './projectHierarchyTreeSessionRefsWiring'

export function createProjectHierarchyTreeSessionBootstrapWiring (deps: {
  onUnmounted: (hook: () => void) => void
  ref: <T>(initial: T) => Ref<T>
  watch: typeof watchFn
}) {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref: deps.ref })

  const documentRowExpandClickGesture = createProjectHierarchyTreeDocumentRowExpandClickGestureWiring({
    isTreeDragActive: sessionRefs.isTreeDragActive
  })

  bindProjectHierarchyTreeHeTreeNodeTabIndexGuard({
    onUnmounted: deps.onUnmounted,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    watch: deps.watch
  })

  return {
    documentRowExpandClickGesture,
    sessionRefs
  }
}
