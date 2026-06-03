import type {
  I_faProjectContentListResult,
  I_faProjectContentNamedEntity
} from 'app/types/I_faProjectContentShared'

export type I_faProjectDocumentTemplate = I_faProjectContentNamedEntity

export interface I_faProjectDocumentTemplateCreateInput {
  displayName: string
}

export interface I_faProjectDocumentTemplatePatch {
  displayName?: string
}

export type I_faProjectDocumentTemplateListResult =
  I_faProjectContentListResult<I_faProjectDocumentTemplate>
