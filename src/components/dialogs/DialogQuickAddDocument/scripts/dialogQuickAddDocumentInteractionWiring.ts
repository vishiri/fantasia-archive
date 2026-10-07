import { ResultAsync } from 'neverthrow'

import type {
  I_createUseDialogQuickAddDocumentDeps,
  I_dialogQuickAddDocumentSession
} from 'app/types/I_createUseDialogQuickAddDocument'
import type { T_faSelectInputModelValue } from 'app/types/I_faSelectInput'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

import {
  cancelDialogQuickAddDocumentTemplateFocus,
  focusDialogQuickAddDocumentTemplateSelectAfterShow,
  hydrateDialogQuickAddDocumentWorlds,
  scheduleDialogQuickAddDocumentTemplateFocus
} from './dialogQuickAddDocumentFocusHydrateWiring'

/**
 * Opens/closes dialog, pre-hydrates worlds before open, template focus on show,
 * and wires store/directInput watchers.
 */
export function wireDialogQuickAddDocumentOpenClose (
  deps: I_createUseDialogQuickAddDocumentDeps,
  session: I_dialogQuickAddDocumentSession,
  props: { directInput?: T_dialogName | undefined }
): {
    closeDialog: () => void
    onDialogHide: () => void
    onDialogShow: () => void
  } {
  const openDialog = (input: T_dialogName): void => {
    const alreadyOpen = session.dialogModel.value === true
    session.documentName.value = input
    session.selectedTemplateId.value = null
    session.skipNextWorldChangeReopen.value = true
    const openGeneration = session.focusGeneration.value + 1
    session.focusGeneration.value = openGeneration
    void (async () => {
      // Still open so the user is not stuck if worlds IPC fails.
      await ResultAsync.fromPromise(
        hydrateDialogQuickAddDocumentWorlds(deps, session),
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
    cancelDialogQuickAddDocumentTemplateFocus(session)
    session.dialogModel.value = false
  }

  const onDialogShow = (): void => {
    session.skipNextWorldChangeReopen.value = true
    const focusGeneration = session.focusGeneration.value + 1
    session.focusGeneration.value = focusGeneration
    const hydrateWorlds = (async () => {
      if (session.worlds.value.length === 0) {
        await hydrateDialogQuickAddDocumentWorlds(deps, session)
      }
    })()
    void hydrateWorlds.finally(() => {
      if (session.focusGeneration.value !== focusGeneration) {
        return
      }
      session.skipNextWorldChangeReopen.value = false
    }).then(() => focusDialogQuickAddDocumentTemplateSelectAfterShow(deps, session, focusGeneration))
  }

  const onDialogHide = (): void => {
    cancelDialogQuickAddDocumentTemplateFocus(session)
    session.selectedTemplateId.value = null
    session.selectedWorldId.value = null
    session.worlds.value = []
    session.templatesById.value = new Map()
  }

  deps.watch(session.dialogModel, (isOpen) => {
    if (isOpen !== true) {
      cancelDialogQuickAddDocumentTemplateFocus(session)
    }
  })

  deps.watch(() => deps.resolveDialogComponentStoreOrNull()?.dialogUUID, () => {
    const dialogComponentStore = deps.resolveDialogComponentStoreOrNull()
    if (
      dialogComponentStore !== null &&
      deps.isDialogQuickAddDocumentStoreTarget(dialogComponentStore.dialogToOpen)
    ) {
      openDialog(dialogComponentStore.dialogToOpen as T_dialogName)
    }
  })

  deps.watch(() => props.directInput, () => {
    if (deps.isDialogQuickAddDocumentDirectInput(props.directInput)) {
      openDialog(props.directInput as T_dialogName)
    }
  })

  deps.onMounted(() => {
    if (deps.isDialogQuickAddDocumentDirectInput(props.directInput)) {
      openDialog(props.directInput as T_dialogName)
    }
  })

  deps.onBeforeUnmount(() => {
    cancelDialogQuickAddDocumentTemplateFocus(session)
  })

  return {
    closeDialog,
    onDialogHide,
    onDialogShow
  }
}

function resolveDialogQuickAddDocumentSelectId (
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
 * World change / world re-click reopens template menu; template select creates a temporary document.
 */
export function wireDialogQuickAddDocumentSelectHandlers (
  deps: I_createUseDialogQuickAddDocumentDeps,
  session: I_dialogQuickAddDocumentSession,
  closeDialog: () => void
): {
    onTemplateSelect: (value: T_faSelectInputModelValue | null | undefined) => Promise<void>
    onWorldSelect: (value: T_faSelectInputModelValue | null | undefined) => void
  } {
  const onWorldSelect = (
    value: T_faSelectInputModelValue | null | undefined
  ): void => {
    // Close world menu before template openPopup (Enter reselect leaves it open otherwise).
    session.worldSelectRef.value?.hidePopup?.()
    const nextWorldId = resolveDialogQuickAddDocumentSelectId(value)
    session.selectedWorldId.value = nextWorldId
    session.selectedTemplateId.value = null
    if (nextWorldId !== null) {
      void deps.writeLastSelectedWorldId(nextWorldId)
    }
    if (session.skipNextWorldChangeReopen.value) {
      return
    }
    scheduleDialogQuickAddDocumentTemplateFocus(deps, session)
  }

  let templateCreateInFlight = false

  const onTemplateSelect = async (
    value: T_faSelectInputModelValue | null | undefined
  ): Promise<void> => {
    const templateId = resolveDialogQuickAddDocumentSelectId(value)
    if (templateId === null) {
      session.selectedTemplateId.value = null
      return
    }
    const worldId = session.selectedWorldId.value
    if (worldId === null || worldId.length === 0) {
      return
    }
    const template = session.templatesById.value.get(templateId)
    if (template === undefined || templateCreateInFlight) {
      return
    }
    templateCreateInFlight = true
    try {
      session.selectedTemplateId.value = templateId
      const displayName = deps.resolveNewDocumentDisplayName({
        preferredLanguageCode: deps.resolvePreferredLanguageCode(),
        titlePluralTranslations: template.titlePluralTranslations,
        titleSingularTranslations: template.titleSingularTranslations
      })
      // FA 1.0 closes first, then creates — keeps dismiss snappy while create runs.
      closeDialog()
      await deps.createTemporaryDocument({
        displayName,
        templateId,
        worldId
      })
    } catch (error: unknown) {
      deps.reportTemporaryDocumentCreateFailure(error)
    } finally {
      templateCreateInFlight = false
    }
  }

  return {
    onTemplateSelect,
    onWorldSelect
  }
}
