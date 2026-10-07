import type {
  I_createUseDialogQuickAddDocumentDeps,
  I_dialogQuickAddDocumentApi,
  I_dialogQuickAddDocumentFaSelectInputLike,
  I_dialogQuickAddDocumentSession
} from 'app/types/I_createUseDialogQuickAddDocument'
import type {
  I_dialogQuickAddDocumentTemplateSource,
  I_dialogQuickAddDocumentWorldSource
} from 'app/types/I_dialogQuickAddDocument'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

import { bindDialogQuickAddDocumentTemplateSelectRef } from './dialogQuickAddDocumentFocusHydrateWiring'
import {
  wireDialogQuickAddDocumentOpenClose,
  wireDialogQuickAddDocumentSelectHandlers
} from './dialogQuickAddDocumentInteractionWiring'

function createDialogQuickAddDocumentSession (
  deps: I_createUseDialogQuickAddDocumentDeps
): I_dialogQuickAddDocumentSession {
  const dialogModel = deps.ref(false)
  const documentName = deps.ref('')
  const worlds = deps.ref<I_dialogQuickAddDocumentWorldSource[]>([])
  const templatesById = deps.ref(new Map<string, I_dialogQuickAddDocumentTemplateSource>())
  const selectedWorldId = deps.ref<string | null>(null)
  const selectedTemplateId = deps.ref<string | null>(null)
  const templateSelectRef = deps.ref<I_dialogQuickAddDocumentFaSelectInputLike | null>(null)
  const worldSelectRef = deps.ref<I_dialogQuickAddDocumentFaSelectInputLike | null>(null)
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

  const templateOptions = deps.computed(() => {
    const world = deps.findWorldById(worlds.value, selectedWorldId.value)
    return deps.buildTemplateOptions({
      preferredLanguageCode: deps.resolvePreferredLanguageCode(),
      resolveTemplateLabel: deps.resolveTemplateOptionLabel,
      templatesById: templatesById.value,
      world
    })
  })

  return {
    dialogModel,
    documentName,
    focusGeneration,
    selectedTemplateId,
    selectedWorldId,
    showWorldSelect,
    skipNextWorldChangeReopen,
    templateOptions,
    templateSelectRef,
    templatesById,
    worldOptions,
    worldSelectRef,
    worlds
  }
}

/**
 * Composable body for Quick-Add Document (wired from dialogQuickAddDocument_manager).
 */
export function runDialogQuickAddDocumentSession (
  deps: I_createUseDialogQuickAddDocumentDeps,
  props: { directInput?: T_dialogName | undefined }
): I_dialogQuickAddDocumentApi {
  const session = createDialogQuickAddDocumentSession(deps)
  const openClose = wireDialogQuickAddDocumentOpenClose(deps, session, props)
  const selectHandlers = wireDialogQuickAddDocumentSelectHandlers(
    deps,
    session,
    openClose.closeDialog
  )

  const bindTemplateSelectRef = (el: unknown): void => {
    bindDialogQuickAddDocumentTemplateSelectRef(session.templateSelectRef, el)
  }

  const bindWorldSelectRef = (el: unknown): void => {
    bindDialogQuickAddDocumentTemplateSelectRef(session.worldSelectRef, el)
  }

  const selectedWorldOption = deps.computed(() => {
    const worldId = session.selectedWorldId.value
    if (worldId === null) {
      return null
    }
    return session.worldOptions.value.find((row) => row.id === worldId) ?? null
  })

  const selectedTemplateOption = deps.computed(() => {
    const templateId = session.selectedTemplateId.value
    if (templateId === null) {
      return null
    }
    return session.templateOptions.value.find((row) => row.id === templateId) ?? null
  })

  const onWorldFilterEnter = (event: Event): void => {
    event.preventDefault()
    event.stopPropagation()
    session.worldSelectRef.value?.hidePopup?.()
    const current = selectedWorldOption.value
    if (current === null) {
      return
    }
    const worldIdAtEnter = current.id
    void (async () => {
      await deps.nextTick()
      // Programmatic hidePopup refocuses the world field after QMenu transitionDuration (~300ms).
      // Opening the template before that refocus lands makes Quasar filter()/focusout drop the menu.
      await deps.sleep(Math.max(deps.templateFocusMs, 350))
      if (session.selectedWorldId.value !== worldIdAtEnter) {
        return
      }
      selectHandlers.onWorldSelect(current)
    })()
  }

  const {
    dialogModel,
    documentName,
    selectedTemplateId,
    selectedWorldId,
    showWorldSelect,
    templateOptions,
    templateSelectRef,
    worldOptions
  } = session
  const { onDialogHide, onDialogShow } = openClose
  const { onTemplateSelect, onWorldSelect } = selectHandlers
  return {
    bindTemplateSelectRef,
    bindWorldSelectRef,
    dialogModel,
    documentName,
    onDialogHide,
    onDialogShow,
    onTemplateSelect,
    onWorldFilterEnter,
    onWorldSelect,
    selectedTemplateId,
    selectedTemplateOption,
    selectedWorldId,
    selectedWorldOption,
    showWorldSelect,
    templateOptions,
    templateSelectRef,
    worldOptions
  }
}
