import type { I_faProjectContentListResult } from 'app/types/I_faProjectContentShared'

/** Worldbuilding document row stored in the active '.faproject' SQLite file (not markdown help docs). */
export interface I_faProjectDocument {
  id: string
  worldId: string
  templateId: string | null
  displayName: string
  createdAtMs: number
  updatedAtMs: number
}

export interface I_faProjectDocumentCreateInput {
  worldId: string
  displayName: string
  templateId?: string | null | undefined
}

export interface I_faProjectDocumentPatch {
  displayName?: string | undefined
  worldId?: string | undefined
  templateId?: string | null | undefined
}

export interface I_faProjectDocumentListFilter {
  worldId?: string | undefined
}

export type I_faProjectDocumentListResult = I_faProjectContentListResult<I_faProjectDocument>
