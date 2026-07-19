import { z } from 'zod'

import {
  faProjectContentDisplayNameSchema,
  faProjectContentIdSchema,
  parseFaProjectContentPlainRecord
} from 'app/src-electron/shared/faProjectContentSchemaShared'
import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'
import type {
  I_faProjectDocumentCreateInput,
  I_faProjectDocumentListFilter,
  I_faProjectDocumentPatch
} from 'app/types/I_faProjectDocumentDomain'

const nullableTemplateIdSchema = z.union([
  faProjectContentIdSchema,
  z.null()
])

export const faProjectDocumentNullableHexColorSchema = z.union([
  z.literal(''),
  z.null(),
  z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid document appearance color')
]).transform((value) => (value === '' ? null : value))

export const faProjectDocumentCreateInputSchema = z.object({
  displayName: faProjectContentDisplayNameSchema,
  id: faProjectContentIdSchema.optional(),
  templateId: nullableTemplateIdSchema.optional(),
  worldId: faProjectContentIdSchema,
  placementId: nullableTemplateIdSchema.optional(),
  parentDocumentId: nullableTemplateIdSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
  documentTextColor: faProjectDocumentNullableHexColorSchema.optional(),
  documentBackgroundColor: faProjectDocumentNullableHexColorSchema.optional(),
  isCategory: z.boolean().optional(),
  isFinished: z.boolean().optional(),
  isMinor: z.boolean().optional(),
  isDead: z.boolean().optional()
}).strict()

export const faProjectDocumentPatchSchema = z.object({
  displayName: faProjectContentDisplayNameSchema.optional(),
  templateId: nullableTemplateIdSchema.optional(),
  worldId: faProjectContentIdSchema.optional(),
  placementId: nullableTemplateIdSchema.optional(),
  parentDocumentId: nullableTemplateIdSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
  documentTextColor: faProjectDocumentNullableHexColorSchema.optional(),
  documentBackgroundColor: faProjectDocumentNullableHexColorSchema.optional(),
  isCategory: z.boolean().optional(),
  isFinished: z.boolean().optional(),
  isMinor: z.boolean().optional(),
  isDead: z.boolean().optional()
}).strict()

export const faProjectDocumentIdPayloadSchema = z.object({
  id: faProjectContentIdSchema
}).strict()

export const faProjectDocumentListFilterSchema = z.object({
  worldId: faProjectContentIdSchema.optional()
}).strict()

export const faProjectSetDocumentWorldPayloadSchema = z.object({
  documentId: faProjectContentIdSchema,
  worldId: faProjectContentIdSchema
}).strict()

export const faProjectSetDocumentTemplatePayloadSchema = z.object({
  documentId: faProjectContentIdSchema,
  templateId: nullableTemplateIdSchema
}).strict()

export function parseFaProjectDocumentCreateInput (
  payload: unknown
): I_faProjectDocumentCreateInput {
  const parsed = faProjectDocumentCreateInputSchema.parse(parseFaProjectContentPlainRecord(payload))
  return dropUndefinedRecordValues(parsed) as I_faProjectDocumentCreateInput
}

export function parseFaProjectDocumentPatch (payload: unknown): I_faProjectDocumentPatch {
  const parsed = faProjectDocumentPatchSchema.parse(parseFaProjectContentPlainRecord(payload))
  return dropUndefinedRecordValues(parsed) as I_faProjectDocumentPatch
}

export function parseFaProjectDocumentIdPayload (payload: unknown): string {
  return faProjectDocumentIdPayloadSchema.parse(parseFaProjectContentPlainRecord(payload)).id
}

export function parseFaProjectDocumentListFilter (
  payload: unknown
): I_faProjectDocumentListFilter | undefined {
  if (payload === undefined) {
    return undefined
  }
  const parsed = faProjectDocumentListFilterSchema.parse(parseFaProjectContentPlainRecord(payload))
  return dropUndefinedRecordValues(parsed) as I_faProjectDocumentListFilter
}

export function parseFaProjectSetDocumentWorldPayload (
  payload: unknown
): { documentId: string, worldId: string } {
  return faProjectSetDocumentWorldPayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectSetDocumentTemplatePayload (
  payload: unknown
): { documentId: string, templateId: string | null } {
  return faProjectSetDocumentTemplatePayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export const faProjectDocumentUpdatePayloadSchema = z.object({
  id: faProjectContentIdSchema,
  patch: faProjectDocumentPatchSchema
}).strict()

export function parseFaProjectDocumentUpdatePayload (
  payload: unknown
): { id: string, patch: I_faProjectDocumentPatch } {
  const parsed = faProjectDocumentUpdatePayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
  return {
    id: parsed.id,
    patch: dropUndefinedRecordValues(parsed.patch) as I_faProjectDocumentPatch
  }
}
