import { z } from 'zod'

import {
  faProjectContentDisplayNameSchema,
  faProjectContentIdSchema,
  parseFaProjectContentPlainRecord
} from 'app/src-electron/shared/faProjectContentSchemaShared'
import type {
  I_faProjectDocumentTemplateCreateInput,
  I_faProjectDocumentTemplatePatch
} from 'app/types/I_faProjectDocumentTemplateDomain'

export const faProjectDocumentTemplateCreateInputSchema = z.object({
  displayName: faProjectContentDisplayNameSchema
}).strict()

export const faProjectDocumentTemplatePatchSchema = z.object({
  displayName: faProjectContentDisplayNameSchema.optional()
}).strict()

export const faProjectDocumentTemplateIdPayloadSchema = z.object({
  id: faProjectContentIdSchema
}).strict()

export function parseFaProjectDocumentTemplateCreateInput (
  payload: unknown
): I_faProjectDocumentTemplateCreateInput {
  return faProjectDocumentTemplateCreateInputSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  )
}

export function parseFaProjectDocumentTemplatePatch (
  payload: unknown
): I_faProjectDocumentTemplatePatch {
  return faProjectDocumentTemplatePatchSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectDocumentTemplateIdPayload (payload: unknown): string {
  return faProjectDocumentTemplateIdPayloadSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  ).id
}

export const faProjectDocumentTemplateUpdatePayloadSchema = z.object({
  id: faProjectContentIdSchema,
  patch: faProjectDocumentTemplatePatchSchema
}).strict()

export function parseFaProjectDocumentTemplateUpdatePayload (
  payload: unknown
): { id: string, patch: I_faProjectDocumentTemplatePatch } {
  return faProjectDocumentTemplateUpdatePayloadSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  )
}
