import {
  ref,
  type Ref
} from 'vue'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { reconcileMountedMonacoWithWorkingCss } from 'app/src/components/floatingWindows/WindowAppStyling/scripts/windowAppStylingStateSideEffects'
import {
  useMonacoMount,
  type I_FaMonacoMount
} from 'app/src/components/floatingWindows/WindowAppStyling/scripts/useMonacoMount'
import {
  registerProjectStylingActiveProjectWatch,
  registerProjectStylingUnmount,
  registerProjectStylingWindowModelWatch
} from 'app/src/components/floatingWindows/WindowProjectStyling/scripts/windowProjectStylingLifecycleWatches'
import {
  refreshPersistedProjectStylingAndCloseWindow,
  watchProjectStylingEditorCssLivePreview,
  wireProjectStylingPersistedCssIntoOpenEditor,
  wireProjectStylingWindowOpenFromMenuAndProps
} from 'app/src/components/floatingWindows/WindowProjectStyling/scripts/windowProjectStylingStateSideEffects'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'

/**
 * Returned by 'useWindowProjectStyling' for the project Custom CSS floating window.
 */
export interface I_FaWindowProjectStylingState {
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

export function useWindowProjectStyling (props: { directInput?: T_dialogName }): I_FaWindowProjectStylingState {
  const windowModel = ref(false)
  const documentName = ref<T_dialogName>('WindowProjectStyling')
  const workingCss = ref('')
  const editorHostRef = ref<HTMLDivElement | null>(null)
  const hideAfterTransitionId = ref<number | null>(null)
  const stylingStore = S_FaProjectStyling()

  const monaco = useMonacoMount({
    onChange (next: string): void {
      workingCss.value = next
    }
  })

  function syncWorkingFromStore (): void {
    workingCss.value = stylingStore.css
  }

  function openWindow (): void {
    if (windowModel.value) {
      return
    }
    syncWorkingFromStore()
    windowModel.value = true
  }

  async function onWindowShow (): Promise<void> {
    if (editorHostRef.value === null) {
      return
    }
    await monaco.mountInto(editorHostRef.value, workingCss.value)
    reconcileMountedMonacoWithWorkingCss({
      monaco,
      workingCss
    })
  }

  function onWindowHide (): void {
    monaco.disposeEditor()
    workingCss.value = ''
  }

  async function closeWithoutSaving (): Promise<void> {
    await refreshPersistedProjectStylingAndCloseWindow(windowModel)
  }

  async function saveAndCloseWindow (): Promise<void> {
    const ok = await runFaActionAwait('saveProjectStyling', {
      css: workingCss.value
    })
    if (ok) {
      windowModel.value = false
    }
  }

  watchProjectStylingEditorCssLivePreview(workingCss, windowModel)

  wireProjectStylingPersistedCssIntoOpenEditor({
    getPersistedCss: (): string => stylingStore.css,
    monaco,
    windowModel,
    workingCss
  })

  registerProjectStylingWindowModelWatch({
    clearLivePreview: (): void => {
      stylingStore.clearCssLivePreview()
    },
    hideAfterTransitionId,
    onWindowHide,
    onWindowShow,
    windowModel
  })

  registerProjectStylingUnmount({
    hideAfterTransitionId,
    onHardHide: onWindowHide,
    windowModel
  })

  wireProjectStylingWindowOpenFromMenuAndProps({
    openWindow,
    props
  })

  registerProjectStylingActiveProjectWatch(windowModel)

  const closeWithoutSavingBind = closeWithoutSaving
  const documentNameBind = documentName
  const editorHostRefBind = editorHostRef
  const monacoBind = monaco
  const onWindowHideBind = onWindowHide
  const onWindowShowBind = onWindowShow
  const saveAndCloseWindowBind = saveAndCloseWindow
  const windowModelBind = windowModel
  const workingCssBind = workingCss

  return {
    closeWithoutSaving: closeWithoutSavingBind,
    documentName: documentNameBind,
    editorHostRef: editorHostRefBind,
    monaco: monacoBind,
    onWindowHide: onWindowHideBind,
    onWindowShow: onWindowShowBind,
    saveAndCloseWindow: saveAndCloseWindowBind,
    windowModel: windowModelBind,
    workingCss: workingCssBind
  }
}
