import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import type { T_projectDocumentControlBarSaveButtonColor } from 'app/types/T_projectDocumentControlBarSaveButtonColor'

export function resolveShowProjectDocumentControlBarEditButton (input: {
  activeDocumentTab: { editState: boolean } | null
  isOnDocumentWorkspaceRoute: boolean
}): boolean {
  if (!input.isOnDocumentWorkspaceRoute || input.activeDocumentTab === null) {
    return false
  }

  return !input.activeDocumentTab.editState
}

export function resolveShowProjectDocumentControlBarSaveButtons (input: {
  activeDocumentTab: { editState: boolean } | null
  isOnDocumentWorkspaceRoute: boolean
}): boolean {
  if (!input.isOnDocumentWorkspaceRoute || input.activeDocumentTab === null) {
    return false
  }

  return input.activeDocumentTab.editState
}

export function resolveShowProjectDocumentControlBarDeleteButton (input: {
  activeDocumentTab: Pick<I_faOpenedDocumentTab, 'persistenceState'> | null
  isOnDocumentWorkspaceRoute: boolean
}): boolean {
  if (!input.isOnDocumentWorkspaceRoute || input.activeDocumentTab === null) {
    return false
  }

  return input.activeDocumentTab.persistenceState !== 'temporary'
}

export function resolveProjectDocumentControlBarSaveButtonColor (input: {
  hasUnsavedChanges: boolean
}): T_projectDocumentControlBarSaveButtonColor {
  if (input.hasUnsavedChanges) {
    return 'teal-14'
  }

  return 'primary-bright'
}
