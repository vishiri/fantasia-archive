import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'
import type { I_faSelectInputObjectItem } from 'app/types/I_faSelectInput'

/** World row used to build Quick-Search world options. */
export interface I_dialogQuickSearchDocumentWorldSource {
  id: string
  /** Raw worlds.color (#RRGGBB or empty). */
  color: string
  displayNameTranslations: I_faProjectWorldDisplayNameTranslations
  sortOrder: number
}

/** Template icon lookup row for non-category document options. */
export interface I_dialogQuickSearchDocumentTemplateIconSource {
  id: string
  icon: string
}

/** Document row used to build Quick-Search document options (categories included). */
export interface I_dialogQuickSearchDocumentDocumentSource {
  id: string
  /** Present when the document list row includes created_at_ms. */
  createdAtMs?: number
  displayName: string
  documentTextColor: string | null
  isCategory: boolean
  sortOrder: number
  templateId: string | null
}

/** FaSelectInput option for the world field (includes color for fa-color-glyph). */
export type I_dialogQuickSearchDocumentWorldOption = I_faSelectInputObjectItem

/** FaSelectInput option for the document field. */
export type I_dialogQuickSearchDocumentDocumentOption = I_faSelectInputObjectItem
