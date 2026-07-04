/** Minimal Database surface for level-1 schema DDL and idempotent patches (better-sqlite3 compatible). */
export interface I_faProjectDbExec {
  exec: (sql: string) => void
  pragma: (name: string, options?: { simple?: boolean }) => unknown
}

/** Injected documents hierarchy column + index names for idempotent schema patch. */
export interface I_faProjectDocumentsHierarchySchemaPatchDeps {
  documentsTableName: string
  placementsTableName: string
  treePlacementIdColumn: string
  treeParentDocumentIdColumn: string
  treeCustomSortOrderColumn: string
  legacyPlacementIdColumn: string
  legacyParentDocumentIdColumn: string
  legacySortOrderColumn: string
  treePlacementParentSortIndex: string
  legacyPlacementParentSortIndex: string
}
