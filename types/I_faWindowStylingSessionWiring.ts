import type { I_FaMonacoMount } from 'app/types/I_faWindowStylingMonaco'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { Ref } from 'app/types/I_vueCompositionRefs'

export interface I_faWireWindowStylingSessionOpts {
  clearLivePreviewAndRefresh: (windowModel: Ref<boolean>) => void
  clearLivePreviewOnClose: () => void
  directInputDialogName: T_dialogName
  getPersistedCss: () => string
  hideAfterTransitionId: Ref<number | null> | { value: number | null }
  monaco: I_FaMonacoMount
  onHardHide: () => void
  onWindowHide: () => void
  onWindowShow: () => Promise<void>
  openWindow: () => void
  props: { directInput?: T_dialogName | undefined }
  registerProjectStylingActiveProjectWatch?: (windowModel: Ref<boolean>) => void | undefined
  registerStylingUnmount: (unmountDeps: {
    clearLivePreviewAndRefresh: (windowModel: Ref<boolean>) => void
    hideAfterTransitionId: Ref<number | null> | { value: number | null }
    onHardHide: () => void
    windowModel: Ref<boolean>
  }) => void
  registerStylingWindowModelWatch: (modelWatchDeps: {
    clearLivePreview: () => void
    hideAfterTransitionId: Ref<number | null> | { value: number | null }
    onWindowHide: () => void
    onWindowShow: () => Promise<void>
    windowModel: Ref<boolean>
  }) => void
  setCssLivePreview: (css: string) => void
  watchStylingEditorCssLivePreview: (
    workingCss: Ref<string>,
    windowModel: Ref<boolean>,
    setCssLivePreview: (css: string) => void
  ) => void
  windowModel: Ref<boolean>
  wireStylingPersistedCssIntoOpenEditor: (opts: {
    getPersistedCss: () => string
    monaco: I_FaMonacoMount
    windowModel: Ref<boolean>
    workingCss: Ref<string>
  }) => void
  wireStylingWindowOpenFromMenuAndProps: (options: {
    directInputDialogName: T_dialogName
    openWindow: () => void
    props: { directInput?: T_dialogName | undefined }
  }) => void
  workingCss: Ref<string>
}

export type T_faWireWindowStylingSession = (opts: I_faWireWindowStylingSessionOpts) => void
