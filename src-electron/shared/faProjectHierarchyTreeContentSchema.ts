import { z } from 'zod'

import {
  faProjectContentIdSchema,
  parseFaProjectContentPlainRecord
} from 'app/src-electron/shared/faProjectContentSchemaShared'
import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'
import type {
  I_faProjectHierarchyTreeListPlacementChildrenInput,
  I_faProjectHierarchyTreeMoveDocumentInput,
  I_faProjectHierarchyTreeSearchInput
} from 'app/types/I_faProjectHierarchyTreeDomain'

const nullableParentDocumentIdSchema = z.union([
  faProjectContentIdSchema,
  z.null()
])

export const faProjectHierarchyTreeListPlacementChildrenInputSchema = z.object({
  placementId: faProjectContentIdSchema,
  parentDocumentId: nullableParentDocumentIdSchema.optional()
}).strict()

export const faProjectHierarchyTreeMoveDocumentInputSchema = z.object({
  documentId: faProjectContentIdSchema,
  targetParentDocumentId: nullableParentDocumentIdSchema,
  targetSortOrder: z.number().int().min(0)
}).strict()

export const faProjectHierarchyTreeSearchInputSchema = z.object({
  query: z.string()
}).strict()

export function parseFaProjectHierarchyTreeListPlacementChildrenInput (
  payload: unknown
): I_faProjectHierarchyTreeListPlacementChildrenInput {
  const parsed = faProjectHierarchyTreeListPlacementChildrenInputSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  )
  return dropUndefinedRecordValues(parsed) as I_faProjectHierarchyTreeListPlacementChildrenInput
}

export function parseFaProjectHierarchyTreeMoveDocumentInput (
  payload: unknown
): I_faProjectHierarchyTreeMoveDocumentInput {
  return faProjectHierarchyTreeMoveDocumentInputSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  ) as I_faProjectHierarchyTreeMoveDocumentInput
}

export function parseFaProjectHierarchyTreeSearchInput (
  payload: unknown
): I_faProjectHierarchyTreeSearchInput {
  return faProjectHierarchyTreeSearchInputSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  ) as I_faProjectHierarchyTreeSearchInput
}

export const faProjectHierarchyTreeSearchQueryPayloadSchema = z.object({
  query: z.string()
}).strict()

export function parseFaProjectHierarchyTreeSearchQueryPayload (payload: unknown): string {
  return faProjectHierarchyTreeSearchQueryPayloadSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  ).query
}
