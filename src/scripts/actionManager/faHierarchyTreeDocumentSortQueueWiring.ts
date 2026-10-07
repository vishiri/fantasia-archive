import type { I_faActionPayloadMap } from 'app/types/I_faActionManagerDomain'

const hierarchyDocumentSortTailByKey = new Map<string, Promise<void>>()

export function resolveFaHierarchyTreeDocumentSortQueueKey (
  payload: I_faActionPayloadMap['sortHierarchyTreeDocuments']
): string {
  if (payload.nodeKind === 'tag') {
    const tagId = payload.tagId ?? ''
    return `tag:${tagId}`
  }
  return `placement:${payload.placementId}`
}

export function enqueueFaHierarchyTreeDocumentSort<T> (
  key: string,
  run: () => Promise<T>
): Promise<T> {
  const previous = hierarchyDocumentSortTailByKey.get(key) ?? Promise.resolve()
  const runAfterPrevious = previous.then(run, run)
  const settled = runAfterPrevious.then(() => undefined, () => undefined)
  hierarchyDocumentSortTailByKey.set(key, settled)
  return runAfterPrevious
}
