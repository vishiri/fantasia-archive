import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/functions/faQuasarDialogStandardTransition'

import { createFaAppShellPageTransitionExports } from './functions/createFaAppShellPageTransitionExports'

export {
  FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_BINDINGS,
  FA_DOCUMENT_WORKSPACE_PAGE_TRANSITION_MS,
  FA_DOCUMENT_WORKSPACE_ROUTE_PATH_PREFIX,
  isFaDocumentWorkspaceRoutePath,
  resolveFaAppShellPageTransitionForRouteChange,
  resolveFaDocumentWorkspaceRouteDocumentId
} from './functions/faDocumentWorkspacePageTransition'

const faAppShellPageTransitionExports = createFaAppShellPageTransitionExports({
  quasarDialogStandardTransitionMs: FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS
})

export const FA_APP_SHELL_PAGE_TRANSITION_MS =
  faAppShellPageTransitionExports.FA_APP_SHELL_PAGE_TRANSITION_MS

export const FA_APP_SHELL_DRAWER_TRANSITION_MS =
  faAppShellPageTransitionExports.FA_APP_SHELL_DRAWER_TRANSITION_MS

export const FA_APP_SHELL_PAGE_TRANSITION_BINDINGS =
  faAppShellPageTransitionExports.FA_APP_SHELL_PAGE_TRANSITION_BINDINGS
