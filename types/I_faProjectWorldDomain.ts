import type { I_faProjectContentListResult } from 'app/types/I_faProjectContentShared'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'

/** Stored worlds.color hex (#RRGGBB). */
export type T_faProjectWorldStorageColor = `#${string}`

/** Stored worlds.color_pallete: semicolon-separated #RRGGBB list (max 2000 chars). */
export type T_faProjectWorldColorPallete = string

/** Default hex appended when the user adds a palette swatch in Project Settings. */
export const FA_PROJECT_WORLD_COLOR_PALETTE_APPEND_DEFAULT_HEX = '#FFFFFF'

/** Maximum stored length of worlds.color_pallete (semicolon-separated #RRGGBB list). */
export const FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH = 2000

export interface I_faProjectWorld {
  id: string
  /** Denormalized cache for stable SQL sort (en-US fallback chain). */
  displayName: string
  displayNameTranslations: I_faProjectWorldDisplayNameTranslations
  color: string
  colorPallete: string
  sortOrder: number
  createdAtMs: number
  updatedAtMs: number
}

export interface I_faProjectWorldCreateInput {
  displayName: string
}

export interface I_faProjectWorldPatch {
  color?: string | undefined
  colorPallete?: string | undefined
  displayName?: string | undefined
  displayNameTranslations?: I_faProjectWorldDisplayNameTranslations | undefined
  sortOrder?: number | undefined
}

import type { I_faProjectWorldTemplateLayoutSnapshot } from 'app/types/I_faProjectWorldTemplateLayoutDomain'

/** Single row in a transactional worlds list replace from Project Settings. */
export interface I_faProjectWorldSnapshotItem {
  id: string
  displayNameTranslations: I_faProjectWorldDisplayNameTranslations
  color?: string | undefined
  colorPallete?: string | undefined
  templateLayout?: I_faProjectWorldTemplateLayoutSnapshot | undefined
}

export type I_faProjectWorldListResult = I_faProjectContentListResult<I_faProjectWorld>

/** Fields written when inserting or updating a world row during snapshot replace. */
export interface I_faProjectWorldRowUpsertFields {
  color: string
  colorPallete: string
  displayName: string
  displayNameTranslationsJson: string
  id: string
  sortOrder: number
}
