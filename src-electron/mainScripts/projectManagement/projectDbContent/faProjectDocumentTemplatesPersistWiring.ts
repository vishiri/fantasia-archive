import type Database from 'better-sqlite3'

import {
  deleteFaProjectDocumentTemplateRow,
  getFaProjectDocumentTemplateRowById,
  insertFaProjectDocumentTemplate,
  listFaProjectDocumentTemplateDocumentCounts,
  listFaProjectDocumentTemplateRows,
  updateFaProjectDocumentTemplateRow
} from './faProjectDocumentTemplatesSqlWiring'
import { replaceFaProjectDocumentTemplatesSnapshot } from './faProjectDocumentTemplatesSnapshotWiring'
import type { I_faProjectDocumentTemplatesForProjectSettingsResult } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type {
  I_faProjectDocumentTemplate,
  I_faProjectDocumentTemplateCreateInput,
  I_faProjectDocumentTemplateListResult,
  I_faProjectDocumentTemplatePatch
} from 'app/types/I_faProjectDocumentTemplateDomain'
import {
  FA_PROJECT_DOCUMENT_TEMPLATE_ICON_MAX_LENGTH,
  FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_MAX_LENGTH
} from '../functions/faProjectDbSchemaDdl'
import {
  coerceFaProjectDocumentTemplateOptionalTextForStorage
} from './faProjectDocumentTemplatesSqlWiring'
import { serializeFaProjectDocumentTemplateTitleTranslationsJson } from 'app/src-electron/shared/faProjectDocumentTemplateTitleTranslationsSchema'
import { serializeFaProjectDocumentTemplateWorldAppendixTranslationsJson } from 'app/src-electron/shared/faProjectDocumentTemplateWorldAppendixTranslationsSchema'
import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'
import { resolveFaProjectDocumentTemplateTitleForStorage } from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateTitle_manager'
import { resolveFaProjectDocumentTemplateWorldAppendixForStorage } from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateWorldAppendix_manager'

export function createFaProjectDocumentTemplate (
  db: Database,
  input: I_faProjectDocumentTemplateCreateInput
): I_faProjectDocumentTemplate {
  return insertFaProjectDocumentTemplate(db, input.displayName, dropUndefinedRecordValues({
    icon: input.icon,
    worldAppendix: input.worldAppendix
  }) as { icon?: string; worldAppendix?: string })
}

export function updateFaProjectDocumentTemplate (
  db: Database,
  id: string,
  patch: I_faProjectDocumentTemplatePatch
): I_faProjectDocumentTemplate {
  const rowPatch: {
    displayName?: string
    icon?: string
    sortOrder?: number
    titlePluralTranslationsJson?: string
    worldAppendix?: string
    worldAppendixTranslationsJson?: string
  } = {}
  if (patch.displayName !== undefined) {
    rowPatch.displayName = patch.displayName
  }
  if (patch.titlePluralTranslations !== undefined) {
    rowPatch.titlePluralTranslationsJson = serializeFaProjectDocumentTemplateTitleTranslationsJson(
      patch.titlePluralTranslations
    )
    rowPatch.displayName = resolveFaProjectDocumentTemplateTitleForStorage(patch.titlePluralTranslations)
  }
  if (patch.worldAppendix !== undefined) {
    rowPatch.worldAppendix = coerceFaProjectDocumentTemplateOptionalTextForStorage(
      patch.worldAppendix,
      FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_MAX_LENGTH
    )
  }
  if (patch.worldAppendixTranslations !== undefined) {
    rowPatch.worldAppendixTranslationsJson =
      serializeFaProjectDocumentTemplateWorldAppendixTranslationsJson(
        patch.worldAppendixTranslations
      )
    rowPatch.worldAppendix = resolveFaProjectDocumentTemplateWorldAppendixForStorage(
      patch.worldAppendixTranslations
    )
  }
  if (patch.icon !== undefined) {
    rowPatch.icon = coerceFaProjectDocumentTemplateOptionalTextForStorage(
      patch.icon,
      FA_PROJECT_DOCUMENT_TEMPLATE_ICON_MAX_LENGTH
    )
  }
  if (patch.sortOrder !== undefined) {
    rowPatch.sortOrder = patch.sortOrder
  }
  return updateFaProjectDocumentTemplateRow(db, id, rowPatch)
}

export function deleteFaProjectDocumentTemplate (db: Database, id: string): void {
  deleteFaProjectDocumentTemplateRow(db, id)
}

export function getFaProjectDocumentTemplateById (
  db: Database,
  id: string
): I_faProjectDocumentTemplate {
  return getFaProjectDocumentTemplateRowById(db, id)
}

export function listFaProjectDocumentTemplates (
  db: Database
): I_faProjectDocumentTemplateListResult {
  return { items: listFaProjectDocumentTemplateRows(db) }
}

export function listFaProjectDocumentTemplatesForProjectSettings (
  db: Database
): I_faProjectDocumentTemplatesForProjectSettingsResult {
  const documentCounts = listFaProjectDocumentTemplateDocumentCounts(db)
  const items = listFaProjectDocumentTemplateRows(db).map((template) => ({
    createdAtMs: template.createdAtMs,
    titlePluralTranslations: template.titlePluralTranslations,
    titleSingularTranslations: template.titleSingularTranslations,
    documentCount: documentCounts[template.id] ?? 0,
    icon: template.icon,
    id: template.id,
    sortOrder: template.sortOrder,
    updatedAtMs: template.updatedAtMs,
    worldAppendixTranslations: template.worldAppendixTranslations
  }))
  return { items }
}

export {
  replaceFaProjectDocumentTemplatesSnapshot
}
