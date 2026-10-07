import { Result } from 'neverthrow'

import type { I_faComponentTestingProjectContentOverrides } from 'app/types/I_faComponentTestingStoreSeed'
import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectDocumentTemplate } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectHierarchyTreeSearchResult } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'

import {
  hasFaComponentTestingProjectContentOverrides,
  resolveFaComponentTestingProjectContentEntity
} from './functions/resolveFaComponentTestingProjectContentEntity'

let activeProjectContentOverrides: I_faComponentTestingProjectContentOverrides | null = null
let hierarchySearchInvokeCount = 0
let hierarchySearchLastQuery = ''

/**
 * Installs or clears component-testing projectContent entity maps (TEST_ENV components).
 */
export function setFaComponentTestingProjectContentOverrides (
  next: I_faComponentTestingProjectContentOverrides | null
): void {
  activeProjectContentOverrides = next
  hierarchySearchInvokeCount = 0
  hierarchySearchLastQuery = ''
  syncHierarchySearchProbeToWindow()
}

/**
 * Component Playwright probe: override-path search invoke count and last query.
 */
export function getFaComponentTestingHierarchySearchProbe (): {
  callCount: number
  lastQuery: string
} {
  return {
    callCount: hierarchySearchInvokeCount,
    lastQuery: hierarchySearchLastQuery
  }
}

function syncHierarchySearchProbeToWindow (): void {
  // Node Vitest without a Window global.
  void Result.fromThrowable(() => {
    window.__faComponentTestingHierarchySearchProbe = getFaComponentTestingHierarchySearchProbe()
  }, () => undefined)()
}

/**
 * Current component-testing projectContent overrides, or null when unset.
 */
export function getFaComponentTestingProjectContentOverrides ():
I_faComponentTestingProjectContentOverrides | null {
  return activeProjectContentOverrides
}

/**
 * True when bridge getDocumentById exists or component-testing document overrides are installed.
 */
export function hasFaProjectDocumentByIdReader (): boolean {
  if (typeof window.faContentBridgeAPIs?.projectContent?.getDocumentById === 'function') {
    return true
  }
  return hasFaComponentTestingProjectContentOverrides(activeProjectContentOverrides) &&
    activeProjectContentOverrides?.documentsById !== undefined
}

/**
 * True when bridge template/world/document getters exist or component-testing overrides cover them.
 */
export function hasFaProjectContentEntityReaders (): boolean {
  const bridge = window.faContentBridgeAPIs?.projectContent
  if (
    typeof bridge?.getDocumentById === 'function' &&
    typeof bridge?.getDocumentTemplateById === 'function' &&
    typeof bridge?.getWorldById === 'function'
  ) {
    return true
  }
  const overrides = activeProjectContentOverrides
  if (overrides === null) {
    return false
  }
  return overrides.documentsById !== undefined &&
    overrides.templatesById !== undefined &&
    overrides.worldsById !== undefined
}

/**
 * Resolves a document by id from component-testing overrides, else projectContent bridge.
 */
export async function getFaProjectDocumentByIdForRenderer (
  documentId: string
): Promise<I_faProjectDocument> {
  const fromOverride = resolveFaComponentTestingProjectContentEntity(
    activeProjectContentOverrides?.documentsById,
    documentId
  )
  if (fromOverride !== undefined) {
    return fromOverride
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.getDocumentById !== 'function') {
    throw new Error('projectContent.getDocumentById unavailable')
  }
  return await api.getDocumentById(documentId)
}

/**
 * Resolves a document template by id from component-testing overrides, else bridge.
 */
export async function getFaProjectDocumentTemplateByIdForRenderer (
  templateId: string
): Promise<I_faProjectDocumentTemplate> {
  const fromOverride = resolveFaComponentTestingProjectContentEntity(
    activeProjectContentOverrides?.templatesById,
    templateId
  )
  if (fromOverride !== undefined) {
    return fromOverride
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.getDocumentTemplateById !== 'function') {
    throw new Error('projectContent.getDocumentTemplateById unavailable')
  }
  return await api.getDocumentTemplateById(templateId)
}

/**
 * Resolves a world by id from component-testing overrides, else bridge.
 */
export async function getFaProjectWorldByIdForRenderer (
  worldId: string
): Promise<I_faProjectWorld> {
  const fromOverride = resolveFaComponentTestingProjectContentEntity(
    activeProjectContentOverrides?.worldsById,
    worldId
  )
  if (fromOverride !== undefined) {
    return fromOverride
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.getWorldById !== 'function') {
    throw new Error('projectContent.getWorldById unavailable')
  }
  return await api.getWorldById(worldId)
}

/**
 * True when override children maps or bridge list+reindex are available for hierarchy sort.
 */
export function hasFaProjectHierarchySortBridge (): boolean {
  if (activeProjectContentOverrides?.placementDocumentChildrenByKey !== undefined) {
    return true
  }
  const api = window.faContentBridgeAPIs?.projectContent
  return typeof api?.listPlacementDocumentChildren === 'function' &&
    typeof api?.reindexDocumentSiblingsInHierarchy === 'function'
}

/**
 * True when searchHitsByQuery overrides or bridge searchProjectHierarchy exists.
 */
export function hasFaProjectHierarchySearch (): boolean {
  if (activeProjectContentOverrides?.searchHitsByQuery !== undefined) {
    return true
  }
  return typeof window.faContentBridgeAPIs?.projectContent?.searchProjectHierarchy === 'function'
}

/**
 * Searches hierarchy from overrides when present, else bridge.
 */
export async function searchFaProjectHierarchyForRenderer (
  query: string
): Promise<I_faProjectHierarchyTreeSearchResult> {
  const overridesMap = activeProjectContentOverrides?.searchHitsByQuery
  if (overridesMap !== undefined) {
    hierarchySearchInvokeCount += 1
    hierarchySearchLastQuery = query
    syncHierarchySearchProbeToWindow()
    const hits = overridesMap[query] ?? overridesMap['*'] ?? []
    const copiedHits = [...hits]
    return {
      hits: copiedHits,
      query
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.searchProjectHierarchy !== 'function') {
    throw new Error('projectContent.searchProjectHierarchy unavailable')
  }
  return await api.searchProjectHierarchy(query)
}
