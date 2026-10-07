import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'

export function mapFaProjectDocumentRow (row: I_faSqlProjectDocumentRow): I_faProjectDocument {
  const id = row.id
  const worldId = row.world_id
  const templateId = row.template_id
  const placementId = row.tree_placement_id
  const parentDocumentId = row.tree_parent_document_id
  const sortOrder = row.tree_custom_sort_order
  const displayName = row.display_name
  const documentTextColor = row.document_text_color
  const documentBackgroundColor = row.document_background_color
  const isCategory = row.is_category === 1
  const isFinished = row.is_finished === 1
  const isMinor = row.is_minor === 1
  const isDead = row.is_dead === 1
  const treeOrderNumber = row.tree_order_number
  const extraClasses = row.extra_classes
  const createdAtMs = row.created_at_ms
  const updatedAtMs = row.updated_at_ms
  return {
    id,
    worldId,
    templateId,
    placementId,
    parentDocumentId,
    sortOrder,
    displayName,
    documentTextColor,
    documentBackgroundColor,
    isCategory,
    isFinished,
    isMinor,
    isDead,
    treeOrderNumber,
    extraClasses,
    createdAtMs,
    updatedAtMs
  }
}
