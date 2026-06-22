import type { I_faProjectContentListResult } from 'app/types/I_faProjectContentShared'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'
import type { I_faProjectDocumentTemplateWorldAppendixTranslations } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'

export interface I_faProjectDocumentTemplate {
  id: string
  /** Denormalized cache for stable SQL sort (en-US fallback chain). */
  displayName: string
  titleTranslations: I_faProjectDocumentTemplateTitleTranslations
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
  titleTranslations?: I_faProjectDocumentTemplateTitleTranslations
  icon?: string
  worldAppendix?: string
}

export interface I_faProjectDocumentTemplatePatch {
  displayName?: string
  titleTranslations?: I_faProjectDocumentTemplateTitleTranslations
  icon?: string
  sortOrder?: number
  worldAppendix?: string
  worldAppendixTranslations?: I_faProjectDocumentTemplateWorldAppendixTranslations
}

/** Single row in a transactional document-templates list replace from Project Settings. */
export interface I_faProjectDocumentTemplateSnapshotItem {
  id: string
  titleTranslations: I_faProjectDocumentTemplateTitleTranslations
  icon?: string
  worldAppendixTranslations?: I_faProjectDocumentTemplateWorldAppendixTranslations
}

export type I_faProjectDocumentTemplateListResult =
  I_faProjectContentListResult<I_faProjectDocumentTemplate>

/** Fields written when inserting or updating a document template row during snapshot replace. */
export interface I_faProjectDocumentTemplateRowUpsertFields {
  displayName: string
  titleTranslationsJson: string
  icon: string
  id: string
  sortOrder: number
  worldAppendix: string
  worldAppendixTranslationsJson: string
}
