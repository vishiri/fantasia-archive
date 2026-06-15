import type Database from 'better-sqlite3'

import {
  FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_ICON,
  FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_WORLD_APPENDIX,
  FA_PROJECT_DOCUMENT_TEMPLATE_ICON_MAX_LENGTH,
  FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_MAX_LENGTH
} from '../functions/faProjectDbSchemaDdl'
import {
  coerceFaProjectDocumentTemplateOptionalTextForStorage,
  deleteFaProjectDocumentTemplateRow,
  insertFaProjectDocumentTemplateWithId,
  listFaProjectDocumentTemplateIds,
  updateFaProjectDocumentTemplateRow
} from './faProjectDocumentTemplatesSqlWiring'
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
      const worldAppendix = coerceFaProjectDocumentTemplateOptionalTextForStorage(
        item.worldAppendix ?? FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_WORLD_APPENDIX,
        FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_MAX_LENGTH
      )
      const icon = coerceFaProjectDocumentTemplateOptionalTextForStorage(
        item.icon ?? FA_PROJECT_DOCUMENT_TEMPLATE_DEFAULT_ICON,
        FA_PROJECT_DOCUMENT_TEMPLATE_ICON_MAX_LENGTH
      )
      const displayName = item.displayName.trim()
      if (existingIds.has(item.id)) {
        updateFaProjectDocumentTemplateRow(db, item.id, {
          displayName,
          icon,
          sortOrder: index,
          worldAppendix
        })
        return
      }
      insertFaProjectDocumentTemplateWithId(db, {
        displayName,
        icon,
        id: item.id,
        sortOrder: index,
        worldAppendix
      })
    })
  })

  runReplace()
}
