import type { I_FaWindowAppStylingState } from 'app/types/I_faWindowStylingMonaco'
import type { I_faWindowAppStylingUseDeps } from 'app/types/I_faWindowAppStylingUseDeps'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

export function createWindowAppStylingUse (
  deps: I_faWindowAppStylingUseDeps
): (props: { directInput?: T_dialogName | undefined }) => I_FaWindowAppStylingState {
  return function useWindowAppStyling (props: { directInput?: T_dialogName | undefined }) {
    const windowModel = deps.ref(false)
    const documentName = deps.ref<T_dialogName>('WindowAppStyling')
    const workingCss = deps.ref('')
    const editorHostRef = deps.ref<HTMLDivElement | null>(null)
    const hideAfterTransitionId = { value: null as number | null }
    const stylingStore = deps.getFaAppStylingStore()

    const session = deps.createWindowStylingEditorSession({
      editorHostRef,
      reconcileMountedMonacoWithWorkingCss: deps.reconcileMountedMonacoWithWorkingCss,
      syncWorkingCssFromStore: () => {
        workingCss.value = stylingStore.css
      },
      useMonacoMount: deps.useMonacoMount,
      windowModel,
      workingCss
    })

    async function closeWithoutSaving (): Promise<void> {
      await deps.refreshPersistedAppStylingAndCloseWindow(windowModel)
    }

    async function saveAndCloseWindow (): Promise<void> {
      const ok = await deps.runFaActionAwait('saveAppStyling', { css: workingCss.value })
      if (ok) {
        windowModel.value = false
      }
    }

    deps.wireWindowStylingSession({
      clearLivePreviewAndRefresh: deps.clearAppStylingLivePreviewAndRefreshFromDisk,
      clearLivePreviewOnClose: () => {
        stylingStore.clearCssLivePreview()
      },
      directInputDialogName: 'WindowAppStyling',
      getPersistedCss: () => stylingStore.css,
      hideAfterTransitionId,
      monaco: session.monaco,
      onHardHide: session.onWindowHide,
      onWindowHide: session.onWindowHide,
      onWindowShow: session.onWindowShow,
      openWindow: session.openWindow,
      props,
      registerStylingUnmount: deps.registerStylingUnmount,
      registerStylingWindowModelWatch: deps.registerStylingWindowModelWatch,
      setCssLivePreview: (css) => {
        stylingStore.setCssLivePreview(css)
      },
      watchStylingEditorCssLivePreview: deps.watchStylingEditorCssLivePreview,
      windowModel,
      wireStylingPersistedCssIntoOpenEditor: deps.wireStylingPersistedCssIntoOpenEditor,
      wireStylingWindowOpenFromMenuAndProps: deps.wireStylingWindowOpenFromMenuAndProps,
      workingCss
    })

    const closeWithoutSavingOut = closeWithoutSaving
    const documentNameOut = documentName
    const editorHostRefOut = editorHostRef
    const monacoOut = session.monaco
    const onWindowHideOut = session.onWindowHide
    const onWindowShowOut = session.onWindowShow
    const saveAndCloseWindowOut = saveAndCloseWindow
    const windowModelOut = windowModel
    const workingCssOut = workingCss

    return {
      closeWithoutSaving: closeWithoutSavingOut,
      documentName: documentNameOut,
      editorHostRef: editorHostRefOut,
      monaco: monacoOut,
      onWindowHide: onWindowHideOut,
      onWindowShow: onWindowShowOut,
      saveAndCloseWindow: saveAndCloseWindowOut,
      windowModel: windowModelOut,
      workingCss: workingCssOut
    }
  }
}
