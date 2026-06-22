import type { I_faProjectContentListResult } from 'app/types/I_faProjectContentShared'
import type { I_faProjectDocumentTemplateTitleSingularTranslations } from 'app/types/I_faProjectDocumentTemplateTitleSingularTranslations'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'
import type { I_faProjectDocumentTemplateWorldAppendixTranslations } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'

export interface I_faProjectDocumentTemplate {
  id: string
  /** Denormalized cache for stable SQL sort (en-US plural fallback chain). */
  displayName: string
  titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations,
  titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations
  sortOrder: number
  /** Denormalized cache of canonical en-US resolved world appendix for SQL joins. */
  worldAppendix: string
  worldAppendixTranslations: I_faProjectDocumentTemplateWorldAppendixTranslations
  icon: string
  createdAtMs: number
  updatedAtMs: number
}

export interface I_faProjectDocumentTemplateCreateInput {
  displayName: string
  titlePluralTranslations?: I_faProjectDocumentTemplateTitleTranslations
  titleSingularTranslations?: I_faProjectDocumentTemplateTitleSingularTranslations
  icon?: string
  worldAppendix?: string
}

export interface I_faProjectDocumentTemplatePatch {
  displayName?: string
  titlePluralTranslations?: I_faProjectDocumentTemplateTitleTranslations
  titleSingularTranslations?: I_faProjectDocumentTemplateTitleSingularTranslations
  icon?: string
  sortOrder?: number
  worldAppendix?: string
  worldAppendixTranslations?: I_faProjectDocumentTemplateWorldAppendixTranslations
}

/** Single row in a transactional document-templates list replace from Project Settings. */
export interface I_faProjectDocumentTemplateSnapshotItem {
  id: string
  titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations
  titleSingularTranslations?: I_faProjectDocumentTemplateTitleSingularTranslations
  icon?: string
  worldAppendixTranslations?: I_faProjectDocumentTemplateWorldAppendixTranslations
}

export type I_faProjectDocumentTemplateListResult =
  I_faProjectContentListResult<I_faProjectDocumentTemplate>

/** Fields written when inserting or updating a document template row during snapshot replace. */
export interface I_faProjectDocumentTemplateRowUpsertFields {
  displayName: string
  titlePluralTranslationsJson: string
  titleSingularTranslationsJson: string
  icon: string
  id: string
  sortOrder: number
  worldAppendix: string
  worldAppendixTranslationsJson: string
}
