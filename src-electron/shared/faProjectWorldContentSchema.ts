import { z } from 'zod'

import {
  faProjectContentDisplayNameSchema,
  faProjectContentIdSchema,
  parseFaProjectContentPlainRecord
} from 'app/src-electron/shared/faProjectContentSchemaShared'
import type {
  I_faProjectWorldCreateInput,
  I_faProjectWorldPatch
} from 'app/types/I_faProjectWorldDomain'

export const faProjectWorldCreateInputSchema = z.object({
  displayName: faProjectContentDisplayNameSchema
}).strict()

export const faProjectWorldPatchSchema = z.object({
  displayName: faProjectContentDisplayNameSchema.optional()
}).strict()

export const faProjectWorldIdPayloadSchema = z.object({
  id: faProjectContentIdSchema
}).strict()

export function parseFaProjectWorldCreateInput (
  payload: unknown
): I_faProjectWorldCreateInput {
  return faProjectWorldCreateInputSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectWorldPatch (payload: unknown): I_faProjectWorldPatch {
  return faProjectWorldPatchSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectWorldIdPayload (payload: unknown): string {
  return faProjectWorldIdPayloadSchema.parse(parseFaProjectContentPlainRecord(payload)).id
}

export const faProjectWorldUpdatePayloadSchema = z.object({
  id: faProjectContentIdSchema,
  patch: faProjectWorldPatchSchema
}).strict()

export function parseFaProjectWorldUpdatePayload (
  payload: unknown
): { id: string, patch: I_faProjectWorldPatch } {
  return faProjectWorldUpdatePayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
}
