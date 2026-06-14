import type { I_faProjectDocumentTemplate } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectMedia } from 'app/types/I_faProjectMediaDomain'
import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'

export interface I_faProjectDocumentMediaLinkInput {
  documentId: string
  mediaId: string
}

export interface I_faProjectSetDocumentWorldInput {
  documentId: string
  worldId: string
}

export interface I_faProjectSetDocumentTemplateInput {
  documentId: string
  templateId: string | null
}

export interface I_faProjectDocumentMediaListResult {
  items: I_faProjectMedia[]
}

export interface I_faProjectWorldDocumentTemplateLinkInput {
  worldId: string
  documentTemplateId: string
}

export interface I_faProjectWorldDocumentTemplateListResult {
  items: I_faProjectDocumentTemplate[]
}

export interface I_faProjectDocumentTemplateWorldListResult {
  items: I_faProjectWorld[]
}
