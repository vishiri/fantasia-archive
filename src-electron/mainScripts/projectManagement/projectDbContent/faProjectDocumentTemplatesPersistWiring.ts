import type Database from 'better-sqlite3'

import { FA_PROJECT_TABLE_DOCUMENT_TEMPLATES } from '../functions/faProjectDbSchemaDdl'
import {
  createFaProjectNamedEntity,
  deleteFaProjectNamedEntity,
  getFaProjectNamedEntityById,
  listFaProjectNamedEntities,
  updateFaProjectNamedEntity
} from './faProjectContentNamedEntitySqlWiring'
import type {
  I_faProjectDocumentTemplate,
  I_faProjectDocumentTemplateCreateInput,
  I_faProjectDocumentTemplateListResult,
  I_faProjectDocumentTemplatePatch
} from 'app/types/I_faProjectDocumentTemplateDomain'

const TEMPLATE_SPEC = {
  entityLabel: 'Document template',
  tableName: FA_PROJECT_TABLE_DOCUMENT_TEMPLATES
}

export function createFaProjectDocumentTemplate (
  db: Database,
  input: I_faProjectDocumentTemplateCreateInput
): I_faProjectDocumentTemplate {
  return createFaProjectNamedEntity(db, TEMPLATE_SPEC, input.displayName)
}

export function updateFaProjectDocumentTemplate (
  db: Database,
  id: string,
  patch: I_faProjectDocumentTemplatePatch
): I_faProjectDocumentTemplate {
  return updateFaProjectNamedEntity(db, TEMPLATE_SPEC, id, patch.displayName)
}

export function deleteFaProjectDocumentTemplate (db: Database, id: string): void {
  deleteFaProjectNamedEntity(db, TEMPLATE_SPEC, id)
}

export function getFaProjectDocumentTemplateById (
  db: Database,
  id: string
): I_faProjectDocumentTemplate {
  return getFaProjectNamedEntityById(db, TEMPLATE_SPEC, id)
}

export function listFaProjectDocumentTemplates (
  db: Database
): I_faProjectDocumentTemplateListResult {
  return { items: listFaProjectNamedEntities(db, TEMPLATE_SPEC) }
}
