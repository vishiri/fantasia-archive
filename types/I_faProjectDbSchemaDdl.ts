/** Minimal prepare().get() surface for reading sqlite_master in schema patches. */
export interface I_faProjectDbPrepareGet {
  get: (...params: unknown[]) => unknown
}

/** Minimal Database surface for level-1 schema DDL and idempotent patches (better-sqlite3 compatible). */
export interface I_faProjectDbExec {
  exec: (sql: string) => void
  pragma: (name: string, options?: { simple?: boolean }) => unknown
  prepare?: (sql: string) => I_faProjectDbPrepareGet
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
