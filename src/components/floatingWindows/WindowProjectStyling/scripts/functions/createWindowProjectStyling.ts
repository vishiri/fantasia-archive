/* eslint-disable max-lines, max-lines-per-function -- monolithic create factory; decompose when extracting concerns */
import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { T_injectedResult } from 'app/types/I_injectedNeverthrow'
import type {
  I_FaMonacoMount,
  I_FaWindowProjectStylingState,
  I_faMonacoKeybindHelpItem,
  I_faMonacoStandaloneEditorLike,
  I_WindowProjectStylingSurface
} from 'app/types/I_faWindowStylingMonaco'
import type {
  I_faProjectStylingStylingWindowStore
} from 'app/types/I_faStylingWindowStoreFacade'
import type { T_useFaFloatingWindowFrameInjected } from 'app/types/I_useFaFloatingWindowFrameInjected'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { T_vueWatch } from 'app/types/I_vueWatchInjected'

interface I_registerProjectStylingWindowModelDeps {
  clearLivePreview: () => void
  hideAfterTransitionId: Ref<number | null>
  onWindowHide: () => void
  onWindowShow: () => Promise<void>
  windowModel: Ref<boolean>
}

export function createWindowProjectStyling (deps: {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: Record<string, string | boolean>
  FA_FLOATING_WINDOW_POP_TRANSITION_MS: number
  FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS: number
  Result: T_injectedResult
  S_DialogComponent: () => { dialogToOpen?: unknown; dialogUUID?: unknown }
  buildFaColorVarSwatchStyle: (cssVar: string) => Record<string, string>
  computed: <T>(getter: () => T) => ComputedRef<T>
  createDebounced: <T extends (...args: never[]) => void>(
    fn: T,
    waitMs: number
  ) => T & { flush: () => void }
  getFaActiveProjectStore: () => { activeProject?: { id?: string } | null }
  getFaColorCustomPropertyNamesForHelpPanel: () => readonly string[]
  getFaProjectStylingStore: () => I_faProjectStylingStylingWindowStore
  getMonacoKeybindHelpItems: () => I_faMonacoKeybindHelpItem[]
  nextTick: (fn?: () => void | Promise<void>) => Promise<void>
  onBeforeUnmount: (hook: () => void) => void
  onMounted: (hook: () => void) => void
  reconcileMountedMonacoWithWorkingCss: (opts: {
    editor: I_faMonacoStandaloneEditorLike | null
    workingCss: string
  }) => void
  ref: <T>(value: T) => Ref<T>
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  runFaActionAwait: <Id extends T_faActionId>(
    id: Id,
    payload: I_faActionPayloadMap[Id]
  ) => Promise<boolean>
  scheduleFaFloatingWindowDelayedHide: (
    existingId: number | null,
    ms: number,
    onHide: () => void
  ) => number
  useFaFloatingWindowFrame: T_useFaFloatingWindowFrameInjected
  useFaFloatingWindowFramePersist: (opts: {
    debounceMs?: number
    failureActionId: T_faActionId
    h: Ref<number>
    persistFrame: () => Promise<void>
    w: Ref<number>
    windowModel: Ref<boolean>
    x: Ref<number>
    y: Ref<number>
  }) => void
  useMonacoMount: (params: { onChange: (next: string) => void }) => I_FaMonacoMount
  useWindowAppStylingHelpMenu: () => {
    helpKeybindMenuOpen: Ref<boolean>
    onHelpIconMouseEnter: () => void
    onHelpIconMouseLeave: () => void
  }
  watch: T_vueWatch
}): {
    readFaDialogComponentStoreOrNull: () => { dialogToOpen?: unknown; dialogUUID?: unknown } | null
    watchProjectStylingEditorCssLivePreview: (workingCss: Ref<string>, windowModel: Ref<boolean>) => void
    wireProjectStylingPersistedCssIntoOpenEditor: (opts: {
      getPersistedCss: () => string
      monaco: I_FaMonacoMount
      windowModel: Ref<boolean>
      workingCss: Ref<string>
    }) => void
    refreshPersistedProjectStylingAndCloseWindow: (windowModel: Ref<boolean>) => Promise<void>
    clearProjectStylingLivePreviewAndRefreshFromKv: (windowModel: Ref<boolean>) => void
    wireProjectStylingWindowOpenFromMenuAndProps: (options: {
      openWindow: () => void
      props: { directInput?: T_dialogName }
    }) => void
    registerProjectStylingWindowModelWatch: (modelWatchDeps: I_registerProjectStylingWindowModelDeps) => void
    registerProjectStylingUnmount: (unmountDeps: {
      hideAfterTransitionId: Ref<number | null>
      onHardHide: () => void
      windowModel: Ref<boolean>
    }) => void
    registerProjectStylingActiveProjectWatch: (windowModel: Ref<boolean>) => void
    useWindowProjectStyling: (props: { directInput?: T_dialogName }) => I_FaWindowProjectStylingState
    useWindowProjectStylingCssPersist: (opts: { css: Ref<string>; windowModel: Ref<boolean> }) => void
    useWindowProjectStylingFramePersist: (opts: {
      h: Ref<number>
      windowModel: Ref<boolean>
      w: Ref<number>
      x: Ref<number>
      y: Ref<number>
    }) => void
    useWindowProjectStylingHelpPanel: (
      helpKeybindMenuOpen: Ref<boolean | undefined>
    ) => {
      faThemeCustomPropertyNames: Ref<readonly string[]>
      monacoKeybindHelpItems: ComputedRef<I_faMonacoKeybindHelpItem[]>
    }
    useWindowProjectStylingSurface: (props: { directInput?: T_dialogName }) => I_WindowProjectStylingSurface
  } {
  type T_resolvedDialogComponentStore = ReturnType<typeof deps.S_DialogComponent> | null

  function readFaDialogComponentStoreOrNull (): T_resolvedDialogComponentStore {
    try {
      return deps.S_DialogComponent()
    } catch {
      return null
    }
  }

  function watchProjectStylingEditorCssLivePreview (
    workingCss: Ref<string>,
    windowModel: Ref<boolean>
  ): void {
    deps.watch([workingCss, windowModel], ([cssVal, open]: [string, boolean]) => {
      if (open) {
        deps.getFaProjectStylingStore().setCssLivePreview(cssVal)
      }
    })
  }

  function wireProjectStylingPersistedCssIntoOpenEditor (opts: {
    getPersistedCss: () => string
    monaco: I_FaMonacoMount
    windowModel: Ref<boolean>
    workingCss: Ref<string>
  }): void {
    deps.watch(
      (): string => opts.getPersistedCss(),
      (next: string) => {
        if (!opts.windowModel.value) {
          return
        }
        if (opts.workingCss.value === next) {
          return
        }
        opts.workingCss.value = next
        const ed = opts.monaco.editor.value
        if (ed !== null) {
          ed.setValue(next)
        }
      }
    )
  }

  async function refreshPersistedProjectStylingAndCloseWindow (
    windowModel: Ref<boolean>
  ): Promise<void> {
    const st = deps.getFaProjectStylingStore()
    await st.refreshProjectStyling()
    st.clearCssLivePreview()
    windowModel.value = false
  }

  function clearProjectStylingLivePreviewAndRefreshFromKv (windowModel: Ref<boolean>): void {
    const st = deps.getFaProjectStylingStore()
    if (!windowModel.value && st.cssLivePreview === null) {
      return
    }
    st.clearCssLivePreview()
    void st.refreshProjectStyling()
  }

  function wireProjectStylingWindowOpenFromMenuAndProps (options: {
    openWindow: () => void
    props: { directInput?: T_dialogName }
  }): void {
    const openWindowBind = options.openWindow
    const propsBind = options.props

    deps.watch(
      () => readFaDialogComponentStoreOrNull()?.dialogUUID,
      () => {
        const store = readFaDialogComponentStoreOrNull()
        if (store?.dialogToOpen === 'WindowProjectStyling') {
          openWindowBind()
        }
      }
    )

    deps.watch(
      () => propsBind.directInput,
      () => {
        if (propsBind.directInput === 'WindowProjectStyling') {
          openWindowBind()
        }
      },
      { immediate: true }
    )

    deps.onMounted(() => {
      if (propsBind.directInput === 'WindowProjectStyling') {
        openWindowBind()
      }
    })
  }

  function registerProjectStylingWindowModelWatch (
    modelWatchDeps: I_registerProjectStylingWindowModelDeps
  ): void {
    deps.watch(modelWatchDeps.windowModel, async (isOpen: boolean, wasOpen: boolean) => {
      if (isOpen && !wasOpen) {
        if (modelWatchDeps.hideAfterTransitionId.value !== null) {
          clearTimeout(modelWatchDeps.hideAfterTransitionId.value)
          modelWatchDeps.hideAfterTransitionId.value = null
        }
        await deps.nextTick()
        await modelWatchDeps.onWindowShow()
      }
      if (!isOpen && wasOpen) {
        modelWatchDeps.clearLivePreview()
        modelWatchDeps.hideAfterTransitionId.value = deps.scheduleFaFloatingWindowDelayedHide(
          modelWatchDeps.hideAfterTransitionId.value,
          deps.FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS,
          () => {
            modelWatchDeps.hideAfterTransitionId.value = null
            modelWatchDeps.onWindowHide()
          }
        )
      }
    })
  }

  function registerProjectStylingUnmount (unmountDeps: {
    hideAfterTransitionId: Ref<number | null>
    onHardHide: () => void
    windowModel: Ref<boolean>
  }): void {
    deps.onBeforeUnmount(() => {
      if (unmountDeps.hideAfterTransitionId.value !== null) {
        clearTimeout(unmountDeps.hideAfterTransitionId.value)
        unmountDeps.hideAfterTransitionId.value = null
      }
      clearProjectStylingLivePreviewAndRefreshFromKv(unmountDeps.windowModel)
      unmountDeps.onHardHide()
    })
  }

  function registerProjectStylingActiveProjectWatch (windowModel: Ref<boolean>): void {
    deps.watch(
      () => deps.getFaActiveProjectStore().activeProject?.id ?? '',
      async (_nextId: string, prevId: string | undefined): Promise<void> => {
        if (!windowModel.value) {
          return
        }
        const hadPrior = typeof prevId === 'string' && prevId.length > 0
        const switchedAway = prevId !== _nextId
        if (hadPrior && switchedAway) {
          await refreshPersistedProjectStylingAndCloseWindow(windowModel)
        }
      }
    )
  }

  function useWindowProjectStyling (props: { directInput?: T_dialogName }): I_FaWindowProjectStylingState {
    const windowModel = deps.ref(false)
    const documentName = deps.ref<T_dialogName>('WindowProjectStyling')
    const workingCss = deps.ref('')
    const editorHostRef = deps.ref<HTMLDivElement | null>(null)
    const hideAfterTransitionId = deps.ref<number | null>(null)
    const stylingStore = deps.getFaProjectStylingStore()

    const monaco = deps.useMonacoMount({
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
      deps.reconcileMountedMonacoWithWorkingCss({
        editor: monaco.editor.value,
        workingCss: workingCss.value
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
      const ok = await deps.runFaActionAwait('saveProjectStyling', {
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

  function useWindowProjectStylingCssPersist (opts: {
    css: Ref<string>
    windowModel: Ref<boolean>
  }): void {
    const styling = deps.getFaProjectStylingStore()

    async function persistCssNow (): Promise<void> {
      if (!opts.windowModel.value) {
        return
      }
      try {
        await styling.persistProjectStylingPartialSilent({ css: opts.css.value })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        void deps.runFaAction('reportProjectStylingSaveFailure', { message })
      }
    }

    const schedulePersist = deps.createDebounced(() => {
      void persistCssNow()
    }, 380)

    deps.watch(
      opts.css,
      () => {
        if (!opts.windowModel.value) {
          return
        }
        schedulePersist()
      }
    )

    deps.watch(
      () => opts.windowModel.value,
      (open, wasOpen) => {
        if (open !== true && wasOpen === true) {
          schedulePersist.flush()
          void persistCssNow()
        }
      },
      { immediate: true }
    )
  }

  function useWindowProjectStylingFramePersist (opts: {
    h: Ref<number>
    windowModel: Ref<boolean>
    w: Ref<number>
    x: Ref<number>
    y: Ref<number>
  }): void {
    const styling = deps.getFaProjectStylingStore()

    deps.useFaFloatingWindowFramePersist({
      failureActionId: 'reportProjectStylingSaveFailure',
      h: opts.h,
      persistFrame: async () => {
        await styling.persistProjectStylingPartialSilent({
          frame: {
            height: opts.h.value,
            width: opts.w.value,
            x: opts.x.value,
            y: opts.y.value
          }
        })
      },
      w: opts.w,
      windowModel: opts.windowModel,
      x: opts.x,
      y: opts.y
    })
  }

  function useWindowProjectStylingHelpPanel (
    helpKeybindMenuOpen: Ref<boolean | undefined>
  ): {
      faThemeCustomPropertyNames: Ref<readonly string[]>
      monacoKeybindHelpItems: ComputedRef<I_faMonacoKeybindHelpItem[]>
    } {
    const monacoKeybindHelpItems = deps.computed(() => deps.getMonacoKeybindHelpItems())

    const faThemeCustomPropertyNames = deps.ref<readonly string[]>(
      deps.getFaColorCustomPropertyNamesForHelpPanel()
    )

    deps.watch(() => helpKeybindMenuOpen.value, (open: boolean | undefined): void => {
      if (open !== true) {
        return
      }
      void deps.nextTick(() => {
        faThemeCustomPropertyNames.value = deps.getFaColorCustomPropertyNamesForHelpPanel()
      })
    })

    return {
      faThemeCustomPropertyNames,
      monacoKeybindHelpItems
    }
  }

  function useWindowProjectStylingSurface (props: { directInput?: T_dialogName }): I_WindowProjectStylingSurface {
    const stylingState = useWindowProjectStyling(props)
    const projectStylingStore = deps.getFaProjectStylingStore()
    const persistedProjectStylingFrame = deps.computed((): {
      height: number
      width: number
      x: number
      y: number
    } | null => projectStylingStore.root?.frame ?? null)

    const frame = deps.useFaFloatingWindowFrame(stylingState.windowModel, undefined, {
      floatingWindowZLayer: 'projectStyling',
      persistedFrame: persistedProjectStylingFrame
    })

    useWindowProjectStylingCssPersist({
      css: stylingState.workingCss,
      windowModel: stylingState.windowModel
    })

    useWindowProjectStylingFramePersist({
      h: frame.h,
      w: frame.w,
      windowModel: stylingState.windowModel,
      x: frame.x,
      y: frame.y
    })

    const helpMenu = deps.useWindowAppStylingHelpMenu()
    const helpPanel = useWindowProjectStylingHelpPanel(helpMenu.helpKeybindMenuOpen)

    const frameStyleWithDialogTransition = deps.computed((): Record<string, string> => ({
      ...(frame.frameStyle.value as Record<string, string>),
      '--q-transition-duration': `${deps.FA_FLOATING_WINDOW_POP_TRANSITION_MS}ms`
    }))

    return {
      FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: deps.FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
      FA_FLOATING_WINDOW_POP_TRANSITION_MS: deps.FA_FLOATING_WINDOW_POP_TRANSITION_MS,
      buildFaColorVarSwatchStyle: deps.buildFaColorVarSwatchStyle,
      closeWithoutSaving: stylingState.closeWithoutSaving,
      documentName: stylingState.documentName,
      editorHostRef: stylingState.editorHostRef,
      faThemeCustomPropertyNames: helpPanel.faThemeCustomPropertyNames,
      frameRef: frame.frameRef,
      frameStyleWithDialogTransition,
      helpKeybindMenuOpen: helpMenu.helpKeybindMenuOpen,
      h: frame.h,
      monaco: stylingState.monaco,
      monacoKeybindHelpItems: helpPanel.monacoKeybindHelpItems,
      onFramePointerDown: frame.onFramePointerDown,
      onHelpIconMouseEnter: helpMenu.onHelpIconMouseEnter,
      onHelpIconMouseLeave: helpMenu.onHelpIconMouseLeave,
      onResizePointerDown: frame.onResizePointerDown,
      onTitlePointerDown: frame.onTitlePointerDown,
      saveAndCloseWindow: stylingState.saveAndCloseWindow,
      titleShortFrameClass: frame.titleShortFrameClass,
      w: frame.w,
      windowModel: stylingState.windowModel,
      workingCss: stylingState.workingCss,
      x: frame.x,
      y: frame.y
    }
  }

  return {
    readFaDialogComponentStoreOrNull,
    watchProjectStylingEditorCssLivePreview,
    wireProjectStylingPersistedCssIntoOpenEditor,
    refreshPersistedProjectStylingAndCloseWindow,
    clearProjectStylingLivePreviewAndRefreshFromKv,
    wireProjectStylingWindowOpenFromMenuAndProps,
    registerProjectStylingWindowModelWatch,
    registerProjectStylingUnmount,
    registerProjectStylingActiveProjectWatch,
    useWindowProjectStyling,
    useWindowProjectStylingCssPersist,
    useWindowProjectStylingFramePersist,
    useWindowProjectStylingHelpPanel,
    useWindowProjectStylingSurface
  }
}
