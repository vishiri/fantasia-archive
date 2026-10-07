import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeListPlacementChildrenInput
} from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * In-memory hierarchy document dump for the active project session.
 * Bucket key format matches 'placementId::parentOr__root__'.
 */
export function createFaProjectHierarchyDocumentIndex () {
  const byId = new Map<string, I_faProjectDocument>()
  const bucketIdsByKey = new Map<string, Set<string>>()
  const childCountByParentId = new Map<string, number>()
  return {
    bucketIdsByKey,
    byId,
    childCountByParentId
  }
}

/**
 * Map key for a placement child bucket. Root parent uses '__root__'.
 * Must stay identical to buildFaComponentTestingPlacementDocumentChildrenKey.
 */
export function buildFaProjectHierarchyDocumentIndexBucketKey (
  placementId: string,
  parentDocumentId: string | null
): string {
  return `${placementId}::${parentDocumentId ?? '__root__'}`
}

function foldAsciiNocase (value: string): string {
  let folded = ''
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code >= 65 && code <= 90) {
      folded += String.fromCharCode(code + 32)
      continue
    }
    folded += value[index] ?? ''
  }
  return folded
}

function compareAsciiNocaseDisplayName (left: string, right: string): number {
  const foldedLeft = foldAsciiNocase(left)
  const foldedRight = foldAsciiNocase(right)
  if (foldedLeft < foldedRight) {
    return -1
  }
  if (foldedLeft > foldedRight) {
    return 1
  }
  return 0
}

/**
 * Sibling order matching tree child SQL:
 * sortOrder, display_name COLLATE NOCASE, created_at_ms, id ASC.
 */
export function compareFaProjectHierarchyDocumentIndexOrder (
  left: I_faProjectDocument,
  right: I_faProjectDocument
): number {
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder
  }
  const nameCmp = compareAsciiNocaseDisplayName(left.displayName, right.displayName)
  if (nameCmp !== 0) {
    return nameCmp
  }
  if (left.createdAtMs !== right.createdAtMs) {
    return left.createdAtMs - right.createdAtMs
  }
  if (left.id < right.id) {
    return -1
  }
  if (left.id > right.id) {
    return 1
  }
  return 0
}

function addParentOccupancy (
  index: ReturnType<typeof createFaProjectHierarchyDocumentIndex>,
  parentDocumentId: string | null
): void {
  if (parentDocumentId === null) {
    return
  }
  const nextCount = (index.childCountByParentId.get(parentDocumentId) ?? 0) + 1
  index.childCountByParentId.set(parentDocumentId, nextCount)
}

function removeParentOccupancy (
  index: ReturnType<typeof createFaProjectHierarchyDocumentIndex>,
  parentDocumentId: string | null
): void {
  if (parentDocumentId === null) {
    return
  }
  const nextCount = (index.childCountByParentId.get(parentDocumentId) ?? 0) - 1
  if (nextCount <= 0) {
    index.childCountByParentId.delete(parentDocumentId)
    return
  }
  index.childCountByParentId.set(parentDocumentId, nextCount)
}

function addDocumentToBucket (
  index: ReturnType<typeof createFaProjectHierarchyDocumentIndex>,
  document: I_faProjectDocument
): void {
  if (document.placementId === null) {
    return
  }
  const key = buildFaProjectHierarchyDocumentIndexBucketKey(
    document.placementId,
    document.parentDocumentId
  )
  const bucket = index.bucketIdsByKey.get(key)
  if (bucket === undefined) {
    index.bucketIdsByKey.set(key, new Set([document.id]))
    return
  }
  bucket.add(document.id)
}

function removeDocumentFromBucket (
  index: ReturnType<typeof createFaProjectHierarchyDocumentIndex>,
  document: I_faProjectDocument
): void {
  if (document.placementId === null) {
    return
  }
  const key = buildFaProjectHierarchyDocumentIndexBucketKey(
    document.placementId,
    document.parentDocumentId
  )
  const bucket = index.bucketIdsByKey.get(key)
  if (bucket === undefined) {
    return
  }
  bucket.delete(document.id)
  if (bucket.size === 0) {
    index.bucketIdsByKey.delete(key)
  }
}

function cloneFaProjectDocument (document: I_faProjectDocument): I_faProjectDocument {
  return {
    ...document
  }
}

export function replaceFaProjectHierarchyDocumentIndexFromDocuments (
  index: ReturnType<typeof createFaProjectHierarchyDocumentIndex>,
  items: readonly I_faProjectDocument[]
): void {
  index.byId.clear()
  index.bucketIdsByKey.clear()
  index.childCountByParentId.clear()
  for (const item of items) {
    const cloned = cloneFaProjectDocument(item)
    index.byId.set(cloned.id, cloned)
    addDocumentToBucket(index, cloned)
    addParentOccupancy(index, cloned.parentDocumentId)
  }
}

export function upsertFaProjectHierarchyDocumentIndexDocument (
  index: ReturnType<typeof createFaProjectHierarchyDocumentIndex>,
  document: I_faProjectDocument
): void {
  const previous = index.byId.get(document.id)
  if (previous !== undefined) {
    removeDocumentFromBucket(index, previous)
    removeParentOccupancy(index, previous.parentDocumentId)
  }
  const cloned = cloneFaProjectDocument(document)
  index.byId.set(cloned.id, cloned)
  addDocumentToBucket(index, cloned)
  addParentOccupancy(index, cloned.parentDocumentId)
}

export function mapFaProjectHierarchyDocumentToTreeChild (
  document: I_faProjectDocument,
  hasChildren: boolean
): I_faProjectHierarchyTreeDocumentChild {
  const {
    documentBackgroundColor,
    documentTextColor,
    displayName,
    id,
    isCategory,
    isDead,
    isFinished,
    isMinor,
    parentDocumentId,
    sortOrder,
    treeOrderNumber
  } = document
  const placementId = document.placementId ?? ''
  return {
    documentBackgroundColor,
    documentTextColor,
    displayName,
    hasChildren,
    id,
    isCategory,
    isDead,
    isFinished,
    isMinor,
    parentDocumentId,
    placementId,
    sortOrder,
    treeOrderNumber
  }
}

function indexDocumentHasSamePlacementChild (
  index: ReturnType<typeof createFaProjectHierarchyDocumentIndex>,
  document: I_faProjectDocument
): boolean {
  for (const child of index.byId.values()) {
    if (child.parentDocumentId !== document.id) {
      continue
    }
    if (child.placementId !== document.placementId) {
      continue
    }
    return true
  }
  return false
}

function listDocumentsInBucket (
  index: ReturnType<typeof createFaProjectHierarchyDocumentIndex>,
  placementId: string,
  parentDocumentId: string | null
): I_faProjectDocument[] {
  const key = buildFaProjectHierarchyDocumentIndexBucketKey(placementId, parentDocumentId)
  const bucket = index.bucketIdsByKey.get(key)
  if (bucket === undefined) {
    return []
  }
  const documents: I_faProjectDocument[] = []
  for (const documentId of bucket) {
    const document = index.byId.get(documentId)
    if (document === undefined) {
      continue
    }
    documents.push(document)
  }
  documents.sort(compareFaProjectHierarchyDocumentIndexOrder)
  return documents
}

export function listFaProjectHierarchyDocumentIndexPlacementChildren (
  index: ReturnType<typeof createFaProjectHierarchyDocumentIndex>,
  input: I_faProjectHierarchyTreeListPlacementChildrenInput
): I_faProjectHierarchyTreeDocumentChild[] {
  const parentDocumentId = input.parentDocumentId ?? null
  const documents = listDocumentsInBucket(index, input.placementId, parentDocumentId)
  return documents.map((document) => {
    const hasChildren = indexDocumentHasSamePlacementChild(index, document)
    return mapFaProjectHierarchyDocumentToTreeChild(document, hasChildren)
  })
}
