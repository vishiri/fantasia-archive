import type { I_faProjectDocumentLastOpenedListResult } from 'app/types/I_faProjectDocumentLastOpenedDomain'

/**
 * Loads last-opened documents for Project overview via projectContent IPC.
 * Component Playwright may seed window.__faComponentTestingProjectOverviewLists when
 * contextBridge freezes projectContent list methods.
 */
export async function listProjectOverviewDocumentLastOpened (): Promise<I_faProjectDocumentLastOpenedListResult> {
  const testingLists = window.__faComponentTestingProjectOverviewLists
  if (testingLists?.lastOpened !== undefined) {
    return testingLists.lastOpened
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listDocumentLastOpened !== 'function') {
    const items: I_faProjectDocumentLastOpenedListResult['items'] = []
    return { items }
  }
  return await api.listDocumentLastOpened()
}
