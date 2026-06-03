import { z } from 'zod'

import {
  faProjectContentDisplayNameSchema,
  faProjectContentIdSchema,
  parseFaProjectContentPlainRecord
} from 'app/src-electron/shared/faProjectContentSchemaShared'
import type {
  I_faProjectDocumentCreateInput,
  I_faProjectDocumentListFilter,
  I_faProjectDocumentPatch
} from 'app/types/I_faProjectDocumentDomain'

const nullableTemplateIdSchema = z.union([
  faProjectContentIdSchema,
  z.null()
])

export const faProjectDocumentCreateInputSchema = z.object({
  displayName: faProjectContentDisplayNameSchema,
  templateId: nullableTemplateIdSchema.optional(),
  worldId: faProjectContentIdSchema
}).strict()

export const faProjectDocumentPatchSchema = z.object({
  displayName: faProjectContentDisplayNameSchema.optional(),
  templateId: nullableTemplateIdSchema.optional(),
  worldId: faProjectContentIdSchema.optional()
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
  return faProjectDocumentCreateInputSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectDocumentPatch (payload: unknown): I_faProjectDocumentPatch {
  return faProjectDocumentPatchSchema.parse(parseFaProjectContentPlainRecord(payload))
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
  return faProjectDocumentListFilterSchema.parse(parseFaProjectContentPlainRecord(payload))
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
  return faProjectDocumentUpdatePayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
}
