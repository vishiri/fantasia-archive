import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import type { T_projectAppControlBarSaveButtonColor } from 'app/types/T_projectAppControlBarSaveButtonColor'

export function resolveShowProjectAppControlBarEditButton (input: {
  activeDocumentTab: { editState: boolean } | null
  isOnDocumentWorkspaceRoute: boolean
}): boolean {
  if (!input.isOnDocumentWorkspaceRoute || input.activeDocumentTab === null) {
    return false
  }

  return !input.activeDocumentTab.editState
}

export function resolveShowProjectAppControlBarSaveButtons (input: {
  activeDocumentTab: { editState: boolean } | null
  isOnDocumentWorkspaceRoute: boolean
}): boolean {
  if (!input.isOnDocumentWorkspaceRoute || input.activeDocumentTab === null) {
    return false
  }

  return input.activeDocumentTab.editState
}

export function resolveShowProjectAppControlBarDeleteButton (input: {
  activeDocumentTab: Pick<I_faOpenedDocumentTab, 'persistenceState'> | null
  isOnDocumentWorkspaceRoute: boolean
}): boolean {
  if (!input.isOnDocumentWorkspaceRoute || input.activeDocumentTab === null) {
    return false
  }

  return input.activeDocumentTab.persistenceState !== 'temporary'
}

export function resolveProjectAppControlBarSaveButtonColor (input: {
  hasUnsavedChanges: boolean
}): T_projectAppControlBarSaveButtonColor {
  if (input.hasUnsavedChanges) {
    return 'teal-14'
  }

  return 'primary-bright'
}
