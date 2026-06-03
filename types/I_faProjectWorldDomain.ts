import type {
  I_faProjectContentListResult,
  I_faProjectContentNamedEntity
} from 'app/types/I_faProjectContentShared'

export type I_faProjectWorld = I_faProjectContentNamedEntity

export interface I_faProjectWorldCreateInput {
  displayName: string
}

export interface I_faProjectWorldPatch {
  displayName?: string
}

export type I_faProjectWorldListResult = I_faProjectContentListResult<I_faProjectWorld>
