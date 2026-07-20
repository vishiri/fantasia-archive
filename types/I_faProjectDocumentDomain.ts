import type { I_faProjectContentListResult } from 'app/types/I_faProjectContentShared'

/** Worldbuilding document row stored in the active '.faproject' SQLite file (not markdown help docs). */
export interface I_faProjectDocument {
  id: string
  worldId: string
  templateId: string | null
  placementId: string | null
  parentDocumentId: string | null
  sortOrder: number
  displayName: string
  documentTextColor: string | null
  documentBackgroundColor: string | null
  isCategory: boolean
  isFinished: boolean
  isMinor: boolean
  isDead: boolean
  treeOrderNumber: number
  createdAtMs: number
  updatedAtMs: number
}

export interface I_faProjectDocumentCreateInput {
  /** Optional client UUID; main assigns a fresh id when omitted or already taken. */
  id?: string | undefined
  worldId: string
  displayName: string
  templateId?: string | null | undefined
  placementId?: string | null | undefined
  parentDocumentId?: string | null | undefined
  sortOrder?: number | undefined
  documentTextColor?: string | null | undefined
  documentBackgroundColor?: string | null | undefined
  isCategory?: boolean | undefined
  isFinished?: boolean | undefined
  isMinor?: boolean | undefined
  isDead?: boolean | undefined
  treeOrderNumber?: number | undefined
}

export interface I_faProjectDocumentPatch {
  displayName?: string | undefined
  worldId?: string | undefined
  templateId?: string | null | undefined
  placementId?: string | null | undefined
  parentDocumentId?: string | null | undefined
  sortOrder?: number | undefined
  documentTextColor?: string | null | undefined
  documentBackgroundColor?: string | null | undefined
  isCategory?: boolean | undefined
  isFinished?: boolean | undefined
  isMinor?: boolean | undefined
  isDead?: boolean | undefined
  treeOrderNumber?: number | undefined
}

export interface I_faProjectDocumentListFilter {
  worldId?: string | undefined
}

export type I_faProjectDocumentListResult = I_faProjectContentListResult<I_faProjectDocument>
