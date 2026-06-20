/** One world-specific template group row in a layout snapshot (root level only). */
export interface I_faProjectWorldTemplateGroupSnapshotItem {
  id: string
  displayName: string
  rootSortOrder: number
}

/** One template placement in a world layout snapshot. */
export interface I_faProjectWorldTemplatePlacementSnapshotItem {
  id: string
  documentTemplateId: string
  groupId: string | null
  rootSortOrder: number | null
  groupSortOrder: number | null
  nickname: string
}

/** Full per-world template layout persisted with Project Settings worlds save. */
export interface I_faProjectWorldTemplateLayoutSnapshot {
  groups: I_faProjectWorldTemplateGroupSnapshotItem[]
  placements: I_faProjectWorldTemplatePlacementSnapshotItem[]
}

/** Hydrated group row for Project Settings (includes timestamps from SQLite). */
export interface I_faProjectWorldTemplateGroup {
  id: string
  worldId: string
  displayName: string
  rootSortOrder: number
  createdAtMs: number
  updatedAtMs: number
}

/** Hydrated placement row joined with global template metadata for Project Settings. */
export interface I_faProjectWorldTemplatePlacementForProjectSettings {
  id: string
  worldId: string
  documentTemplateId: string
  groupId: string | null
  rootSortOrder: number | null
  groupSortOrder: number | null
  displayName: string
  nickname: string
  worldAppendix: string
  icon: string
  documentCountInWorld: number
  createdAtMs: number
  updatedAtMs: number
}

/** Layout payload attached to each world in listWorldsForProjectSettings. */
export interface I_faProjectWorldTemplateLayoutForProjectSettings {
  groups: I_faProjectWorldTemplateGroup[]
  placements: I_faProjectWorldTemplatePlacementForProjectSettings[]
}
