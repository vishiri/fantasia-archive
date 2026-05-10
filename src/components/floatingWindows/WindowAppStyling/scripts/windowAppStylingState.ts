import { nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'
import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'
import { scheduleFaFloatingWindowDelayedHide } from 'app/src/scripts/floatingWindows/faFloatingWindowScheduleDelayedHide'

import {
  useMonacoMount,
  type I_FaMonacoMount
} from 'app/src/components/floatingWindows/WindowAppStyling/scripts/useMonacoMount'
import {
  clearAppStylingLivePreviewAndRefreshFromDisk,
  refreshPersistedAppStylingAndCloseWindow,
  watchAppStylingEditorCssLivePreview,
  wireAppStylingWindowOpenFromMenuAndProps
} from 'app/src/components/floatingWindows/WindowAppStyling/scripts/windowAppStylingStateSideEffects'

/**
 * Public surface returned by 'useWindowAppStyling'. Exposes:
 *  - reactive 'windowModel' for visibility,
 *  - 'workingCss' (the editor's working copy that lives only while the window is open),
 *  - the Monaco mount handle,
 *  - lifecycle helpers (open / show / hide / save).
 */
export interface I_FaWindowAppStylingState {
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

export function useWindowAppStyling (props: { directInput?: T_dialogName }): I_FaWindowAppStylingState {
  const windowModel = ref(false)
  const documentName = ref<T_dialogName>('WindowAppStyling')
  const workingCss = ref('')
  const editorHostRef = ref<HTMLDivElement | null>(null)
  let hideAfterTransitionId: number | null = null

  const monaco = useMonacoMount({
    onChange (next: string): void {
      workingCss.value = next
    }
  })

  function syncWorkingFromStore (): void {
    workingCss.value = S_FaAppStyling().css
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
    await refreshPersistedAppStylingAndCloseWindow(windowModel)
  }

  async function saveAndCloseWindow (): Promise<void> {
    const ok = await runFaActionAwait('saveAppStyling', { css: workingCss.value })
    if (ok) {
      windowModel.value = false
    }
  }

  watchAppStylingEditorCssLivePreview(workingCss, windowModel)

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
      S_FaAppStyling().clearCssLivePreview()
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
    clearAppStylingLivePreviewAndRefreshFromDisk(windowModel)
    onWindowHide()
  })

  wireAppStylingWindowOpenFromMenuAndProps({
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
