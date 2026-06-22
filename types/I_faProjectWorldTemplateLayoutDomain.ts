import type { I_faProjectWorldTemplateGroupDisplayNameTranslations } from 'app/types/I_faProjectWorldTemplateGroupDisplayNameTranslations'
import type { I_faProjectWorldTemplatePlacementNicknameSingularTranslations } from 'app/types/I_faProjectWorldTemplatePlacementNicknameSingularTranslations'
import type { I_faProjectWorldTemplatePlacementNicknameTranslations } from 'app/types/I_faProjectWorldTemplatePlacementNicknameTranslations'

/** One world-specific template group row in a layout snapshot (root level only). */
export interface I_faProjectWorldTemplateGroupSnapshotItem {
  id: string
  /** Denormalized cache for stable SQL sort (en-US fallback chain). */
  displayName: string
  displayNameTranslations: I_faProjectWorldTemplateGroupDisplayNameTranslations
  rootSortOrder: number
}

/** One template placement in a world layout snapshot. */
export interface I_faProjectWorldTemplatePlacementSnapshotItem {
  id: string
  documentTemplateId: string
  groupId: string | null
  rootSortOrder: number | null
  groupSortOrder: number | null
  /** Denormalized cache for legacy reads (en-US plural fallback chain). */
  nickname: string
  nicknamePluralTranslations: I_faProjectWorldTemplatePlacementNicknameTranslations,
  nicknameSingularTranslations: I_faProjectWorldTemplatePlacementNicknameSingularTranslations
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
  /** Denormalized cache for stable SQL sort (en-US fallback chain). */
  displayName: string
  displayNameTranslations: I_faProjectWorldTemplateGroupDisplayNameTranslations
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
  /** Denormalized cache for legacy reads (en-US plural fallback chain). */
  nickname: string
  nicknamePluralTranslations: I_faProjectWorldTemplatePlacementNicknameTranslations,
  nicknameSingularTranslations: I_faProjectWorldTemplatePlacementNicknameSingularTranslations
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
