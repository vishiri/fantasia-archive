import { z } from 'zod'

import {
  faProjectContentIdSchema,
  parseFaProjectContentPlainRecord
} from 'app/src-electron/shared/faProjectContentSchemaShared'
import type {
  I_faProjectDocumentMediaLinkInput,
  I_faProjectWorldDocumentTemplateLinkInput
} from 'app/types/I_faProjectContentLinksDomain'

export const faProjectDocumentMediaLinkPayloadSchema = z.object({
  documentId: faProjectContentIdSchema,
  mediaId: faProjectContentIdSchema
}).strict()

export function parseFaProjectDocumentMediaLinkPayload (
  payload: unknown
): I_faProjectDocumentMediaLinkInput {
  return faProjectDocumentMediaLinkPayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export const faProjectWorldIdOnlyPayloadSchema = z.object({
  worldId: faProjectContentIdSchema
}).strict()

export const faProjectDocumentIdOnlyPayloadSchema = z.object({
  documentId: faProjectContentIdSchema
}).strict()

export function parseFaProjectWorldIdOnlyPayload (payload: unknown): string {
  return faProjectWorldIdOnlyPayloadSchema.parse(parseFaProjectContentPlainRecord(payload)).worldId
}

export function parseFaProjectDocumentIdOnlyPayload (payload: unknown): string {
  return faProjectDocumentIdOnlyPayloadSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  ).documentId
}

export const faProjectWorldDocumentTemplateLinkPayloadSchema = z.object({
  documentTemplateId: faProjectContentIdSchema,
  worldId: faProjectContentIdSchema
}).strict()

export const faProjectDocumentTemplateIdOnlyPayloadSchema = z.object({
  documentTemplateId: faProjectContentIdSchema
}).strict()

export function parseFaProjectWorldDocumentTemplateLinkPayload (
  payload: unknown
): I_faProjectWorldDocumentTemplateLinkInput {
  return faProjectWorldDocumentTemplateLinkPayloadSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  )
}

export function parseFaProjectDocumentTemplateIdOnlyPayload (payload: unknown): string {
  return faProjectDocumentTemplateIdOnlyPayloadSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  ).documentTemplateId
}
