import type { I_faProjectDocumentDistributionResult } from 'app/types/I_faProjectDocumentLastOpenedDomain'

/**
 * Loads document distribution for Project overview via projectContent IPC.
 * Component Playwright may seed window.__faComponentTestingProjectOverviewLists when
 * contextBridge freezes projectContent list methods.
 */
export async function listProjectOverviewDocumentDistribution (): Promise<I_faProjectDocumentDistributionResult> {
  const testingLists = window.__faComponentTestingProjectOverviewLists
  if (testingLists?.distribution !== undefined) {
    return testingLists.distribution
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listDocumentDistribution !== 'function') {
    const emptyDistribution: I_faProjectDocumentDistributionResult = {
      counts: [],
      documentTemplateTotalCount: 0,
      templates: [],
      totalDocumentCount: 0,
      worlds: []
    }
    return emptyDistribution
  }
  return await api.listDocumentDistribution()
}
