/** Dev-only hierarchy test document seed: one placement input row. */
export interface I_faProjectHierarchyTestPlacementSeedInput {
  placementId: string
  worldId: string
  documentTemplateId: string
  templateDisplayName: string
}

/** Per-placement counts and ordering context for seed planning. */
export interface I_faProjectHierarchyTestPlacementSeedContext {
  existingSeedCount: number
  usedSuffixes: number[]
  maxSortOrder: number | null
}

/** One planned documents row insert for hierarchy QA seeding. */
export interface I_faProjectHierarchyTestDocumentInsertPlan {
  id: string
  displayName: string
  worldId: string
  templateId: string
  placementId: string
  parentDocumentId: null
  sortOrder: number
  createdAtMs: number
  updatedAtMs: number
}
