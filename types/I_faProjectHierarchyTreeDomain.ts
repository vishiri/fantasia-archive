import type { I_faProjectDocumentTemplateTitleSingularTranslations } from 'app/types/I_faProjectDocumentTemplateTitleSingularTranslations'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'

/** Node kind discriminant for workspace hierarchy tree rows. */
export type T_faProjectHierarchyTreeNodeKind =
  | 'world'
  | 'group'
  | 'templatePlacement'
  | 'document'
  | 'addNewDocument'
  | 'tag'
  | 'tagWrapper'

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
  documentCount?: number | undefined
  categoryCount?: number | undefined
  titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations
  titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations
}

/** One per-world tag row for hierarchy tree skeleton (counts from listTagsWithDocumentCountsForWorld). */
export interface I_faProjectHierarchyTreeWorkspaceTag {
  id: string
  name: string
  documentCount: number
  categoryCount: number
}

/** One world row with nested layout metadata for the workspace hierarchy skeleton. */
export interface I_faProjectHierarchyTreeWorkspaceWorld {
  id: string
  displayName: string
  sortOrder: number
  color: string
  colorPalette: string
  groups: I_faProjectHierarchyTreeWorkspaceGroup[]
  placements: I_faProjectHierarchyTreeWorkspacePlacement[]
  /** Tags for this world; omit or empty when none. */
  tags?: I_faProjectHierarchyTreeWorkspaceTag[] | undefined
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
  documentBackgroundColor?: string | null | undefined
  documentTextColor?: string | null | undefined
  id: string
  displayName: string
  placementId: string
  parentDocumentId: string | null
  sortOrder: number
  hasChildren: boolean
  isCategory?: boolean | undefined
  isFinished?: boolean | undefined
  isMinor?: boolean | undefined
  isDead?: boolean | undefined
  treeOrderNumber?: number | undefined
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
  /** Set when reordering mirrored docs under a tag. */
  tagId?: string | null | undefined
  /** He-tree node id of the dragged row (disambiguates tag twins). */
  treeNodeId?: string | null | undefined
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
  $refs?: {
    vtlist?: {
      update?: () => void
    }
  }
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
/** Section visibility for hierarchy tree node right-click context menu. */
export interface I_faProjectHierarchyTreeNodeContextMenuSectionFlags {
  showsBulkExpandRows: boolean
  showsCopyRows: boolean
  /** Open + edit only (mirrored docs under a tag). */
  showsDocumentOpenEditRows: boolean
  showsSortByRows: boolean
  /**
   * When true with showsSortByRows, Sort by submenu lists only non-recursive
   * (direct) modes — used for individual tag rows.
   */
  sortByDirectScopeOnly: boolean
  /** Tag row: add-to-tag / rename / delete. */
  showsTagMenuRows: boolean
}

/** User settings that control tag branch chrome in the hierarchy tree. */
export interface I_faProjectHierarchyTreeTagSettings {
  compactTags: boolean
  noTags: boolean
  tagsAtTop: boolean
}

/** Sort by submenu row id for hierarchy tree context menu. */
export type T_faProjectHierarchyTreeSortByMenuItemId =
  | 'namesDirectAsc'
  | 'namesDirectDesc'
  | 'customOrderDirectAsc'
  | 'customOrderDirectDesc'
  | 'namesRecursiveAsc'
  | 'namesRecursiveDesc'
  | 'customOrderRecursiveAsc'
  | 'customOrderRecursiveDesc'

/** One Sort by submenu row: action payload fields + title/detail keys + divider. */
export interface I_faProjectHierarchyTreeSortByMenuItem {
  detailDirectionKey: string
  detailScopeKey: string
  direction: 'asc' | 'desc'
  id: T_faProjectHierarchyTreeSortByMenuItemId
  key: 'name' | 'customOrder'
  scope: 'direct' | 'recursive'
  /**
   * Divider before this item: none for first; group after item 4; alt otherwise.
   */
  separatorBefore: 'none' | 'alt' | 'group'
  titleKey: string
}

/** Document child sort key for hierarchy Sort by modes. */
export type T_faProjectHierarchyTreeDocumentSortKey = 'name' | 'customOrder'

/** Document child sort direction for hierarchy Sort by modes. */
export type T_faProjectHierarchyTreeDocumentSortDirection = 'asc' | 'desc'

/** Direct children only vs every nested sibling bucket under the anchor. */
export type T_faProjectHierarchyTreeDocumentSortScope = 'direct' | 'recursive'

/** One parent bucket reindexed by hierarchy Sort by. */
export interface I_faProjectHierarchyTreeDocumentSortBucket {
  parentDocumentId: string | null
  placementId: string
}

export interface I_faProjectHierarchyTreeHeTreeNode {
  children: I_faProjectHierarchyTreeHeTreeNode[]
  childrenLoaded: boolean
  documentBackgroundColor?: string | null | undefined
  documentId: string | null
  documentTextColor?: string | null | undefined
  groupId: string | null
  hasChildren: boolean
  icon: string
  id: string
  label: string
  nodeKind: T_faProjectHierarchyTreeNodeKind
  placementId: string | null
  /**
   * Tag id when this row is a tag, a doc mirrored under a tag, or a tagWrapper child.
   * Null/omitted for main hierarchy rows (treat omit as null).
   */
  tagId?: string | null | undefined
  worldColor: string
  worldId: string
  /** Set on templatePlacement and addNewDocument rows. */
  documentTemplateId?: string | null | undefined
  /** Set on templatePlacement rows for add-new label resolution. */
  titlePluralTranslations?: I_faProjectDocumentTemplateTitleTranslations | undefined
  /** Set on templatePlacement rows for add-new label resolution. */
  titleSingularTranslations?: I_faProjectDocumentTemplateTitleSingularTranslations | undefined
  documentCount?: number | undefined
  categoryCount?: number | undefined
  isCategory?: boolean | undefined
  isFinished?: boolean | undefined
  isMinor?: boolean | undefined
  isDead?: boolean | undefined
  treeOrderNumber?: number | undefined
}

/** Placement metadata used to build or refresh add-new hierarchy rows. */
export type I_faProjectHierarchyTreePlacementAddNewSource = Pick<
  I_faProjectHierarchyTreeHeTreeNode,
  | 'documentTemplateId'
  | 'icon'
  | 'id'
  | 'placementId'
  | 'titlePluralTranslations'
  | 'titleSingularTranslations'
  | 'worldColor'
  | 'worldId'
>

/** Placement option for Add new document to this tag submenu. */
export interface I_faProjectHierarchyTreeTagAddDocumentPlacementOption {
  icon: string
  label: string
  nodeId: string
  templateId: string
  worldId: string
}

/** Optional preferred he-tree node id when resolving a document parent bucket. */
export interface I_faProjectHierarchyTreeDocumentParentBucketLookupOptions {
  preferredNodeId?: string | null | undefined
}
