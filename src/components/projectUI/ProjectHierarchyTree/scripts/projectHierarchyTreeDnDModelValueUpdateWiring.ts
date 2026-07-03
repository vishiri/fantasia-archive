import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { shouldAcceptHeTreeModelValueUpdate } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import { syncProjectHierarchyTreeDocumentHasChildrenFlags } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'
import { findProjectHierarchyTreeDocumentsWithInvalidPlacementParent } from '../functions/projectHierarchyTreeDocumentPlacementGuard'
import { resolveProjectHierarchyTreeDragSiblingOrderSnapshot } from './projectHierarchyTreeDragSiblingOrderSnapshotWiring'

type T_projectHierarchyTreeDnDModelValueUpdateDeps = {
  dragCommitPending: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  draggedDocumentId: {
    get: () => string | null
  }
  dragSiblingOrderSnapshot: {
    get: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
    set: (
      value: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
    ) => void
  }
  incrementDragModelValueRevision: () => void
  isTreeDragActive: Ref<boolean>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}

export function applyProjectHierarchyTreeHeTreeModelValueUpdate (
  deps: T_projectHierarchyTreeDnDModelValueUpdateDeps,
  nextNodes: I_faProjectHierarchyTreeHeTreeNode[]
): void {
  if (!shouldAcceptHeTreeModelValueUpdate({
    dragCommitPending: deps.dragCommitPending.value,
    dragDropCommitted: deps.dragDropCommitted.value,
    isTreeDragActive: deps.isTreeDragActive.value,
    suppressTreeEmit: deps.suppressTreeEmit.value
  })) {
    return
  }
  const escapedDocuments = findProjectHierarchyTreeDocumentsWithInvalidPlacementParent(nextNodes)
  if (escapedDocuments.length > 0) {
    return
  }
  deps.treeData.value = nextNodes
  deps.incrementDragModelValueRevision()
  syncProjectHierarchyTreeDocumentHasChildrenFlags(deps.treeData.value)
  const draggedDocumentId = deps.draggedDocumentId.get()
  if (draggedDocumentId !== null) {
    deps.dragSiblingOrderSnapshot.set(
      resolveProjectHierarchyTreeDragSiblingOrderSnapshot(deps.treeData.value, draggedDocumentId)
    )
  }
}
