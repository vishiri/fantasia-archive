/**
 * Per-world document tags (id + name) and document membership.
 */

/** Raw SQLite tags row (snake_case columns). */
export interface I_faSqlTagRow {
  id: string
  world_id: string
  name: string
  created_at_ms: number
  updated_at_ms: number
}

/** One tag row scoped to a world. */
export interface I_faProjectTag {
  id: string
  worldId: string
  name: string
  createdAtMs: number
  updatedAtMs: number
}

/** Tag assigned to a document (id + display name). */
export interface I_faProjectDocumentTagRef {
  id: string
  name: string
}

/** Create-or-assign chip from the Tags field (isNew until first save). */
export interface I_faProjectDocumentTagAssignmentInput {
  id: string
  name: string
  isNew?: boolean | undefined
}

export interface I_faProjectTagListResult {
  items: I_faProjectTag[]
}

export interface I_faProjectDocumentTagListResult {
  items: I_faProjectDocumentTagRef[]
}

export interface I_faProjectListTagsForWorldInput {
  worldId: string
}

export interface I_faProjectListDocumentTagsInput {
  documentId: string
}

export interface I_faProjectSetDocumentTagsInput {
  documentId: string
  tags: I_faProjectDocumentTagAssignmentInput[]
}

export interface I_faProjectSetDocumentTagsResult {
  items: I_faProjectDocumentTagRef[]
}

export interface I_faProjectReorderDocumentsUnderTagInput {
  tagId: string
  orderedDocumentIds: string[]
}

export interface I_faProjectRenameTagInput {
  tagId: string
  newName: string
}

export interface I_faProjectRenameTagResult {
  /** Surviving tag after rename or merge. */
  tag: I_faProjectTag
  /** True when the rename merged into an existing same-world tag. */
  merged: boolean
  /** Source tag id when merged (deleted); null when renamed in place. */
  mergedFromTagId: string | null
}

export interface I_faProjectDeleteTagInput {
  tagId: string
}

/** Document child under a tag, ordered by document_tags.sort_order. */
export interface I_faProjectTagDocumentChild {
  documentId: string
  displayName: string
  templateId: string | null
  isCategory: boolean
  isFinished: boolean
  isMinor: boolean
  isDead: boolean
  documentTextColor: string
  documentBackgroundColor: string
  treeOrderNumber: number
  extraClasses: string
  sortOrder: number
}

export interface I_faProjectListDocumentsUnderTagInput {
  tagId: string
}

export interface I_faProjectListDocumentsUnderTagResult {
  items: I_faProjectTagDocumentChild[]
}

export interface I_faProjectListTagsWithDocumentCountsForWorldInput {
  worldId: string
}

export interface I_faProjectTagWithDocumentCount {
  id: string
  name: string
  documentCount: number
  categoryCount: number
}

export interface I_faProjectListTagsWithDocumentCountsForWorldResult {
  items: I_faProjectTagWithDocumentCount[]
}
