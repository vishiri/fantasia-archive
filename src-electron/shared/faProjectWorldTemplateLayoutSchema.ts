import { z } from 'zod'

import { faProjectContentDisplayNameSchema, faProjectContentIdSchema } from 'app/src-electron/shared/faProjectContentSchemaShared'
import type { I_faProjectWorldTemplateLayoutSnapshot } from 'app/types/I_faProjectWorldTemplateLayoutDomain'

export const faProjectWorldTemplateGroupSnapshotItemSchema = z.object({
  displayName: faProjectContentDisplayNameSchema,
  id: faProjectContentIdSchema,
  rootSortOrder: z.number().int().nonnegative()
}).strict()

export const faProjectWorldTemplatePlacementSnapshotItemSchema = z.object({
  documentTemplateId: faProjectContentIdSchema,
  groupId: faProjectContentIdSchema.nullable(),
  groupSortOrder: z.number().int().nonnegative().nullable(),
  id: faProjectContentIdSchema,
  rootSortOrder: z.number().int().nonnegative().nullable()
}).strict().superRefine((value, ctx) => {
  if (value.groupId === null) {
    if (value.rootSortOrder === null || value.groupSortOrder !== null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Root placement requires rootSortOrder and null groupSortOrder'
      })
    }
    return
  }
  if (value.groupSortOrder === null || value.rootSortOrder !== null) {
    ctx.addIssue({
      code: 'custom',
      message: 'Grouped placement requires groupSortOrder and null rootSortOrder'
    })
  }
})

export const faProjectWorldTemplateLayoutSnapshotSchema = z.object({
  groups: z.array(faProjectWorldTemplateGroupSnapshotItemSchema),
  placements: z.array(faProjectWorldTemplatePlacementSnapshotItemSchema)
}).strict()

export function parseFaProjectWorldTemplateLayoutSnapshot (
  payload: unknown
): I_faProjectWorldTemplateLayoutSnapshot {
  return faProjectWorldTemplateLayoutSnapshotSchema.parse(payload)
}
