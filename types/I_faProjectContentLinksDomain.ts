import type { I_faProjectMedia } from 'app/types/I_faProjectMediaDomain'

export interface I_faProjectWorldMediaLinkInput {
  worldId: string
  mediaId: string
}

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

export interface I_faProjectWorldMediaListResult {
  items: I_faProjectMedia[]
}

export interface I_faProjectDocumentMediaListResult {
  items: I_faProjectMedia[]
}
