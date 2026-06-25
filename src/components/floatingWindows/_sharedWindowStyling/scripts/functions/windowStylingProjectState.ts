import type { I_FaWindowProjectStylingState } from 'app/types/I_faWindowStylingMonaco'
import type { I_faWindowProjectStylingUseDeps } from 'app/types/I_faWindowProjectStylingUseDeps'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

export function createWindowProjectStylingUse (
  deps: I_faWindowProjectStylingUseDeps
): (props: { directInput?: T_dialogName | undefined }) => I_FaWindowProjectStylingState {
  return function useWindowProjectStyling (props: { directInput?: T_dialogName | undefined }) {
    const windowModel = deps.ref(false)
    const documentName = deps.ref<T_dialogName>('WindowProjectStyling')
    const workingCss = deps.ref('')
    const editorHostRef = deps.ref<HTMLDivElement | null>(null)
    const hideAfterTransitionId = deps.ref<number | null>(null)
    const stylingStore = deps.getFaProjectStylingStore()

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

    function openWindow (): void {
      if (deps.shouldSkipOpenWhenAlreadyVisible === true && windowModel.value) {
        return
      }
      session.openWindow()
    }

    async function closeWithoutSaving (): Promise<void> {
      await deps.refreshPersistedProjectStylingAndCloseWindow(windowModel)
    }

    async function saveAndCloseWindow (): Promise<void> {
      const ok = await deps.runFaActionAwait('saveProjectStyling', { css: workingCss.value })
      if (ok) {
        windowModel.value = false
      }
    }

    deps.wireWindowStylingSession({
      clearLivePreviewAndRefresh: deps.clearProjectStylingLivePreviewAndRefreshFromKv,
      clearLivePreviewOnClose: (): void => {
        stylingStore.clearCssLivePreview()
      },
      directInputDialogName: 'WindowProjectStyling',
      getPersistedCss: (): string => stylingStore.css,
      hideAfterTransitionId,
      monaco: session.monaco,
      onHardHide: session.onWindowHide,
      onWindowHide: session.onWindowHide,
      onWindowShow: session.onWindowShow,
      openWindow,
      props,
      registerProjectStylingActiveProjectWatch: deps.registerProjectStylingActiveProjectWatch,
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
