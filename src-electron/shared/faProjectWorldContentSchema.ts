import { z } from 'zod'

import { isFaProjectWorldColorPalleteStorageValue } from 'app/src-electron/mainScripts/projectManagement/functions/coerceFaProjectWorldColorPalleteForStorage'
import {
  FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH
} from 'app/src-electron/mainScripts/projectManagement/functions/faProjectDbSchemaDdl'
import {
  faProjectContentDisplayNameSchema,
  faProjectContentIdSchema,
  parseFaProjectContentPlainRecord
} from 'app/src-electron/shared/faProjectContentSchemaShared'
import { faProjectWorldTemplateLayoutSnapshotSchema, parseFaProjectWorldTemplateLayoutSnapshot } from 'app/src-electron/shared/faProjectWorldTemplateLayoutSchema'
import { parseFaProjectWorldDisplayNameTranslationsSnapshot } from 'app/src-electron/shared/faProjectWorldDisplayNameTranslationsSchema'
import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'
import type {
  I_faProjectWorldCreateInput,
  I_faProjectWorldPatch,
  I_faProjectWorldSnapshotItem
} from 'app/types/I_faProjectWorldDomain'

export const faProjectWorldColorPalleteSchema = z.string().max(
  FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH
).refine(
  (value) => isFaProjectWorldColorPalleteStorageValue(
    value,
    FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH
  ),
  { message: 'Invalid color_pallete value' }
)

export const faProjectWorldCreateInputSchema = z.object({
  displayName: faProjectContentDisplayNameSchema
}).strict()

export const faProjectWorldPatchSchema = z.object({
  color: z.string().optional(),
  colorPallete: faProjectWorldColorPalleteSchema.optional(),
  displayName: faProjectContentDisplayNameSchema.optional(),
  sortOrder: z.number().int().nonnegative().optional()
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
  const parsed = faProjectWorldPatchSchema.parse(parseFaProjectContentPlainRecord(payload))
  return dropUndefinedRecordValues(parsed) as I_faProjectWorldPatch
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
  const parsed = faProjectWorldUpdatePayloadSchema.parse(parseFaProjectContentPlainRecord(payload))
  return {
    id: parsed.id,
    patch: dropUndefinedRecordValues(parsed.patch) as I_faProjectWorldPatch
  }
}

export const faProjectWorldSnapshotItemSchema = z.object({
  color: z.string().optional(),
  colorPallete: faProjectWorldColorPalleteSchema.optional(),
  displayNameTranslations: z.unknown(),
  id: faProjectContentIdSchema,
  templateLayout: faProjectWorldTemplateLayoutSnapshotSchema.optional()
}).strict()

export const faProjectWorldsSnapshotPayloadSchema = z.object({
  items: z.array(faProjectWorldSnapshotItemSchema).min(1)
}).strict()

export function parseFaProjectWorldsSnapshotPayload (
  payload: unknown
): I_faProjectWorldSnapshotItem[] {
  const parsed = faProjectWorldsSnapshotPayloadSchema.parse(
    parseFaProjectContentPlainRecord(payload)
  )
  return parsed.items.map((item) => {
    const snapshotItem: I_faProjectWorldSnapshotItem = {
      displayNameTranslations: parseFaProjectWorldDisplayNameTranslationsSnapshot(
        item.displayNameTranslations
      ),
      id: item.id
    }

    if (item.color !== undefined) {
      snapshotItem.color = item.color
    }

    if (item.colorPallete !== undefined) {
      snapshotItem.colorPallete = item.colorPallete
    }

    if (item.templateLayout !== undefined) {
      snapshotItem.templateLayout = parseFaProjectWorldTemplateLayoutSnapshot(item.templateLayout)
    }

    return snapshotItem
  })
}
