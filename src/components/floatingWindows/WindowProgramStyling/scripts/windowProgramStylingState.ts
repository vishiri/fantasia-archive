import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'
import { S_FaProgramStyling } from 'app/src/stores/S_FaProgramStyling'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'
import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'
import { scheduleFaFloatingWindowDelayedHide } from 'app/src/scripts/floatingWindows/faFloatingWindowScheduleDelayedHide'

import {
  useMonacoMount,
  type I_FaMonacoMount
} from 'app/src/components/floatingWindows/WindowProgramStyling/scripts/useMonacoMount'

/**
 * Internal alias for the Pinia generic store accessed via 'S_DialogComponent'.
 * Avoids importing the Pinia 'StoreGeneric' type into the window template.
 */
type T_resolvedDialogComponentStore = ReturnType<typeof S_DialogComponent> | null

function resolveDialogComponentStore (): T_resolvedDialogComponentStore {
  try {
    return S_DialogComponent()
  } catch {
    return null
  }
}

/**
 * Public surface returned by 'useWindowProgramStyling'. Exposes:
 *  - reactive 'windowModel' for visibility,
 *  - 'workingCss' (the editor's working copy that lives only while the window is open),
 *  - the Monaco mount handle,
 *  - lifecycle helpers (open / show / hide / save).
 */
export interface I_FaWindowProgramStylingState {
  closeWithoutSaving: () => void
  documentName: Ref<T_dialogName>
  editorHostRef: Ref<HTMLDivElement | null>
  monaco: I_FaMonacoMount
  onWindowHide: () => void
  onWindowShow: () => Promise<void>
  saveAndCloseWindow: () => Promise<void>
  windowModel: Ref<boolean>
  workingCss: Ref<string>
}

export function useWindowProgramStyling (props: { directInput?: T_dialogName }): I_FaWindowProgramStylingState {
  const windowModel = ref(false)
  const documentName = ref<T_dialogName>('WindowProgramStyling')
  const workingCss = ref('')
  const editorHostRef = ref<HTMLDivElement | null>(null)
  let hideAfterTransitionId: number | null = null

  const monaco = useMonacoMount({
    onChange (next: string): void {
      workingCss.value = next
    }
  })

  function syncWorkingFromStore (): void {
    workingCss.value = S_FaProgramStyling().css
  }

  function openWindow (): void {
    syncWorkingFromStore()
    windowModel.value = true
  }

  async function onWindowShow (): Promise<void> {
    if (editorHostRef.value === null) {
      return
    }
    await monaco.mountInto(editorHostRef.value, workingCss.value)
  }

  function onWindowHide (): void {
    monaco.disposeEditor()
    workingCss.value = ''
  }

  function closeWithoutSaving (): void {
    windowModel.value = false
  }

  async function saveAndCloseWindow (): Promise<void> {
    const ok = await runFaActionAwait('saveProgramStyling', { css: workingCss.value })
    if (ok) {
      windowModel.value = false
    }
  }

  watch(windowModel, async (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) {
      if (hideAfterTransitionId !== null) {
        clearTimeout(hideAfterTransitionId)
        hideAfterTransitionId = null
      }
      await nextTick()
      await onWindowShow()
    }
    if (!isOpen && wasOpen) {
      hideAfterTransitionId = scheduleFaFloatingWindowDelayedHide(
        hideAfterTransitionId,
        FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS,
        () => {
          hideAfterTransitionId = null
          onWindowHide()
        }
      )
    }
  })

  onBeforeUnmount(() => {
    if (hideAfterTransitionId !== null) {
      clearTimeout(hideAfterTransitionId)
      hideAfterTransitionId = null
    }
    onWindowHide()
  })

  watch(
    () => resolveDialogComponentStore()?.dialogUUID,
    () => {
      const store = resolveDialogComponentStore()
      if (store?.dialogToOpen === 'WindowProgramStyling') {
        openWindow()
      }
    }
  )

  watch(
    () => props.directInput,
    () => {
      if (props.directInput === 'WindowProgramStyling') {
        openWindow()
      }
    }
  )

  onMounted(() => {
    if (props.directInput === 'WindowProgramStyling') {
      openWindow()
    }
  })

  return {
    closeWithoutSaving,
    documentName,
    editorHostRef,
    monaco,
    onWindowHide,
    onWindowShow,
    saveAndCloseWindow,
    windowModel,
    workingCss
  }
}
