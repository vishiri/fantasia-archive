/** Shared row shape for worlds, media, and document templates in the active '.faproject' file. */
export interface I_faProjectContentNamedEntity {
  id: string
  displayName: string
  createdAtMs: number
  updatedAtMs: number
}

/** List wrapper returned by project content list IPC handlers. */
export interface I_faProjectContentListResult<T> {
  items: T[]
}

/** Table metadata for shared named-entity SQL helpers in main process. */
export interface I_faProjectNamedEntityTableSpec {
  entityLabel: string
  tableName: string
}
