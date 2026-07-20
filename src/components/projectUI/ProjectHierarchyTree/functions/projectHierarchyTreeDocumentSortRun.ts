import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeDocumentSortBucket,
  I_faProjectHierarchyTreeListPlacementChildrenInput,
  I_faProjectHierarchyTreeReindexDocumentSiblingsInput,
  T_faProjectHierarchyTreeDocumentSortDirection,
  T_faProjectHierarchyTreeDocumentSortKey,
  T_faProjectHierarchyTreeDocumentSortScope
} from 'app/types/I_faProjectHierarchyTreeDomain'

const FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY = Number.MIN_SAFE_INTEGER

function compareDisplayNames (
  left: string,
  right: string,
  direction: T_faProjectHierarchyTreeDocumentSortDirection
): number {
  const compared = left.localeCompare(right, undefined, { sensitivity: 'accent' })
  if (direction === 'asc') {
    return compared
  }
  return -compared
}

function compareIds (left: string, right: string): number {
  if (left < right) {
    return -1
  }
  if (left > right) {
    return 1
  }
  return 0
}

function isEmptyCustomOrder (value: number | null | undefined): boolean {
  if (value === null || value === undefined) {
    return true
  }
  return value === FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
}

/**
 * Orders hierarchy document children for Sort by name or Custom order modes.
 * Empty Custom order is always last; Custom order ties break by name in the same direction.
 */
export function compareProjectHierarchyTreeDocumentChildrenForSort (
  left: I_faProjectHierarchyTreeDocumentChild,
  right: I_faProjectHierarchyTreeDocumentChild,
  key: T_faProjectHierarchyTreeDocumentSortKey,
  direction: T_faProjectHierarchyTreeDocumentSortDirection
): number {
  if (key === 'name') {
    const byName = compareDisplayNames(left.displayName, right.displayName, direction)
    if (byName !== 0) {
      return byName
    }
    return compareIds(left.id, right.id)
  }

  const leftEmpty = isEmptyCustomOrder(left.treeOrderNumber)
  const rightEmpty = isEmptyCustomOrder(right.treeOrderNumber)
  if (leftEmpty !== rightEmpty) {
    if (leftEmpty) {
      return 1
    }
    return -1
  }
  if (!leftEmpty && !rightEmpty) {
    const leftOrder = left.treeOrderNumber as number
    const rightOrder = right.treeOrderNumber as number
    if (leftOrder !== rightOrder) {
      if (direction === 'asc') {
        return leftOrder - rightOrder
      }
      return rightOrder - leftOrder
    }
  }

  const byName = compareDisplayNames(left.displayName, right.displayName, direction)
  if (byName !== 0) {
    return byName
  }
  return compareIds(left.id, right.id)
}

export function sortProjectHierarchyTreeDocumentChildren (
  items: readonly I_faProjectHierarchyTreeDocumentChild[],
  key: T_faProjectHierarchyTreeDocumentSortKey,
  direction: T_faProjectHierarchyTreeDocumentSortDirection
): I_faProjectHierarchyTreeDocumentChild[] {
  return [...items].sort((left, right) => {
    return compareProjectHierarchyTreeDocumentChildrenForSort(left, right, key, direction)
  })
}

/**
 * Collects parent buckets to reindex for direct or recursive Sort by.
 */
export async function collectProjectHierarchyTreeDocumentSortBuckets (input: {
  listPlacementDocumentChildren: (
    listInput: I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => Promise<{ items: I_faProjectHierarchyTreeDocumentChild[] }>
  root: I_faProjectHierarchyTreeDocumentSortBucket
  scope: T_faProjectHierarchyTreeDocumentSortScope
}): Promise<I_faProjectHierarchyTreeDocumentSortBucket[]> {
  const buckets: I_faProjectHierarchyTreeDocumentSortBucket[] = [input.root]
  if (input.scope === 'direct') {
    return buckets
  }

  const queue: Array<string | null> = [input.root.parentDocumentId]
  const visitedParents = new Set<string | null>([input.root.parentDocumentId])

  while (queue.length > 0) {
    const parentDocumentId = queue.shift() as string | null
    const listed = await input.listPlacementDocumentChildren({
      parentDocumentId,
      placementId: input.root.placementId
    })
    for (const child of listed.items) {
      if (!child.hasChildren) {
        continue
      }
      if (visitedParents.has(child.id)) {
        continue
      }
      visitedParents.add(child.id)
      buckets.push({
        parentDocumentId: child.id,
        placementId: input.root.placementId
      })
      queue.push(child.id)
    }
  }

  return buckets
}

/**
 * Sorts one sibling bucket and persists via reindex IPC.
 */
export async function reindexProjectHierarchyTreeDocumentSortBucket (input: {
  bucket: I_faProjectHierarchyTreeDocumentSortBucket
  direction: T_faProjectHierarchyTreeDocumentSortDirection
  key: T_faProjectHierarchyTreeDocumentSortKey
  listPlacementDocumentChildren: (
    listInput: I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => Promise<{ items: I_faProjectHierarchyTreeDocumentChild[] }>
  reindexDocumentSiblingsInHierarchy: (
    reindexInput: I_faProjectHierarchyTreeReindexDocumentSiblingsInput
  ) => Promise<unknown>
}): Promise<void> {
  const listed = await input.listPlacementDocumentChildren({
    parentDocumentId: input.bucket.parentDocumentId,
    placementId: input.bucket.placementId
  })
  if (listed.items.length === 0) {
    return
  }
  const ordered = sortProjectHierarchyTreeDocumentChildren(
    listed.items,
    input.key,
    input.direction
  )
  const orderedDocumentIds = ordered.map((item) => item.id)
  const movedDocumentId = orderedDocumentIds[0] as string
  await input.reindexDocumentSiblingsInHierarchy({
    movedDocumentId,
    orderedDocumentIds,
    parentDocumentId: input.bucket.parentDocumentId,
    placementId: input.bucket.placementId
  })
}

/**
 * Runs direct or recursive Sort by across hierarchy sibling buckets.
 * Returns buckets considered for tree refresh. Mid-run failure throws Error with
 * completedBuckets for partial UI refresh of buckets already persisted.
 */
export async function runProjectHierarchyTreeDocumentSort (input: {
  direction: T_faProjectHierarchyTreeDocumentSortDirection
  key: T_faProjectHierarchyTreeDocumentSortKey
  listPlacementDocumentChildren: (
    listInput: I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => Promise<{ items: I_faProjectHierarchyTreeDocumentChild[] }>
  reindexDocumentSiblingsInHierarchy: (
    reindexInput: I_faProjectHierarchyTreeReindexDocumentSiblingsInput
  ) => Promise<unknown>
  root: I_faProjectHierarchyTreeDocumentSortBucket
  scope: T_faProjectHierarchyTreeDocumentSortScope
}): Promise<I_faProjectHierarchyTreeDocumentSortBucket[]> {
  const buckets = await collectProjectHierarchyTreeDocumentSortBuckets({
    listPlacementDocumentChildren: input.listPlacementDocumentChildren,
    root: input.root,
    scope: input.scope
  })
  const completedBuckets: I_faProjectHierarchyTreeDocumentSortBucket[] = []
  try {
    for (const bucket of buckets) {
      await reindexProjectHierarchyTreeDocumentSortBucket({
        bucket,
        direction: input.direction,
        key: input.key,
        listPlacementDocumentChildren: input.listPlacementDocumentChildren,
        reindexDocumentSiblingsInHierarchy: input.reindexDocumentSiblingsInHierarchy
      })
      completedBuckets.push(bucket)
    }
  } catch (error) {
    if (error instanceof Error) {
      const withBuckets = error as Error & {
        completedBuckets: I_faProjectHierarchyTreeDocumentSortBucket[]
      }
      withBuckets.completedBuckets = completedBuckets
      throw withBuckets
    }
    const wrapped = new Error(String(error)) as Error & {
      completedBuckets: I_faProjectHierarchyTreeDocumentSortBucket[]
    }
    wrapped.completedBuckets = completedBuckets
    throw wrapped
  }
  return buckets
}

/**
 * Maps a sort sibling bucket to the he-tree node id whose children must reload.
 */
export function resolveProjectHierarchyTreeDocumentSortBucketTreeNodeId (
  bucket: I_faProjectHierarchyTreeDocumentSortBucket
): string {
  if (bucket.parentDocumentId !== null) {
    return bucket.parentDocumentId
  }
  return bucket.placementId
}
