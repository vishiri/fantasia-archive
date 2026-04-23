import { nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { S_FaProgramStyling } from 'app/src/stores/S_FaProgramStyling'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'
import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'
import { scheduleFaFloatingWindowDelayedHide } from 'app/src/scripts/floatingWindows/faFloatingWindowScheduleDelayedHide'

import {
  useMonacoMount,
  type I_FaMonacoMount
} from 'app/src/components/floatingWindows/WindowProgramStyling/scripts/useMonacoMount'
import {
  clearProgramStylingLivePreviewAndRefreshFromDisk,
  refreshPersistedProgramStylingAndCloseWindow,
  watchProgramStylingEditorCssLivePreview,
  wireProgramStylingWindowOpenFromMenuAndProps
} from 'app/src/components/floatingWindows/WindowProgramStyling/scripts/windowProgramStylingStateSideEffects'

/**
 * Public surface returned by 'useWindowProgramStyling'. Exposes:
 *  - reactive 'windowModel' for visibility,
 *  - 'workingCss' (the editor's working copy that lives only while the window is open),
 *  - the Monaco mount handle,
 *  - lifecycle helpers (open / show / hide / save).
 */
export interface I_FaWindowProgramStylingState {
  closeWithoutSaving: () => Promise<void>
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

  async function closeWithoutSaving (): Promise<void> {
    await refreshPersistedProgramStylingAndCloseWindow(windowModel)
  }

  async function saveAndCloseWindow (): Promise<void> {
    const ok = await runFaActionAwait('saveProgramStyling', { css: workingCss.value })
    if (ok) {
      windowModel.value = false
    }
  }

  watchProgramStylingEditorCssLivePreview(workingCss, windowModel)

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
      S_FaProgramStyling().clearCssLivePreview()
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
    clearProgramStylingLivePreviewAndRefreshFromDisk(windowModel)
    onWindowHide()
  })

  wireProgramStylingWindowOpenFromMenuAndProps({
    openWindow,
    props
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
