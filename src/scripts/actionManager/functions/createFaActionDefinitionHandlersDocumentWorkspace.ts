import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faTemporaryOpenedDocumentCreateInput } from 'app/types/I_faOpenedDocumentsDomain'

type T_faOpenedDocumentsStoreForDocumentWorkspaceKeybinds = {
  activeDocumentId: string | null
  createTemporaryDocument: (input: I_faTemporaryOpenedDocumentCreateInput) => Promise<string>
  enterDocumentEditMode: (documentId: string) => void
  focusTab: (documentId: string) => Promise<void>
  moveActiveDocumentTab: (direction: 'left' | 'right') => void
  saveDocumentDisplayName: (
    documentId: string,
    input: { keepEditMode: boolean }
  ) => Promise<void>
  tabs: readonly I_faOpenedDocumentTab[]
}

type T_faDocumentWorkspaceKeybindHandlerDeps = {
  S_FaOpenedDocuments: () => T_faOpenedDocumentsStoreForDocumentWorkspaceKeybinds
  getCurrentRoutePath: () => string
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  notifyCreate: (options: {
    group: boolean
    message: string
    type: 'positive'
  }) => void
  resolveAdjacentOpenedDocumentTabId: (
    tabs: readonly I_faOpenedDocumentTab[],
    activeDocumentId: string | null,
    direction: 'previous' | 'next'
  ) => string | null
  resolveCanEditActiveDocumentViaKeybind: (input: {
    activeDocumentId: string | null
    resolveFaDocumentWorkspaceRouteDocumentId: (routePath: string) => string | null
    resolveShowProjectAppControlBarEditButton: (args: {
      activeDocumentTab: { editState: boolean } | null
      isOnDocumentWorkspaceRoute: boolean
    }) => boolean
    routePath: string
    tabs: readonly I_faOpenedDocumentTab[]
  }) => boolean
  resolveFaDocumentWorkspaceRouteDocumentId: (routePath: string) => string | null
  resolveShowProjectAppControlBarEditButton: (input: {
    activeDocumentTab: { editState: boolean } | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
}

function readOpenedDocumentsSession (
  deps: Pick<
    T_faDocumentWorkspaceKeybindHandlerDeps,
    'S_FaOpenedDocuments' | 'getCurrentRoutePath'
  >
): {
    activeDocumentId: string | null
    routePath: string
    tabs: readonly I_faOpenedDocumentTab[]
  } {
  const store = deps.S_FaOpenedDocuments()
  return {
    activeDocumentId: store.activeDocumentId,
    routePath: deps.getCurrentRoutePath(),
    tabs: store.tabs
  }
}

function createHandleEditActiveDocument (
  deps: T_faDocumentWorkspaceKeybindHandlerDeps
): () => void {
  return function handleEditActiveDocument (): void {
    const { activeDocumentId, routePath, tabs } = readOpenedDocumentsSession(deps)
    if (activeDocumentId === null) {
      return
    }

    const canEdit = deps.resolveCanEditActiveDocumentViaKeybind({
      activeDocumentId,
      resolveFaDocumentWorkspaceRouteDocumentId: deps.resolveFaDocumentWorkspaceRouteDocumentId,
      resolveShowProjectAppControlBarEditButton: deps.resolveShowProjectAppControlBarEditButton,
      routePath,
      tabs
    })

    if (!canEdit) {
      return
    }

    deps.S_FaOpenedDocuments().enterDocumentEditMode(activeDocumentId)
  }
}

function createHandleCreateTemporaryOpenedDocument (
  deps: T_faDocumentWorkspaceKeybindHandlerDeps
): (payload: I_faTemporaryOpenedDocumentCreateInput) => Promise<void> {
  return async function handleCreateTemporaryOpenedDocument (
    payload: I_faTemporaryOpenedDocumentCreateInput
  ): Promise<void> {
    await deps.S_FaOpenedDocuments().createTemporaryDocument(payload)
  }
}

function createHandleSaveOpenedDocumentDisplayName (
  deps: T_faDocumentWorkspaceKeybindHandlerDeps
): (payload: { documentId: string, keepEditMode: boolean }) => Promise<void> {
  return async function handleSaveOpenedDocumentDisplayName (payload: {
    documentId: string
    keepEditMode: boolean
  }): Promise<void> {
    await deps.S_FaOpenedDocuments().saveDocumentDisplayName(payload.documentId, {
      keepEditMode: payload.keepEditMode
    })
    deps.notifyCreate({
      group: false,
      type: 'positive',
      message: deps.i18n.global.t('globalFunctionality.faOpenedDocuments.saveSuccess')
    })
  }
}

function createHandleMoveActiveOpenedDocumentTabLeft (
  deps: T_faDocumentWorkspaceKeybindHandlerDeps
): () => void {
  return function handleMoveActiveOpenedDocumentTabLeft (): void {
    deps.S_FaOpenedDocuments().moveActiveDocumentTab('left')
  }
}

function createHandleMoveActiveOpenedDocumentTabRight (
  deps: T_faDocumentWorkspaceKeybindHandlerDeps
): () => void {
  return function handleMoveActiveOpenedDocumentTabRight (): void {
    deps.S_FaOpenedDocuments().moveActiveDocumentTab('right')
  }
}

function createHandleFocusPreviousOpenedDocumentTab (
  deps: T_faDocumentWorkspaceKeybindHandlerDeps
): () => Promise<void> {
  return async function handleFocusPreviousOpenedDocumentTab (): Promise<void> {
    const { activeDocumentId, tabs } = readOpenedDocumentsSession(deps)
    const adjacentDocumentId = deps.resolveAdjacentOpenedDocumentTabId(
      tabs,
      activeDocumentId,
      'previous'
    )
    if (adjacentDocumentId === null) {
      return
    }

    await deps.S_FaOpenedDocuments().focusTab(adjacentDocumentId)
  }
}

function createHandleFocusNextOpenedDocumentTab (
  deps: T_faDocumentWorkspaceKeybindHandlerDeps
): () => Promise<void> {
  return async function handleFocusNextOpenedDocumentTab (): Promise<void> {
    const { activeDocumentId, tabs } = readOpenedDocumentsSession(deps)
    const adjacentDocumentId = deps.resolveAdjacentOpenedDocumentTabId(
      tabs,
      activeDocumentId,
      'next'
    )
    if (adjacentDocumentId === null) {
      return
    }

    await deps.S_FaOpenedDocuments().focusTab(adjacentDocumentId)
  }
}

export function createFaActionDefinitionHandlersDocumentWorkspace (
  deps: T_faDocumentWorkspaceKeybindHandlerDeps
): {
    handleCreateTemporaryOpenedDocument: (
      payload: I_faTemporaryOpenedDocumentCreateInput
    ) => Promise<void>
    handleEditActiveDocument: () => void
    handleFocusNextOpenedDocumentTab: () => Promise<void>
    handleFocusPreviousOpenedDocumentTab: () => Promise<void>
    handleMoveActiveOpenedDocumentTabLeft: () => void
    handleMoveActiveOpenedDocumentTabRight: () => void
    handleSaveOpenedDocumentDisplayName: (payload: {
      documentId: string
      keepEditMode: boolean
    }) => Promise<void>
  } {
  const handleEditActiveDocument = createHandleEditActiveDocument(deps)
  const handleCreateTemporaryOpenedDocument = createHandleCreateTemporaryOpenedDocument(deps)
  const handleSaveOpenedDocumentDisplayName = createHandleSaveOpenedDocumentDisplayName(deps)
  const handleFocusPreviousOpenedDocumentTab = createHandleFocusPreviousOpenedDocumentTab(deps)
  const handleFocusNextOpenedDocumentTab = createHandleFocusNextOpenedDocumentTab(deps)
  const handleMoveActiveOpenedDocumentTabLeft = createHandleMoveActiveOpenedDocumentTabLeft(deps)
  const handleMoveActiveOpenedDocumentTabRight = createHandleMoveActiveOpenedDocumentTabRight(deps)

  return {
    handleCreateTemporaryOpenedDocument,
    handleEditActiveDocument,
    handleFocusNextOpenedDocumentTab,
    handleFocusPreviousOpenedDocumentTab,
    handleMoveActiveOpenedDocumentTabLeft,
    handleMoveActiveOpenedDocumentTabRight,
    handleSaveOpenedDocumentDisplayName
  }
}
