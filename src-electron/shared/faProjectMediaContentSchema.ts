import { z } from 'zod'

import {
  faProjectContentDisplayNameSchema,
  faProjectContentIdSchema,
  parseFaProjectContentPlainRecord
} from 'app/src-electron/shared/faProjectContentSchemaShared'
import type {
  I_faProjectMediaCreateInput,
  I_faProjectMediaPatch
} from 'app/types/I_faProjectMediaDomain'

export const faProjectMediaCreateInputSchema = z.object({
  displayName: faProjectContentDisplayNameSchema
}).strict()

export const faProjectMediaPatchSchema = z.object({
  displayName: faProjectContentDisplayNameSchema.optional()
}).strict()

export const faProjectMediaIdPayloadSchema = z.object({
  id: faProjectContentIdSchema
}).strict()

export function parseFaProjectMediaCreateInput (
  payload: unknown
): I_faProjectMediaCreateInput {
  return faProjectMediaCreateInputSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectMediaPatch (payload: unknown): I_faProjectMediaPatch {
  return faProjectMediaPatchSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectMediaIdPayload (payload: unknown): string {
  return faProjectMediaIdPayloadSchema.parse(parseFaProjectContentPlainRecord(payload)).id
}

export const faProjectMediaUpdatePayloadSchema = z.object({
  id: faProjectContentIdSchema,
  patch: faProjectMediaPatchSchema
}).strict()

export function parseFaProjectMediaUpdatePayload (
  payload: unknown
): { id: string, patch: I_faProjectMediaPatch } {
  return faProjectMediaUpdatePayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
}
