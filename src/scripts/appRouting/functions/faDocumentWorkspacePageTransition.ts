import type {
  T_faAppShellPageTransitionBindings,
  T_faAppShellPageTransitionResolution
} from 'app/types/I_faAppShellPageTransition'

/** FA 1.0 used 50ms; 150ms keeps tab switches perceptible on modern displays. */
export const FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_MS = 150

export const FA_DOCUMENT_WORKSPACE_ROUTE_PATH_PREFIX = '/home/document/'

export const FA_WORKSPACE_HOME_ROUTE_PATH = '/home'

export const FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS: T_faAppShellPageTransitionBindings = {
  appear: true,
  duration: FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_MS,
  enterActiveClass: 'fa-documentWorkspacePage-enter-active',
  enterFromClass: 'fa-documentWorkspacePage-enter-from',
  enterToClass: 'fa-documentWorkspacePage-enter-to',
  leaveActiveClass: 'fa-documentWorkspacePage-leave-active',
  leaveFromClass: 'fa-documentWorkspacePage-leave-from',
  leaveToClass: 'fa-documentWorkspacePage-leave-to'
}

export function isFaDocumentWorkspaceRoutePath (routePath: string): boolean {
  return routePath.startsWith(FA_DOCUMENT_WORKSPACE_ROUTE_PATH_PREFIX)
}

export function isFaWorkspaceHomeRoutePath (routePath: string): boolean {
  return routePath === FA_WORKSPACE_HOME_ROUTE_PATH
}

function usesFaDocumentWorkspacePageTransition (
  fromRoutePath: string,
  toRoutePath: string
): boolean {
  if (
    isFaDocumentWorkspaceRoutePath(fromRoutePath) &&
    isFaDocumentWorkspaceRoutePath(toRoutePath)
  ) {
    return true
  }

  if (
    isFaWorkspaceHomeRoutePath(fromRoutePath) &&
    isFaDocumentWorkspaceRoutePath(toRoutePath)
  ) {
    return true
  }

  if (
    isFaDocumentWorkspaceRoutePath(fromRoutePath) &&
    isFaWorkspaceHomeRoutePath(toRoutePath)
  ) {
    return true
  }

  return false
}

export function resolveFaDocumentWorkspaceRouteDocumentId (routePath: string): string | null {
  if (!isFaDocumentWorkspaceRoutePath(routePath)) {
    return null
  }

  const documentId = routePath.slice(FA_DOCUMENT_WORKSPACE_ROUTE_PATH_PREFIX.length)
  return documentId.length > 0 ? documentId : null
}

export function resolveFaAppShellPageTransitionForRouteChange (input: {
  documentWorkspacePageTransitionBindings: T_faAppShellPageTransitionBindings
  fromRoutePath: string
  shellPageTransitionBindings: T_faAppShellPageTransitionBindings
  toRoutePath: string
}): T_faAppShellPageTransitionResolution {
  if (usesFaDocumentWorkspacePageTransition(input.fromRoutePath, input.toRoutePath)) {
    return {
      bindings: input.documentWorkspacePageTransitionBindings,
      mode: 'out-in'
    }
  }

  return {
    bindings: input.shellPageTransitionBindings,
    mode: 'out-in'
  }
}
