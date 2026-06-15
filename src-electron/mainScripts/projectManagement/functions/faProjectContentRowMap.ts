import type { I_faProjectContentNamedEntity } from 'app/types/I_faProjectContentShared'
import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectDocumentTemplate } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'
import type { I_faSqlDocumentTemplateRow } from 'app/types/I_faProjectContentRowMap'
import type { I_faSqlNamedEntityRow } from 'app/types/I_faProjectContentRowMap'
import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'
import type { I_faSqlWorldRow } from 'app/types/I_faProjectContentRowMap'

export function mapFaProjectWorldRow (row: I_faSqlWorldRow): I_faProjectWorld {
  return {
    id: row.id,
    displayName: row.display_name,
    color: row.color,
    colorPallete: row.color_pallete,
    sortOrder: row.sort_order,
    createdAtMs: row.created_at_ms,
    updatedAtMs: row.updated_at_ms
  }
}

export function mapFaProjectNamedEntityRow (
  row: I_faSqlNamedEntityRow
): I_faProjectContentNamedEntity {
  return {
    id: row.id,
    displayName: row.display_name,
    createdAtMs: row.created_at_ms,
    updatedAtMs: row.updated_at_ms
  }
}

export function mapFaProjectDocumentTemplateRow (
  row: I_faSqlDocumentTemplateRow
): I_faProjectDocumentTemplate {
  return {
    id: row.id,
    displayName: row.display_name,
    sortOrder: row.sort_order,
    worldAppendix: row.world_appendix,
    icon: row.icon,
    createdAtMs: row.created_at_ms,
    updatedAtMs: row.updated_at_ms
  }
}

export function mapFaProjectDocumentRow (row: I_faSqlProjectDocumentRow): I_faProjectDocument {
  return {
    id: row.id,
    worldId: row.world_id,
    templateId: row.template_id,
    displayName: row.display_name,
    createdAtMs: row.created_at_ms,
    updatedAtMs: row.updated_at_ms
  }
}
