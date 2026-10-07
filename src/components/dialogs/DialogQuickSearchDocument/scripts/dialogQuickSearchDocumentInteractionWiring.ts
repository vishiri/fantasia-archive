import { ResultAsync } from 'neverthrow'

import type {
  I_createUseDialogQuickSearchDocumentDeps,
  I_dialogQuickSearchDocumentSession
} from 'app/types/I_createUseDialogQuickSearchDocument'
import type { T_faSelectInputModelValue } from 'app/types/I_faSelectInput'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

import {
  cancelDialogQuickSearchDocumentFocus,
  focusDialogQuickSearchDocumentSelectAfterShow,
  hydrateDialogQuickSearchDocumentDocuments,
  hydrateDialogQuickSearchDocumentWorlds,
  reloadDialogQuickSearchDocumentDocumentsForSelectedWorld
} from './dialogQuickSearchDocumentFocusHydrateWiring'
import { wireDialogQuickSearchDocumentContextMenuHandlers } from './dialogQuickSearchDocumentContextMenuWiring'
import {
  wireDialogQuickSearchDocumentOptionAuxClickHandler,
  wireDialogQuickSearchDocumentTrailingActionHandlers
} from './dialogQuickSearchDocumentTrailingActionWiring'

/**
 * Opens/closes dialog, pre-hydrates worlds before open, documents on show,
 * and wires store/directInput watchers.
 * (Context menu + trailing row actions live in sibling wiring modules.)
 */
export function wireDialogQuickSearchDocumentOpenClose (
  deps: I_createUseDialogQuickSearchDocumentDeps,
  session: I_dialogQuickSearchDocumentSession,
  props: { directInput?: T_dialogName | undefined }
): {
    closeDialog: () => void
    onDialogHide: () => void
    onDialogShow: () => void
  } {
  const openDialog = (input: T_dialogName): void => {
    const alreadyOpen = session.dialogModel.value === true
    session.documentName.value = input
    session.documents.value = []
    session.selectedDocumentId.value = null
    session.skipNextWorldChangeReopen.value = true
    const openGeneration = session.focusGeneration.value + 1
    session.focusGeneration.value = openGeneration
    void (async () => {
      // Still open so the user is not stuck if worlds IPC fails.
      await ResultAsync.fromPromise(
        hydrateDialogQuickSearchDocumentWorlds(deps, session),
        () => undefined
      )
      if (session.focusGeneration.value !== openGeneration) {
        return
      }
      session.dialogModel.value = true
      if (alreadyOpen) {
        session.skipNextWorldChangeReopen.value = false
      }
    })()
  }

  const closeDialog = (): void => {
    cancelDialogQuickSearchDocumentFocus(session)
    session.dialogModel.value = false
  }

  const onDialogShow = (): void => {
    session.skipNextWorldChangeReopen.value = true
    const focusGeneration = session.focusGeneration.value + 1
    session.focusGeneration.value = focusGeneration
    const hydrateSearch = (async () => {
      if (session.worlds.value.length === 0) {
        await hydrateDialogQuickSearchDocumentWorlds(deps, session)
      }
      await hydrateDialogQuickSearchDocumentDocuments(deps, session)
    })()
    void hydrateSearch.finally(() => {
      if (session.focusGeneration.value !== focusGeneration) {
        return
      }
      session.skipNextWorldChangeReopen.value = false
    }).then(() => focusDialogQuickSearchDocumentSelectAfterShow(deps, session, focusGeneration))
  }

  const onDialogHide = (): void => {
    cancelDialogQuickSearchDocumentFocus(session)
    session.selectedDocumentId.value = null
    session.selectedWorldId.value = null
    session.worlds.value = []
    session.documents.value = []
    session.templateIconsById.value = new Map()
  }

  deps.watch(session.dialogModel, (isOpen) => {
    if (isOpen !== true) {
      cancelDialogQuickSearchDocumentFocus(session)
    }
  })

  deps.watch(() => deps.resolveDialogComponentStoreOrNull()?.dialogUUID, () => {
    const dialogComponentStore = deps.resolveDialogComponentStoreOrNull()
    if (
      dialogComponentStore !== null &&
      deps.isDialogQuickSearchDocumentStoreTarget(dialogComponentStore.dialogToOpen)
    ) {
      openDialog(dialogComponentStore.dialogToOpen as T_dialogName)
    }
  })

  deps.watch(() => props.directInput, () => {
    if (deps.isDialogQuickSearchDocumentDirectInput(props.directInput)) {
      openDialog(props.directInput as T_dialogName)
    }
  })

  deps.onMounted(() => {
    if (deps.isDialogQuickSearchDocumentDirectInput(props.directInput)) {
      openDialog(props.directInput as T_dialogName)
    }
  })

  deps.onBeforeUnmount(() => {
    cancelDialogQuickSearchDocumentFocus(session)
  })

  return {
    closeDialog,
    onDialogHide,
    onDialogShow
  }
}

function resolveDialogQuickSearchDocumentSelectId (
  value: T_faSelectInputModelValue | null | undefined
): string | null {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === 'string') {
    return value.length > 0 ? value : null
  }
  if (Array.isArray(value)) {
    return null
  }
  return value.id.length > 0 ? value.id : null
}

/**
 * Opens a Quick Search document pick: close+focus by default, or stay-open append
 * without binding the select model / clearing the filter (FA 1.0 parity).
 */
function createDialogQuickSearchDocumentSelectHandler (
  deps: I_createUseDialogQuickSearchDocumentDeps,
  session: I_dialogQuickSearchDocumentSession,
  closeDialog: () => void
): (value: T_faSelectInputModelValue | null | undefined) => void {
  let pendingOpenDocumentId: string | null = null

  return (value: T_faSelectInputModelValue | null | undefined): void => {
    const documentId = resolveDialogQuickSearchDocumentSelectId(value)
    if (documentId === null) {
      session.selectedDocumentId.value = null
      return
    }
    if (pendingOpenDocumentId === documentId) {
      return
    }
    pendingOpenDocumentId = documentId
    const shouldStayOpen = deps.readDisableCloseAfterSelectQuickSearch()
    session.selectedDocumentId.value = shouldStayOpen ? null : documentId
    queueMicrotask(() => {
      pendingOpenDocumentId = null
      if (!shouldStayOpen) {
        closeDialog()
        deps.runFaAction('openHierarchyTreeDocument', { documentId })
        return
      }
      // activateOnly on FaSelectInput keeps menu/filter; open background only.
      deps.runFaAction('openHierarchyTreeDocument', {
        documentId,
        openMode: 'middleBackground'
      })
    })
  }
}

/**
 * World change reloads documents and reopens the document menu; document select opens preview.
 */
export function wireDialogQuickSearchDocumentSelectHandlers (
  deps: I_createUseDialogQuickSearchDocumentDeps,
  session: I_dialogQuickSearchDocumentSession,
  closeDialog: () => void
): {
    onDocumentAddUnderClick: (documentId: string, event?: Event) => void
    onDocumentContextAddUnder: (documentId: string) => void
    onDocumentContextCopyBackgroundColor: (documentId: string) => void
    onDocumentContextCopyDocument: (documentId: string) => void
    onDocumentContextCopyName: (documentId: string) => void
    onDocumentContextCopyTextColor: (documentId: string) => void
    onDocumentContextDelete: (documentId: string) => void
    onDocumentContextEdit: (documentId: string) => void
    onDocumentContextOpen: (documentId: string) => void
    onDocumentCopyClick: (documentId: string, event?: Event) => void
    onDocumentEditClick: (documentId: string, event?: Event) => void
    onDocumentOptionAuxClick: (
      value: T_faSelectInputModelValue | null | undefined,
      event: Event
    ) => void
    onDocumentSelect: (value: T_faSelectInputModelValue | null | undefined) => void
    onWorldSelect: (value: T_faSelectInputModelValue | null | undefined) => void
  } {
  const onWorldSelect = (
    value: T_faSelectInputModelValue | null | undefined
  ): void => {
    const nextWorldId = resolveDialogQuickSearchDocumentSelectId(value)
    session.selectedWorldId.value = nextWorldId
    session.selectedDocumentId.value = null
    if (nextWorldId !== null) {
      void deps.writeLastSelectedWorldId(nextWorldId)
    }
    if (session.skipNextWorldChangeReopen.value) {
      return
    }
    void reloadDialogQuickSearchDocumentDocumentsForSelectedWorld(
      deps,
      session,
      nextWorldId
    )
  }

  const onDocumentSelect = createDialogQuickSearchDocumentSelectHandler(
    deps,
    session,
    closeDialog
  )

  const trailing = wireDialogQuickSearchDocumentTrailingActionHandlers(
    deps,
    closeDialog
  )
  const contextMenu = wireDialogQuickSearchDocumentContextMenuHandlers(
    deps,
    closeDialog
  )
  const onDocumentOptionAuxClick = wireDialogQuickSearchDocumentOptionAuxClickHandler(deps)

  const {
    onDocumentAddUnderClick,
    onDocumentCopyClick,
    onDocumentEditClick
  } = trailing
  const {
    onDocumentContextAddUnder,
    onDocumentContextCopyBackgroundColor,
    onDocumentContextCopyDocument,
    onDocumentContextCopyName,
    onDocumentContextCopyTextColor,
    onDocumentContextDelete,
    onDocumentContextEdit,
    onDocumentContextOpen
  } = contextMenu
  return {
    onDocumentAddUnderClick,
    onDocumentContextAddUnder,
    onDocumentContextCopyBackgroundColor,
    onDocumentContextCopyDocument,
    onDocumentContextCopyName,
    onDocumentContextCopyTextColor,
    onDocumentContextDelete,
    onDocumentContextEdit,
    onDocumentContextOpen,
    onDocumentCopyClick,
    onDocumentEditClick,
    onDocumentOptionAuxClick,
    onDocumentSelect,
    onWorldSelect
  }
}
