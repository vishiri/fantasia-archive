import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'

import { faProjectContentIdSchema, faProjectWorldTemplatePlacementNicknameSchema } from 'app/src-electron/shared/faProjectContentSchemaShared'
import { faProjectWorldTemplateGroupDisplayNameTranslationsSnapshotSchema } from 'app/src-electron/shared/faProjectWorldTemplateGroupDisplayNameTranslationsSchema'
import { faProjectWorldTemplatePlacementNicknameSingularTranslationsSnapshotSchema } from 'app/src-electron/shared/faProjectWorldTemplatePlacementNicknameSingularTranslationsSchema'
import { faProjectWorldTemplatePlacementNicknameTranslationsSnapshotSchema } from 'app/src-electron/shared/faProjectWorldTemplatePlacementNicknameTranslationsSchema'
import type {
  I_faProjectWorldTemplateGroupSnapshotItem,
  I_faProjectWorldTemplateLayoutSnapshot,
  I_faProjectWorldTemplatePlacementSnapshotItem
} from 'app/types/I_faProjectWorldTemplateLayoutDomain'
import type { I_faProjectWorldTemplateGroupDisplayNameTranslations } from 'app/types/I_faProjectWorldTemplateGroupDisplayNameTranslations'
import type { I_faProjectWorldTemplatePlacementNicknameSingularTranslations } from 'app/types/I_faProjectWorldTemplatePlacementNicknameSingularTranslations'
import type { I_faProjectWorldTemplatePlacementNicknameTranslations } from 'app/types/I_faProjectWorldTemplatePlacementNicknameTranslations'

import {
  resolveFaProjectWorldTemplateGroupDisplayNameForStorage
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplateGroupDisplayName_manager'
import {
  buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations,
  resolveFaProjectWorldTemplatePlacementNicknameForStorage
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'

const faProjectWorldTemplateGroupSnapshotItemInputSchema = z.object({
  displayName: z.string().optional(),
  displayNameTranslations: faProjectWorldTemplateGroupDisplayNameTranslationsSnapshotSchema,
  id: faProjectContentIdSchema,
  rootSortOrder: z.number().int().nonnegative()
}).strict()

const faProjectWorldTemplatePlacementSnapshotItemInputSchema = z.object({
  documentTemplateId: faProjectContentIdSchema,
  groupId: faProjectContentIdSchema.nullable(),
  groupSortOrder: z.number().int().nonnegative().nullable(),
  id: faProjectContentIdSchema,
  nickname: faProjectWorldTemplatePlacementNicknameSchema.optional(),
  nicknamePluralTranslations: faProjectWorldTemplatePlacementNicknameTranslationsSnapshotSchema,
  nicknameSingularTranslations: faProjectWorldTemplatePlacementNicknameSingularTranslationsSnapshotSchema.optional(),
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
  groups: z.array(faProjectWorldTemplateGroupSnapshotItemInputSchema),
  placements: z.array(faProjectWorldTemplatePlacementSnapshotItemInputSchema)
}).strict()

function mapFaProjectWorldTemplateGroupSnapshotItem (
  group: z.infer<typeof faProjectWorldTemplateGroupSnapshotItemInputSchema>
): I_faProjectWorldTemplateGroupSnapshotItem {
  const displayNameTranslations = dropUndefinedRecordValues(
    group.displayNameTranslations
  ) as I_faProjectWorldTemplateGroupDisplayNameTranslations
  const displayName = resolveFaProjectWorldTemplateGroupDisplayNameForStorage(displayNameTranslations)
  const id = group.id
  const rootSortOrder = group.rootSortOrder
  return {
    displayName,
    displayNameTranslations,
    id,
    rootSortOrder
  }
}

function mapFaProjectWorldTemplatePlacementSnapshotItem (
  placement: z.infer<typeof faProjectWorldTemplatePlacementSnapshotItemInputSchema>
): I_faProjectWorldTemplatePlacementSnapshotItem {
  const nicknamePluralTranslations = dropUndefinedRecordValues(
    placement.nicknamePluralTranslations
  ) as I_faProjectWorldTemplatePlacementNicknameTranslations
  const nicknameSingularTranslations = dropUndefinedRecordValues(
    placement.nicknameSingularTranslations ?? {}
  ) as I_faProjectWorldTemplatePlacementNicknameSingularTranslations
  const nickname = resolveFaProjectWorldTemplatePlacementNicknameForStorage(
    buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
      nicknamePluralTranslations,
      nicknameSingularTranslations
    })
  )
  const documentTemplateId = placement.documentTemplateId
  const groupId = placement.groupId
  const groupSortOrder = placement.groupSortOrder
  const id = placement.id
  const rootSortOrder = placement.rootSortOrder
  return {
    documentTemplateId,
    groupId,
    groupSortOrder,
    id,
    nickname,
    nicknamePluralTranslations,
    nicknameSingularTranslations,
    rootSortOrder
  }
}

export function parseFaProjectWorldTemplateLayoutSnapshot (
  payload: unknown
): I_faProjectWorldTemplateLayoutSnapshot {
  const parsed = faProjectWorldTemplateLayoutSnapshotSchema.parse(payload)
  const groups = parsed.groups.map(mapFaProjectWorldTemplateGroupSnapshotItem)
  const placements = parsed.placements.map(mapFaProjectWorldTemplatePlacementSnapshotItem)
  return {
    groups,
    placements
  }
}
