import type { I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions } from 'app/types/I_faProjectHierarchyTreeDomain'

/** he-tree Draggable indent prop (px) per nested level. */
export const PROJECT_HIERARCHY_TREE_INDENT_PX = 28

/** Root class on the he-tree Draggable scroll container. */
export const PROJECT_HIERARCHY_TREE_ROOT_CLASS = 'projectHierarchyTree'

/** Selector for he-tree row wrappers inside the workspace hierarchy tree. */
export const PROJECT_HIERARCHY_TREE_NODE_ITEM_SELECTOR = '.tree-node'

/** Default Material icon for template group rows. */
export const PROJECT_HIERARCHY_TREE_GROUP_ICON = 'mdi-database'

/** he-tree Draggable trigger-class — added to document row after press-and-hold delay. */
export const PROJECT_HIERARCHY_TREE_DRAG_HANDLE_CLASS = 'projectHierarchyTree__dragHandle'

/**
 * Pointer movement (px) before a document row press+release counts as drag, not expand click.
 */
export const PROJECT_HIERARCHY_TREE_DOCUMENT_ROW_DRAG_CLICK_TOLERANCE_PX = 8

/** Hover delay (ms) before he-tree opens a closed row during drag for nest drops. */
export const PROJECT_HIERARCHY_TREE_DRAG_OPEN_DELAY_MS = 400

/**
 * Default q-icon for template placement and document rows when template icon unset.
 * Matches FaIconPickerInput empty placeholder (FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON).
 */
export const PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON = 'mdi-file-outline'

/**
 * Quiet period (ms) after drag ends before remounting he-tree so drag-open timers
 * cannot call beforeDragOpen on a destroyed Draggable instance.
 */
export const PROJECT_HIERARCHY_TREE_DRAG_OPEN_REMOUNT_QUIET_MS =
  PROJECT_HIERARCHY_TREE_DRAG_OPEN_DELAY_MS + 50

/**
 * Press-and-hold delay (ms) on a document row before he-tree drag may start.
 */
export const PROJECT_HIERARCHY_TREE_DOCUMENT_ROW_DRAG_HOLD_DELAY_MS = 200

/** Drag post-commit restore keeps full snapshot ids plus ancestor chain. */
export const PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS = {
  includeAncestorClosure: true,
  skipAncestorPrune: true
} satisfies I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
