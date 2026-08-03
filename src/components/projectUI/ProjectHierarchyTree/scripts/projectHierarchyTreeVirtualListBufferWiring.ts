import VirtualList from '@virtual-list/vue'

import {
  PROJECT_HIERARCHY_TREE_VIRTUAL_LIST_BUFFER_PX,
  PROJECT_HIERARCHY_TREE_VIRTUAL_ROW_SIZE_PX
} from '../functions/projectHierarchyTreeConstants'

type T_virtualListPropDef = {
  default?: unknown
}

type T_virtualListComponentWithProps = {
  props?: {
    buffer?: T_virtualListPropDef
    itemSize?: T_virtualListPropDef
  }
}

function resolveProjectHierarchyTreeVirtualListItemSize (): number {
  return PROJECT_HIERARCHY_TREE_VIRTUAL_ROW_SIZE_PX
}

/**
 * he-tree Draggable never passes @virtual-list/vue buffer or itemSize.
 * Raise buffer default and seed itemSize before first VirtualList mount.
 */
export function applyProjectHierarchyTreeVirtualListDefaults (): void {
  const props = (VirtualList as T_virtualListComponentWithProps).props
  const bufferProp = props?.buffer
  if (bufferProp !== undefined) {
    bufferProp.default = PROJECT_HIERARCHY_TREE_VIRTUAL_LIST_BUFFER_PX
  }
  const itemSizeProp = props?.itemSize
  if (itemSizeProp !== undefined) {
    // Vue Function props: default IS the function (not an Object/Array factory).
    // Returning a nested function made itemSize() yield a function → NaN row sizes.
    itemSizeProp.default = resolveProjectHierarchyTreeVirtualListItemSize
  }
}

applyProjectHierarchyTreeVirtualListDefaults()
