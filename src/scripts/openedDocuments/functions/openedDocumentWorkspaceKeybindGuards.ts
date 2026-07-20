import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

export function resolveActiveOpenedDocumentTab (
  tabs: readonly I_faOpenedDocumentTab[],
  activeDocumentId: string | null
): I_faOpenedDocumentTab | null {
  if (activeDocumentId === null) {
    return null
  }

  return tabs.find((tab) => tab.documentId === activeDocumentId) ?? null
}

export function resolveIsOnDocumentWorkspaceRoute (
  routePath: string,
  resolveFaDocumentWorkspaceRouteDocumentId: (routePath: string) => string | null
): boolean {
  return resolveFaDocumentWorkspaceRouteDocumentId(routePath) !== null
}

export function resolveCanEditActiveDocumentViaKeybind (input: {
  activeDocumentId: string | null
  resolveShowProjectAppControlBarEditButton: (args: {
    activeDocumentTab: { editState: boolean } | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveFaDocumentWorkspaceRouteDocumentId: (routePath: string) => string | null
  routePath: string
  tabs: readonly I_faOpenedDocumentTab[]
}): boolean {
  const activeDocumentTab = resolveActiveOpenedDocumentTab(input.tabs, input.activeDocumentId)
  const isOnDocumentWorkspaceRoute = resolveIsOnDocumentWorkspaceRoute(
    input.routePath,
    input.resolveFaDocumentWorkspaceRouteDocumentId
  )

  return input.resolveShowProjectAppControlBarEditButton({
    activeDocumentTab,
    isOnDocumentWorkspaceRoute
  })
}

export function resolveCanSaveActiveDocumentViaKeybind (input: {
  activeDocumentId: string | null
  resolveShowProjectAppControlBarSaveButtons: (args: {
    activeDocumentTab: { editState: boolean } | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveFaDocumentWorkspaceRouteDocumentId: (routePath: string) => string | null
  routePath: string
  tabs: readonly I_faOpenedDocumentTab[]
}): boolean {
  const activeDocumentTab = resolveActiveOpenedDocumentTab(input.tabs, input.activeDocumentId)
  const isOnDocumentWorkspaceRoute = resolveIsOnDocumentWorkspaceRoute(
    input.routePath,
    input.resolveFaDocumentWorkspaceRouteDocumentId
  )

  return input.resolveShowProjectAppControlBarSaveButtons({
    activeDocumentTab,
    isOnDocumentWorkspaceRoute
  })
}
