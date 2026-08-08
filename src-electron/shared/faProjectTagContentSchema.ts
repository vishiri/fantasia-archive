import { z } from 'zod'

import {
  faProjectContentIdSchema,
  parseFaProjectContentPlainRecord
} from 'app/src-electron/shared/faProjectContentSchemaShared'
import type {
  I_faProjectDeleteTagInput,
  I_faProjectListDocumentTagsInput,
  I_faProjectListDocumentsUnderTagInput,
  I_faProjectListTagsForWorldInput,
  I_faProjectListTagsWithDocumentCountsForWorldInput,
  I_faProjectRenameTagInput,
  I_faProjectReorderDocumentsUnderTagInput,
  I_faProjectSetDocumentTagsInput
} from 'app/types/I_faProjectTagDomain'

export const faProjectDocumentTagAssignmentSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  isNew: z.boolean().optional()
}).strict()

export const faProjectSetDocumentTagsPayloadSchema = z.object({
  documentId: faProjectContentIdSchema,
  tags: z.array(faProjectDocumentTagAssignmentSchema)
}).strict()

export const faProjectReorderDocumentsUnderTagPayloadSchema = z.object({
  tagId: faProjectContentIdSchema,
  orderedDocumentIds: z.array(faProjectContentIdSchema)
}).strict()

export const faProjectRenameTagPayloadSchema = z.object({
  tagId: faProjectContentIdSchema,
  newName: z.string()
}).strict()

export const faProjectDeleteTagPayloadSchema = z.object({
  tagId: faProjectContentIdSchema
}).strict()

export const faProjectListTagsForWorldPayloadSchema = z.object({
  worldId: faProjectContentIdSchema
}).strict()

export const faProjectListDocumentTagsPayloadSchema = z.object({
  documentId: faProjectContentIdSchema
}).strict()

export const faProjectListDocumentsUnderTagPayloadSchema = z.object({
  tagId: faProjectContentIdSchema
}).strict()

export const faProjectListTagsWithDocumentCountsForWorldPayloadSchema = z.object({
  worldId: faProjectContentIdSchema
}).strict()

export function parseFaProjectSetDocumentTagsPayload (
  payload: unknown
): I_faProjectSetDocumentTagsInput {
  return faProjectSetDocumentTagsPayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectReorderDocumentsUnderTagPayload (
  payload: unknown
): I_faProjectReorderDocumentsUnderTagInput {
  return faProjectReorderDocumentsUnderTagPayloadSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  )
}

export function parseFaProjectRenameTagPayload (payload: unknown): I_faProjectRenameTagInput {
  return faProjectRenameTagPayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectDeleteTagPayload (payload: unknown): I_faProjectDeleteTagInput {
  return faProjectDeleteTagPayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectListTagsForWorldPayload (
  payload: unknown
): I_faProjectListTagsForWorldInput {
  return faProjectListTagsForWorldPayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectListDocumentTagsPayload (
  payload: unknown
): I_faProjectListDocumentTagsInput {
  return faProjectListDocumentTagsPayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
}

export function parseFaProjectListDocumentsUnderTagPayload (
  payload: unknown
): I_faProjectListDocumentsUnderTagInput {
  return faProjectListDocumentsUnderTagPayloadSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  )
}

export function parseFaProjectListTagsWithDocumentCountsForWorldPayload (
  payload: unknown
): I_faProjectListTagsWithDocumentCountsForWorldInput {
  return faProjectListTagsWithDocumentCountsForWorldPayloadSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  )
}
