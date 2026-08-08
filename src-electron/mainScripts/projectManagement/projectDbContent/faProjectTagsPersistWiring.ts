import type Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'

import {
  FA_PROJECT_TABLE_DOCUMENT_TAGS,
  FA_PROJECT_TABLE_TAGS
} from '../functions/faProjectDbSchemaDdl'
import {
  areFaProjectTagNamesCaseInsensitiveEqual,
  normalizeFaProjectTagName
} from '../functions/faProjectTagNameNormalize'
import { listFaProjectDocumentTags } from './faProjectTagsQueryWiring'
import { insertFaProjectDocumentTagMemberships } from './faProjectTagsSetMembershipInsertWiring'
import {
  deleteFaProjectEmptyTagsByIds,
  findFaProjectTagIdByWorldAndNameNocase,
  getFaProjectDocumentWorldIdForTags,
  getFaProjectTagRowById,
  listFaProjectTagIdsForDocument,
  mapFaProjectTagRow
} from './faProjectTagsSqlHelpersWiring'
import type {
  I_faProjectDocumentTagAssignmentInput,
  I_faProjectRenameTagResult,
  I_faProjectSetDocumentTagsResult
} from 'app/types/I_faProjectTagDomain'

function createFaProjectTagRow (
  db: Database,
  worldId: string,
  name: string,
  nowMs: number
): string {
  const id = uuidv4()
  db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_TAGS} (id, world_id, name, created_at_ms, updated_at_ms) ` +
      'VALUES (?, ?, ?, ?, ?)'
  ).run(id, worldId, name, nowMs, nowMs)
  return id
}

function resolveFaProjectTagAssignmentId (
  db: Database,
  worldId: string,
  assignment: I_faProjectDocumentTagAssignmentInput,
  nowMs: number
): string {
  const name = normalizeFaProjectTagName(assignment.name)
  if (name.length === 0) {
    throw new Error('Tag name must not be empty')
  }
  if (assignment.isNew === true) {
    const existingByName = findFaProjectTagIdByWorldAndNameNocase(db, worldId, name)
    if (existingByName !== null) {
      return existingByName
    }
    return createFaProjectTagRow(db, worldId, name, nowMs)
  }
  const byId = db
    .prepare(`SELECT id, world_id FROM ${FA_PROJECT_TABLE_TAGS} WHERE id = ?`)
    .get(assignment.id) as { id: string, world_id: string } | undefined
  if (byId !== undefined) {
    if (byId.world_id !== worldId) {
      throw new Error('Tag does not belong to the document world')
    }
    return byId.id
  }
  const existingByName = findFaProjectTagIdByWorldAndNameNocase(db, worldId, name)
  if (existingByName !== null) {
    return existingByName
  }
  return createFaProjectTagRow(db, worldId, name, nowMs)
}

/**
 * Replaces document tag memberships; creates tags for new names; GCs empty tags.
 */
export function setFaProjectDocumentTags (
  db: Database,
  documentId: string,
  tags: I_faProjectDocumentTagAssignmentInput[]
): I_faProjectSetDocumentTagsResult {
  const worldId = getFaProjectDocumentWorldIdForTags(db, documentId)
  const previousTagIds = listFaProjectTagIdsForDocument(db, documentId)
  const nowMs = Date.now()
  const resolvedIds: string[] = []
  const seen = new Set<string>()
  for (const assignment of tags) {
    const tagId = resolveFaProjectTagAssignmentId(db, worldId, assignment, nowMs)
    if (seen.has(tagId)) {
      continue
    }
    seen.add(tagId)
    resolvedIds.push(tagId)
  }
  const previousOrderRows = db
    .prepare(
      `SELECT tag_id AS id, sort_order AS sort_order FROM ${FA_PROJECT_TABLE_DOCUMENT_TAGS} ` +
        'WHERE document_id = ?'
    )
    .all(documentId) as Array<{ id: string, sort_order: number }>
  const previousOrder = new Map(previousOrderRows.map((row) => [row.id, row.sort_order]))
  db.prepare(`DELETE FROM ${FA_PROJECT_TABLE_DOCUMENT_TAGS} WHERE document_id = ?`).run(documentId)
  insertFaProjectDocumentTagMemberships({
    db,
    documentId,
    previousOrder,
    resolvedIds
  })
  const removedTagIds = previousTagIds.filter((id) => !seen.has(id))
  deleteFaProjectEmptyTagsByIds(db, removedTagIds)
  return listFaProjectDocumentTags(db, documentId)
}

export {
  deleteFaProjectTag
} from './faProjectTagsSqlHelpersWiring'

export function reorderFaProjectDocumentsUnderTag (
  db: Database,
  tagId: string,
  orderedDocumentIds: string[]
): void {
  getFaProjectTagRowById(db, tagId)
  const existingRows = db
    .prepare(`SELECT document_id AS id FROM ${FA_PROJECT_TABLE_DOCUMENT_TAGS} WHERE tag_id = ?`)
    .all(tagId) as Array<{ id: string }>
  const existingSet = new Set(existingRows.map((row) => row.id))
  if (orderedDocumentIds.length !== existingSet.size) {
    throw new Error('Document list for tag reorder must match current membership')
  }
  for (const documentId of orderedDocumentIds) {
    if (!existingSet.has(documentId)) {
      throw new Error('Cannot reorder a document that is not under this tag')
    }
  }
  const updateStmt = db.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENT_TAGS} SET sort_order = ? WHERE tag_id = ? AND document_id = ?`
  )
  orderedDocumentIds.forEach((documentId, index) => {
    updateStmt.run(index, tagId, documentId)
  })
}

function mergeFaProjectTagIntoExisting (
  db: Database,
  sourceTagId: string,
  targetTagId: string
): I_faProjectRenameTagResult {
  const maxOrderRow = db
    .prepare(
      `SELECT COALESCE(MAX(sort_order), -1) AS m FROM ${FA_PROJECT_TABLE_DOCUMENT_TAGS} WHERE tag_id = ?`
    )
    .get(targetTagId) as { m: number }
  let nextOrder = maxOrderRow.m + 1
  const sourceDocs = db
    .prepare(
      `SELECT document_id AS id FROM ${FA_PROJECT_TABLE_DOCUMENT_TAGS} WHERE tag_id = ? ` +
        'ORDER BY sort_order ASC'
    )
    .all(sourceTagId) as Array<{ id: string }>
  const targetDocSet = new Set(
    (
      db
        .prepare(`SELECT document_id AS id FROM ${FA_PROJECT_TABLE_DOCUMENT_TAGS} WHERE tag_id = ?`)
        .all(targetTagId) as Array<{ id: string }>
    ).map((row) => row.id)
  )
  const insertStmt = db.prepare(
    `INSERT INTO ${FA_PROJECT_TABLE_DOCUMENT_TAGS} (document_id, tag_id, sort_order) VALUES (?, ?, ?)`
  )
  const deleteSourceLinkStmt = db.prepare(
    `DELETE FROM ${FA_PROJECT_TABLE_DOCUMENT_TAGS} WHERE document_id = ? AND tag_id = ?`
  )
  for (const doc of sourceDocs) {
    deleteSourceLinkStmt.run(doc.id, sourceTagId)
    if (targetDocSet.has(doc.id)) {
      continue
    }
    insertStmt.run(doc.id, targetTagId, nextOrder)
    nextOrder += 1
  }
  db.prepare(`DELETE FROM ${FA_PROJECT_TABLE_TAGS} WHERE id = ?`).run(sourceTagId)
  return {
    tag: mapFaProjectTagRow(getFaProjectTagRowById(db, targetTagId)),
    merged: true,
    mergedFromTagId: sourceTagId
  }
}

export function renameFaProjectTag (
  db: Database,
  tagId: string,
  newNameRaw: string
): I_faProjectRenameTagResult {
  const source = getFaProjectTagRowById(db, tagId)
  const newName = normalizeFaProjectTagName(newNameRaw)
  if (newName.length === 0) {
    throw new Error('Tag name must not be empty')
  }
  if (areFaProjectTagNamesCaseInsensitiveEqual(source.name, newName)) {
    if (source.name === newName) {
      return {
        tag: mapFaProjectTagRow(source),
        merged: false,
        mergedFromTagId: null
      }
    }
    const nowMs = Date.now()
    db.prepare(
      `UPDATE ${FA_PROJECT_TABLE_TAGS} SET name = ?, updated_at_ms = ? WHERE id = ?`
    ).run(newName, nowMs, tagId)
    return {
      tag: mapFaProjectTagRow(getFaProjectTagRowById(db, tagId)),
      merged: false,
      mergedFromTagId: null
    }
  }
  const conflictId = findFaProjectTagIdByWorldAndNameNocase(db, source.world_id, newName)
  if (conflictId === null) {
    const nowMs = Date.now()
    db.prepare(
      `UPDATE ${FA_PROJECT_TABLE_TAGS} SET name = ?, updated_at_ms = ? WHERE id = ?`
    ).run(newName, nowMs, tagId)
    return {
      tag: mapFaProjectTagRow(getFaProjectTagRowById(db, tagId)),
      merged: false,
      mergedFromTagId: null
    }
  }
  if (conflictId === tagId) {
    return {
      tag: mapFaProjectTagRow(source),
      merged: false,
      mergedFromTagId: null
    }
  }
  return mergeFaProjectTagIntoExisting(db, tagId, conflictId)
}
