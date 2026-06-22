import type Database from 'better-sqlite3'

import {
  FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_ICON,
  FA_PROJECT_DOCUMENT_TEMPLATE_ICON_MAX_LENGTH
} from '../functions/faProjectDbSchemaDdl'
import {
  coerceFaProjectDocumentTemplateOptionalTextForStorage,
  deleteFaProjectDocumentTemplateRow,
  insertFaProjectDocumentTemplateWithId,
  listFaProjectDocumentTemplateIds,
  updateFaProjectDocumentTemplateRow
} from './faProjectDocumentTemplatesSqlWiring'
import {
  serializeFaProjectDocumentTemplateTitleSingularTranslationsJson
} from 'app/src-electron/shared/faProjectDocumentTemplateTitleSingularTranslationsSchema'
import { serializeFaProjectDocumentTemplateTitleTranslationsJson } from 'app/src-electron/shared/faProjectDocumentTemplateTitleTranslationsSchema'
import { serializeFaProjectDocumentTemplateWorldAppendixTranslationsJson } from 'app/src-electron/shared/faProjectDocumentTemplateWorldAppendixTranslationsSchema'
import {
  resolveFaProjectDocumentTemplateTitleForStorage
} from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateTitle_manager'
import { resolveFaProjectDocumentTemplateWorldAppendixForStorage } from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateWorldAppendix_manager'
import type { I_faProjectDocumentTemplateSnapshotItem } from 'app/types/I_faProjectDocumentTemplateDomain'

/**
 * Replaces the full ordered document-templates list in one transaction (Project Settings save).
 * An empty list is valid (unlike worlds).
 */
export function replaceFaProjectDocumentTemplatesSnapshot (
  db: Database,
  items: I_faProjectDocumentTemplateSnapshotItem[]
): void {
  const runReplace = db.transaction(() => {
    const existingIds = new Set(listFaProjectDocumentTemplateIds(db))
    const snapshotIds = new Set(items.map((item) => item.id))

    for (const existingId of existingIds) {
      if (!snapshotIds.has(existingId)) {
        deleteFaProjectDocumentTemplateRow(db, existingId)
      }
    }

    items.forEach((item, index) => {
      const worldAppendixTranslations = item.worldAppendixTranslations ?? {}
      const worldAppendixTranslationsJson =
        serializeFaProjectDocumentTemplateWorldAppendixTranslationsJson(worldAppendixTranslations)
      const worldAppendix = resolveFaProjectDocumentTemplateWorldAppendixForStorage(
        worldAppendixTranslations
      )
      const icon = coerceFaProjectDocumentTemplateOptionalTextForStorage(
        item.icon ?? FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_ICON,
        FA_PROJECT_DOCUMENT_TEMPLATE_ICON_MAX_LENGTH
      )
      const titlePluralTranslations = item.titlePluralTranslations
      const titleSingularTranslations = item.titleSingularTranslations ?? {}
      const titlePluralTranslationsJson = serializeFaProjectDocumentTemplateTitleTranslationsJson(
        titlePluralTranslations
      )
      const titleSingularTranslationsJson =
        serializeFaProjectDocumentTemplateTitleSingularTranslationsJson(titleSingularTranslations)
      const displayName = resolveFaProjectDocumentTemplateTitleForStorage(titlePluralTranslations)
      if (existingIds.has(item.id)) {
        updateFaProjectDocumentTemplateRow(db, item.id, {
          displayName,
          icon,
          sortOrder: index,
          titlePluralTranslationsJson,
          titleSingularTranslationsJson,
          worldAppendix,
          worldAppendixTranslationsJson
        })
        return
      }
      insertFaProjectDocumentTemplateWithId(db, {
        displayName,
        icon,
        id: item.id,
        sortOrder: index,
        titlePluralTranslationsJson,
        titleSingularTranslationsJson,
        worldAppendix,
        worldAppendixTranslationsJson
      })
    })
  })

  runReplace()
}
