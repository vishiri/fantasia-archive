import type {
  I_faProjectDocumentTagAssignmentInput,
  I_faProjectDocumentTagRef
} from 'app/types/I_faProjectTagDomain'

/**
 * Stable fingerprint for opened-document tags dirty compare (id order + names).
 */
export function resolveOpenedDocumentTagsFingerprint (
  tags: readonly I_faProjectDocumentTagAssignmentInput[] | readonly I_faProjectDocumentTagRef[]
): string {
  const normalized = tags.map((tag) => {
    return {
      id: tag.id,
      isNew: 'isNew' in tag && tag.isNew === true,
      name: tag.name.trim()
    }
  }).sort((left, right) => left.id.localeCompare(right.id))
  return JSON.stringify(normalized)
}

/**
 * Maps saved tag refs into draft assignment inputs for the Tags field.
 */
export function mapOpenedDocumentSavedTagsToDraft (
  tags: readonly I_faProjectDocumentTagRef[]
): I_faProjectDocumentTagAssignmentInput[] {
  return tags.map((tag) => {
    return {
      id: tag.id,
      name: tag.name
    }
  })
}

/**
 * Maps FaSelectInput tags model into setDocumentTags assignment payload.
 */
export function mapOpenedDocumentTagsDraftToSetInput (
  tags: readonly I_faProjectDocumentTagAssignmentInput[]
): I_faProjectDocumentTagAssignmentInput[] {
  return tags.map((tag) => {
    const assignment: I_faProjectDocumentTagAssignmentInput = {
      id: tag.id,
      name: tag.name.trim()
    }
    if (tag.isNew === true) {
      assignment.isNew = true
    }
    return assignment
  }).filter((tag) => tag.name.length > 0)
}
