import type {
  I_createUseDialogQuickSearchDocumentDeps,
  I_dialogQuickSearchDocumentApi,
  I_dialogQuickSearchDocumentFaSelectInputLike,
  I_dialogQuickSearchDocumentSession
} from 'app/types/I_createUseDialogQuickSearchDocument'
import type {
  I_dialogQuickSearchDocumentDocumentSource,
  I_dialogQuickSearchDocumentTemplateIconSource,
  I_dialogQuickSearchDocumentWorldSource
} from 'app/types/I_dialogQuickSearchDocument'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

import { bindDialogQuickSearchDocumentSelectRef } from './dialogQuickSearchDocumentFocusHydrateWiring'
import {
  wireDialogQuickSearchDocumentOpenClose,
  wireDialogQuickSearchDocumentSelectHandlers
} from './dialogQuickSearchDocumentInteractionWiring'

function createDialogQuickSearchDocumentSession (
  deps: I_createUseDialogQuickSearchDocumentDeps
): I_dialogQuickSearchDocumentSession {
  const dialogModel = deps.ref(false)
  const documentName = deps.ref('')
  const worlds = deps.ref<I_dialogQuickSearchDocumentWorldSource[]>([])
  const documents = deps.ref<I_dialogQuickSearchDocumentDocumentSource[]>([])
  const templateIconsById = deps.ref(new Map<string, I_dialogQuickSearchDocumentTemplateIconSource>())
  const selectedWorldId = deps.ref<string | null>(null)
  const selectedDocumentId = deps.ref<string | null>(null)
  const documentSelectRef = deps.ref<I_dialogQuickSearchDocumentFaSelectInputLike | null>(null)
  const focusGeneration = deps.ref(0)
  const skipNextWorldChangeReopen = deps.ref(false)
  deps.registerComponentDialogStackGuard(dialogModel)

  const worldOptions = deps.computed(() => {
    return deps.buildWorldOptions({
      preferredLanguageCode: deps.resolvePreferredLanguageCode(),
      resolveWorldLabel: deps.resolveWorldOptionLabel,
      worlds: worlds.value
    })
  })

  const showWorldSelect = deps.computed(() => worldOptions.value.length > 1)

  const documentOptions = deps.computed(() => {
    return deps.buildDocumentOptions({
      documents: documents.value,
      resolveDocumentIcon: deps.resolveDocumentOptionIcon,
      templatesById: templateIconsById.value
    })
  })

  return {
    dialogModel,
    documentName,
    documentOptions,
    documentSelectRef,
    documents,
    focusGeneration,
    selectedDocumentId,
    selectedWorldId,
    showWorldSelect,
    skipNextWorldChangeReopen,
    templateIconsById,
    worldOptions,
    worlds
  }
}

/**
 * Composable body for Quick-Search Document (wired from dialogQuickSearchDocument_manager).
 */
export function runDialogQuickSearchDocumentSession (
  deps: I_createUseDialogQuickSearchDocumentDeps,
  props: { directInput?: T_dialogName | undefined }
): I_dialogQuickSearchDocumentApi {
  const session = createDialogQuickSearchDocumentSession(deps)
  const openClose = wireDialogQuickSearchDocumentOpenClose(deps, session, props)
  const selectHandlers = wireDialogQuickSearchDocumentSelectHandlers(
    deps,
    session,
    openClose.closeDialog
  )

  const bindDocumentSelectRef = (el: unknown): void => {
    bindDialogQuickSearchDocumentSelectRef(session.documentSelectRef, el)
  }

  const selectedWorldOption = deps.computed(() => {
    const worldId = session.selectedWorldId.value
    if (worldId === null) {
      return null
    }
    return session.worldOptions.value.find((row) => row.id === worldId) ?? null
  })

  const selectedDocumentOption = deps.computed(() => {
    const documentId = session.selectedDocumentId.value
    if (documentId === null) {
      return null
    }
    return session.documentOptions.value.find((row) => row.id === documentId) ?? null
  })

  const documentSelectActivateOnly = deps.computed(() => {
    return deps.readDisableCloseAfterSelectQuickSearch()
  })

  const {
    dialogModel,
    documentName,
    documentOptions,
    documentSelectRef,
    selectedDocumentId,
    selectedWorldId,
    showWorldSelect,
    worldOptions
  } = session
  const { onDialogHide, onDialogShow } = openClose
  const {
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
  } = selectHandlers
  return {
    bindDocumentSelectRef,
    dialogModel,
    documentName,
    documentOptions,
    documentSelectActivateOnly,
    documentSelectRef,
    onDialogHide,
    onDialogShow,
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
    onWorldSelect,
    selectedDocumentId,
    selectedDocumentOption,
    selectedWorldId,
    selectedWorldOption,
    showWorldSelect,
    worldOptions
  }
}
