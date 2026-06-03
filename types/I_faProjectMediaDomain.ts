import type {
  I_faProjectContentListResult,
  I_faProjectContentNamedEntity
} from 'app/types/I_faProjectContentShared'

export type I_faProjectMedia = I_faProjectContentNamedEntity

export interface I_faProjectMediaCreateInput {
  displayName: string
}

export interface I_faProjectMediaPatch {
  displayName?: string
}

export type I_faProjectMediaListResult = I_faProjectContentListResult<I_faProjectMedia>
