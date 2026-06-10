import type { I_faProjectContentListResult } from 'app/types/I_faProjectContentShared'

export interface I_faProjectWorld {
  id: string
  displayName: string
  color: string
  sortOrder: number
  createdAtMs: number
  updatedAtMs: number
}

export interface I_faProjectWorldCreateInput {
  displayName: string
}

export interface I_faProjectWorldPatch {
  displayName?: string
}

export type I_faProjectWorldListResult = I_faProjectContentListResult<I_faProjectWorld>
