import type { I_faProjectStylingStylingWindowStore } from 'app/types/I_faStylingWindowStoreFacade'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { Ref } from 'app/types/I_vueCompositionRefs'

export function createWatchProjectStylingEditorCssLivePreview (deps: {
  getFaProjectStylingStore: () => I_faProjectStylingStylingWindowStore
  watchStylingEditorCssLivePreview: (
    workingCss: Ref<string>,
    windowModel: Ref<boolean>,
    setCssLivePreview: (css: string) => void
  ) => void
}): (workingCss: Ref<string>, windowModel: Ref<boolean>) => void {
  return function watchProjectStylingEditorCssLivePreview (
    workingCss: Ref<string>,
    windowModel: Ref<boolean>
  ): void {
    deps.watchStylingEditorCssLivePreview(workingCss, windowModel, (css) => {
      deps.getFaProjectStylingStore().setCssLivePreview(css)
    })
  }
}

export function createWireProjectStylingWindowOpenFromMenuAndProps (deps: {
  wireStylingWindowOpenFromMenuAndProps: (options: {
    directInputDialogName: T_dialogName
    openWindow: () => void
    props: { directInput?: T_dialogName | undefined }
  }) => void
}): (options: {
    openWindow: () => void
    props: { directInput?: T_dialogName | undefined }
  }) => void {
  return function wireProjectStylingWindowOpenFromMenuAndProps (options: {
    openWindow: () => void
    props: { directInput?: T_dialogName | undefined }
  }): void {
    deps.wireStylingWindowOpenFromMenuAndProps({
      directInputDialogName: 'WindowProjectStyling',
      openWindow: options.openWindow,
      props: options.props
    })
  }
}

export function createRegisterProjectStylingUnmount (deps: {
  clearProjectStylingLivePreviewAndRefreshFromKv: (windowModel: Ref<boolean>) => void
  registerStylingUnmount: (unmountDeps: {
    clearLivePreviewAndRefresh: (windowModel: Ref<boolean>) => void
    hideAfterTransitionId: Ref<number | null>
    onHardHide: () => void
    windowModel: Ref<boolean>
  }) => void
}): (unmountDeps: {
    hideAfterTransitionId: Ref<number | null>
    onHardHide: () => void
    windowModel: Ref<boolean>
  }) => void {
  return function registerProjectStylingUnmount (unmountDeps: {
    hideAfterTransitionId: Ref<number | null>
    onHardHide: () => void
    windowModel: Ref<boolean>
  }): void {
    deps.registerStylingUnmount({
      clearLivePreviewAndRefresh: deps.clearProjectStylingLivePreviewAndRefreshFromKv,
      hideAfterTransitionId: unmountDeps.hideAfterTransitionId,
      onHardHide: unmountDeps.onHardHide,
      windowModel: unmountDeps.windowModel
    })
  }
}
