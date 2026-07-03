/** Node kind discriminant for workspace hierarchy tree rows. */
export type T_faProjectHierarchyTreeNodeKind =
  | 'world'
  | 'group'
  | 'templatePlacement'
  | 'document'

/** Persisted expand/collapse and scroll offset in project_data KV hierarchy_tree_ui_state. */
export interface I_faProjectHierarchyTreeUiState {
  schemaVersion: 1
  expandedNodeIds: string[]
  scrollTopPx: number
}

/** Partial update merged into hierarchy_tree_ui_state by main-process IPC. */
export interface I_faProjectHierarchyTreeUiStatePatch {
  expandedNodeIds?: string[] | undefined
  scrollTopPx?: number | undefined
}

/** Live expand/collapse read from hierarchy tree DOM during drag snapshot. */
export interface I_faProjectHierarchyTreeLiveExpandDomState {
  collapsedVisibleNodeIds: string[]
  expandedNodeIds: string[]
  rowCount: number
  scrollHostPresent: boolean
}

/** Options for drag post-commit expanded snapshot restore. */
export interface I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions {
  includeAncestorClosure?: boolean
  skipAncestorPrune?: boolean
}

/** One template group row in the workspace hierarchy skeleton. */
export interface I_faProjectHierarchyTreeWorkspaceGroup {
  id: string
  worldId: string
  displayName: string
  rootSortOrder: number
  hasChildren: boolean
}

/** One template placement row in the workspace hierarchy skeleton. */
export interface I_faProjectHierarchyTreeWorkspacePlacement {
  id: string
  worldId: string
  documentTemplateId: string
  groupId: string | null
  rootSortOrder: number | null
  groupSortOrder: number | null
  displayName: string
  nickname: string
  icon: string
  hasChildren: boolean
}

/** One world row with nested layout metadata for the workspace hierarchy skeleton. */
export interface I_faProjectHierarchyTreeWorkspaceWorld {
  id: string
  displayName: string
  sortOrder: number
  color: string
  groups: I_faProjectHierarchyTreeWorkspaceGroup[]
  placements: I_faProjectHierarchyTreeWorkspacePlacement[]
}

export interface I_faProjectHierarchyTreeWorkspaceLayoutResult {
  worlds: I_faProjectHierarchyTreeWorkspaceWorld[]
}

/** Lazy-load input for documents under a template placement. */
export interface I_faProjectHierarchyTreeListPlacementChildrenInput {
  placementId: string
  parentDocumentId?: string | null | undefined
}

/** One document row returned for lazy tree expansion. */
export interface I_faProjectHierarchyTreeDocumentChild {
  id: string
  displayName: string
  placementId: string
  parentDocumentId: string | null
  sortOrder: number
  hasChildren: boolean
}

export interface I_faProjectHierarchyTreeListPlacementChildrenResult {
  items: I_faProjectHierarchyTreeDocumentChild[]
}

/** Reorder payload for same-placement document drag-and-drop. */
export interface I_faProjectHierarchyTreeMoveDocumentInput {
  documentId: string
  targetParentDocumentId: string | null
  targetSortOrder: number
}

/** Persists full sibling bucket order after hierarchy tree drag-and-drop. */
export interface I_faProjectHierarchyTreeReindexDocumentSiblingsInput {
  movedDocumentId: string
  orderedDocumentIds: string[]
  parentDocumentId: string | null
  placementId: string
}

/** One hierarchy search hit with ancestor document ids for reveal. */
export interface I_faProjectHierarchyTreeSearchHit {
  documentId: string
  displayName: string
  placementId: string
  worldId: string
  ancestorDocumentIds: string[]
}

export interface I_faProjectHierarchyTreeSearchInput {
  query: string
}

export interface I_faProjectHierarchyTreeSearchResult {
  query: string
  hits: I_faProjectHierarchyTreeSearchHit[]
}

/** Drag source context for hierarchy tree DnD helpers (renderer). */
export interface I_faProjectHierarchyTreeDragContext {
  worldId: string
  placementId: string
  documentId: string
}

/** Captured sibling order during drag before async SQLite commit. */
export interface I_faProjectHierarchyTreeDragSiblingOrderSnapshot {
  orderedDocumentIds: string[]
  parentDocumentId: string | null
  placementId: string
}

export interface I_faProjectHierarchyTreeDocumentParentBucket {
  children: I_faProjectHierarchyTreeHeTreeNode[]
  parentDocumentId: string | null
  parentNode: I_faProjectHierarchyTreeHeTreeNode | null
}

/** Outcome of persisting a hierarchy tree document drag move. */
export interface I_faProjectHierarchyTreeDragCommitResult {
  committed: boolean
  emptiedParentDocumentIds: string[]
  nestParentDocumentId: string | null
  /** Parent row whose lazy-loaded children should refresh from SQLite after commit. */
  reloadChildrenNodeId: string | null
}

/** Minimal he-tree Draggable instance API used by workspace hierarchy tree wiring. */
export interface I_faProjectHierarchyTreeHeTreeInstance {
  closeAll: () => void
  getData?: () => I_faProjectHierarchyTreeHeTreeNode[]
  openNodeAndParents: (nodeOrStat: I_faProjectHierarchyTreeHeTreeNode) => void
}

/** Document row whose parent is not templatePlacement or document (invalid escape). */
export interface I_faProjectHierarchyTreeDocumentInvalidPlacementParent {
  documentId: string
  parentNodeId: string | null
  parentNodeKind: T_faProjectHierarchyTreeNodeKind | 'none'
}

/** he-tree node data for the workspace hierarchy sidebar tree. */
export interface I_faProjectHierarchyTreeHeTreeNode {
  children: I_faProjectHierarchyTreeHeTreeNode[]
  childrenLoaded: boolean
  documentId: string | null
  groupId: string | null
  hasChildren: boolean
  icon: string
  id: string
  label: string
  nodeKind: T_faProjectHierarchyTreeNodeKind
  placementId: string | null
  worldColor: string
  worldId: string
}
