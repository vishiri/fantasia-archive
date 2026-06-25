import type { I_faWireWindowStylingSessionOpts } from 'app/types/I_faWindowStylingSessionWiring'

export function createWireWindowStylingSession (opts: I_faWireWindowStylingSessionOpts): void {
  opts.watchStylingEditorCssLivePreview(opts.workingCss, opts.windowModel, opts.setCssLivePreview)

  opts.wireStylingPersistedCssIntoOpenEditor({
    getPersistedCss: opts.getPersistedCss,
    monaco: opts.monaco,
    windowModel: opts.windowModel,
    workingCss: opts.workingCss
  })

  opts.registerStylingWindowModelWatch({
    clearLivePreview: opts.clearLivePreviewOnClose,
    hideAfterTransitionId: opts.hideAfterTransitionId,
    onWindowHide: opts.onWindowHide,
    onWindowShow: opts.onWindowShow,
    windowModel: opts.windowModel
  })

  opts.registerStylingUnmount({
    clearLivePreviewAndRefresh: opts.clearLivePreviewAndRefresh,
    hideAfterTransitionId: opts.hideAfterTransitionId,
    onHardHide: opts.onHardHide,
    windowModel: opts.windowModel
  })

  opts.wireStylingWindowOpenFromMenuAndProps({
    directInputDialogName: opts.directInputDialogName,
    openWindow: opts.openWindow,
    props: opts.props
  })

  if (opts.registerProjectStylingActiveProjectWatch !== undefined) {
    opts.registerProjectStylingActiveProjectWatch(opts.windowModel)
  }
}
