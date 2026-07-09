import type { T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { resolveFaAppRouterCurrentPath } from 'app/src/scripts/appInternals/faAppRouterSession_manager'
import { resolveFaDocumentWorkspaceRouteDocumentId } from 'app/src/scripts/appRouting/functions/faDocumentWorkspacePageTransition'
import { resolveCanSaveActiveDocumentViaKeybind } from 'app/src/scripts/openedDocuments/functions/openedDocumentWorkspaceKeybindGuards'
import { resolveShowProjectDocumentControlBarSaveButtons } from 'app/src/components/projectUI/ProjectDocumentControlBar/functions/projectDocumentControlBarEditMode'

export function tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch (
  commandId: T_faKeybindCommandId
): { actionId: T_faActionId, payload: { documentId: string, keepEditMode: boolean } } | null {
  if (commandId !== 'saveDocument' && commandId !== 'saveDocumentKeepEditMode') {
    return null
  }

  const store = S_FaOpenedDocuments()
  const activeDocumentId = store.activeDocumentId
  if (activeDocumentId === null) {
    return null
  }

  const routePath = resolveFaAppRouterCurrentPath()
  const canSave = resolveCanSaveActiveDocumentViaKeybind({
    activeDocumentId,
    resolveFaDocumentWorkspaceRouteDocumentId,
    resolveShowProjectDocumentControlBarSaveButtons,
    routePath,
    tabs: store.tabs
  })

  if (!canSave) {
    return null
  }

  return {
    actionId: 'saveOpenedDocumentDisplayName',
    payload: {
      documentId: activeDocumentId,
      keepEditMode: commandId === 'saveDocumentKeepEditMode'
    }
  }
}
