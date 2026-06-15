import type { I_faProjectContentListResult } from 'app/types/I_faProjectContentShared'

export interface I_faProjectDocumentTemplate {
  id: string
  displayName: string
  sortOrder: number
  worldAppendix: string
  icon: string
  createdAtMs: number
  updatedAtMs: number
}

export interface I_faProjectDocumentTemplateCreateInput {
  displayName: string
  icon?: string
  worldAppendix?: string
}

export interface I_faProjectDocumentTemplatePatch {
  displayName?: string
  icon?: string
  sortOrder?: number
  worldAppendix?: string
}

/** Single row in a transactional document-templates list replace from Project Settings. */
export interface I_faProjectDocumentTemplateSnapshotItem {
  id: string
  displayName: string
  icon?: string
  worldAppendix?: string
}

export type I_faProjectDocumentTemplateListResult =
  I_faProjectContentListResult<I_faProjectDocumentTemplate>

/** Fields written when inserting or updating a document template row during snapshot replace. */
export interface I_faProjectDocumentTemplateRowUpsertFields {
  displayName: string
  icon: string
  id: string
  sortOrder: number
  worldAppendix: string
}
