import type { Ref } from 'vue'

import type { I_qMenuViewportPointerPosition } from 'app/types/I_qMenuViewportPointerPosition'
import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeNodeContextMenuSectionFlags
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { resolveQMenuViewportPointerPositionFromMouseEvent } from '../functions/resolveQMenuViewportPointerPositionFromMouseEvent'
import { resolveProjectHierarchyTreeNodeContextMenuSectionFlags } from './projectHierarchyTreeNodeContextMenuWiring'

export function openProjectHierarchyTreeNodeContextMenu (input: {
  clearContextMenuAddNewRow: () => void
  contextMenuAddNewRowIcon: Ref<string | null>
  contextMenuAddNewRowLabel: Ref<string | null>
  contextMenuAnchorNodeId: Ref<string | null>
  contextMenuShowsBulkExpandRows: Ref<boolean>
  contextMenuShowsCopyRows: Ref<boolean>
  contextMenuShowsDocumentOpenEditRows: Ref<boolean>
  contextMenuShowsSortByRows: Ref<boolean>
  contextMenuSortByDirectScopeOnly: Ref<boolean>
  contextMenuShowsTagMenuRows: Ref<boolean>
  event: MouseEvent
  isNodeContextMenuOpen: Ref<boolean>
  node: I_faProjectHierarchyTreeHeTreeNode
  nodeMenuPointerPosition: Ref<I_qMenuViewportPointerPosition | null>
  resolvePreferredLanguageCode: () => T_faUserSettingsLanguageCode
  resolvePlacementAddNewContextMenuRow: (rowInput: {
    placement: I_faProjectHierarchyTreeHeTreeNode
    preferredLanguageCode: T_faUserSettingsLanguageCode
  }) => { icon: string, label: string } | null
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): void {
  input.event.preventDefault()
  if (input.node.nodeKind === 'addNewDocument') {
    return
  }
  const sectionFlags: I_faProjectHierarchyTreeNodeContextMenuSectionFlags | null =
    resolveProjectHierarchyTreeNodeContextMenuSectionFlags(
      input.node,
      input.treeData
    )
  if (sectionFlags === null) {
    return
  }
  const target = input.event.currentTarget instanceof HTMLElement
    ? input.event.currentTarget
    : null
  if (target === null) {
    return
  }
  input.nodeMenuPointerPosition.value = resolveQMenuViewportPointerPositionFromMouseEvent(input.event)
  input.contextMenuAnchorNodeId.value = input.node.id
  input.contextMenuShowsBulkExpandRows.value = sectionFlags.showsBulkExpandRows
  input.contextMenuShowsCopyRows.value = sectionFlags.showsCopyRows
  input.contextMenuShowsDocumentOpenEditRows.value = sectionFlags.showsDocumentOpenEditRows
  input.contextMenuShowsSortByRows.value = sectionFlags.showsSortByRows
  input.contextMenuSortByDirectScopeOnly.value = sectionFlags.sortByDirectScopeOnly
  input.contextMenuShowsTagMenuRows.value = sectionFlags.showsTagMenuRows
  const addNewRow = input.resolvePlacementAddNewContextMenuRow({
    placement: input.node,
    preferredLanguageCode: input.resolvePreferredLanguageCode()
  })
  if (addNewRow === null) {
    input.clearContextMenuAddNewRow()
  } else {
    input.contextMenuAddNewRowLabel.value = addNewRow.label
    input.contextMenuAddNewRowIcon.value = addNewRow.icon
  }
  input.isNodeContextMenuOpen.value = true
}
