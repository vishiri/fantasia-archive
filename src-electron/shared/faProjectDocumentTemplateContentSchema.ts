import { z } from 'zod'

import {
  FA_PROJECT_DOCUMENT_TEMPLATE_ICON_MAX_LENGTH,
  FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_MAX_LENGTH
} from 'app/src-electron/mainScripts/projectManagement/functions/faProjectDbSchemaDdl'
import {
  faProjectContentDisplayNameSchema,
  faProjectContentIdSchema,
  parseFaProjectContentPlainRecord
} from 'app/src-electron/shared/faProjectContentSchemaShared'

import { parseFaProjectDocumentTemplateTitleSingularTranslationsSnapshot } from 'app/src-electron/shared/faProjectDocumentTemplateTitleSingularTranslationsSchema'
import { parseFaProjectDocumentTemplateTitleTranslationsSnapshot } from 'app/src-electron/shared/faProjectDocumentTemplateTitleTranslationsSchema'
import { parseFaProjectDocumentTemplateWorldAppendixTranslationsSnapshot } from 'app/src-electron/shared/faProjectDocumentTemplateWorldAppendixTranslationsSchema'
import type {
  I_faProjectDocumentTemplateCreateInput,
  I_faProjectDocumentTemplatePatch,
  I_faProjectDocumentTemplateSnapshotItem
} from 'app/types/I_faProjectDocumentTemplateDomain'

const faProjectDocumentTemplateWorldAppendixSchema = z.string().max(
  FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_MAX_LENGTH
)

const faProjectDocumentTemplateIconSchema = z.string().max(
  FA_PROJECT_DOCUMENT_TEMPLATE_ICON_MAX_LENGTH
)

export const faProjectDocumentTemplateCreateInputSchema = z.object({
  displayName: faProjectContentDisplayNameSchema,
  icon: faProjectDocumentTemplateIconSchema.optional(),
  worldAppendix: faProjectDocumentTemplateWorldAppendixSchema.optional()
}).strict()

export const faProjectDocumentTemplatePatchSchema = z.object({
  displayName: faProjectContentDisplayNameSchema.optional(),
  icon: faProjectDocumentTemplateIconSchema.optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  worldAppendix: faProjectDocumentTemplateWorldAppendixSchema.optional()
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

export const faProjectDocumentTemplateSnapshotItemSchema = z.object({
  icon: faProjectDocumentTemplateIconSchema.optional(),
  id: faProjectContentIdSchema,
  titlePluralTranslations: z.unknown(),
  titleSingularTranslations: z.unknown().optional(),
  worldAppendixTranslations: z.unknown().optional()
}).strict()

export const faProjectDocumentTemplatesSnapshotPayloadSchema = z.object({
  items: z.array(faProjectDocumentTemplateSnapshotItemSchema)
}).strict()

export function parseFaProjectDocumentTemplatesSnapshotPayload (
  payload: unknown
): I_faProjectDocumentTemplateSnapshotItem[] {
  const parsed = faProjectDocumentTemplatesSnapshotPayloadSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  )
  return parsed.items.map((item) => {
    const snapshotItem: I_faProjectDocumentTemplateSnapshotItem = {
      id: item.id,
      titlePluralTranslations: parseFaProjectDocumentTemplateTitleTranslationsSnapshot(
        item.titlePluralTranslations
      )
    }
    if (item.titleSingularTranslations !== undefined) {
      snapshotItem.titleSingularTranslations =
        parseFaProjectDocumentTemplateTitleSingularTranslationsSnapshot(
          item.titleSingularTranslations
        )
    }
    if (item.worldAppendixTranslations !== undefined) {
      snapshotItem.worldAppendixTranslations =
        parseFaProjectDocumentTemplateWorldAppendixTranslationsSnapshot(item.worldAppendixTranslations)
    }
    if (item.icon !== undefined) {
      snapshotItem.icon = item.icon
    }
    return snapshotItem
  })
}
