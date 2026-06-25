import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_FaMonacoMount, I_faMonacoStandaloneEditorLike } from 'app/types/I_faWindowStylingMonaco'
import type { I_faProjectStylingStylingWindowStore } from 'app/types/I_faStylingWindowStoreFacade'
import type { T_faCreateWindowStylingEditorSession } from 'app/types/I_faWindowStylingEditorSessionFactory'
import type { T_faWireWindowStylingSession } from 'app/types/I_faWindowStylingSessionWiring'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { Ref } from 'app/types/I_vueCompositionRefs'

export interface I_faWindowProjectStylingUseDeps {
  clearProjectStylingLivePreviewAndRefreshFromKv: (windowModel: Ref<boolean>) => void
  createWindowStylingEditorSession: T_faCreateWindowStylingEditorSession
  getFaProjectStylingStore: () => I_faProjectStylingStylingWindowStore
  reconcileMountedMonacoWithWorkingCss: (opts: {
    editor: I_faMonacoStandaloneEditorLike | null
    workingCss: string
  }) => void
  ref: <T>(value: T) => Ref<T>
  refreshPersistedProjectStylingAndCloseWindow: (windowModel: Ref<boolean>) => Promise<void>
  registerProjectStylingActiveProjectWatch: (windowModel: Ref<boolean>) => void
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
  runFaActionAwait: <Id extends T_faActionId>(
    id: Id,
    payload: I_faActionPayloadMap[Id]
  ) => Promise<boolean>
  shouldSkipOpenWhenAlreadyVisible?: boolean | undefined
  useMonacoMount: (params: { onChange: (value: string) => void }) => I_FaMonacoMount
  watchStylingEditorCssLivePreview: (
    workingCss: Ref<string>,
    windowModel: Ref<boolean>,
    setCssLivePreview: (css: string) => void
  ) => void
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
  wireWindowStylingSession: T_faWireWindowStylingSession
}
