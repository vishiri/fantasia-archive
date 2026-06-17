import type {
  I_dialogProjectSettingsWorldTemplateLayoutDragContext,
  I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
} from 'app/types/I_dialogProjectSettingsWorlds'

export function isDialogProjectSettingsWorldTemplateLayoutNodeDraggable (
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
): boolean {
  return node.nodeKind === 'group' || node.nodeKind === 'template'
}

export function isDialogProjectSettingsWorldTemplateLayoutRootDroppable (
  dragContext: I_dialogProjectSettingsWorldTemplateLayoutDragContext
): boolean {
  const dragged = dragContext.dragNode?.data
  if (dragged === undefined || dragged === null) {
    return true
  }
  return dragged.nodeKind === 'group' || dragged.nodeKind === 'template'
}

export function isDialogProjectSettingsWorldTemplateLayoutNodeDroppable (
  targetNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode,
  dragContext: I_dialogProjectSettingsWorldTemplateLayoutDragContext
): boolean {
  const dragged = dragContext.dragNode?.data
  if (dragged === undefined || dragged === null) {
    return true
  }
  if (dragged.nodeKind === 'group') {
    return false
  }
  if (dragged.nodeKind === 'template') {
    if (targetNode.nodeKind === 'group') {
      return true
    }
    return false
  }
  return false
}
