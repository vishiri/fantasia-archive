/* eslint-disable max-lines, max-lines-per-function -- monolithic create factory; decompose when extracting concerns */
import type { I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'
import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { T_injectedResult, T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'
import type {
  I_FaMonacoMount,
  I_FaWindowAppStylingState,
  I_faMonacoKeybindHelpItem,
  I_faMonacoStandaloneEditorLike,
  I_WindowAppStylingSurface
} from 'app/types/I_faWindowStylingMonaco'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { I_faAppStylingStylingWindowStore } from 'app/types/I_faStylingWindowStoreFacade'
import type { T_useFaFloatingWindowFrameInjected } from 'app/types/I_useFaFloatingWindowFrameInjected'
import type { T_vueWatch } from 'app/types/I_vueWatchInjected'

export function createWindowAppStyling (deps: {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: Record<string, string | boolean>
  FA_FLOATING_WINDOW_POP_TRANSITION_MS: number
  FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS: number
  Result: T_injectedResult
  ResultAsync: T_injectedResultAsync
  S_DialogComponent: () => { dialogToOpen?: unknown; dialogUUID?: unknown }
  buildFaColorVarSwatchStyle: (cssVar: string) => Record<string, string>
  buildMonacoKeybindHelpItems: (isMac: boolean) => I_faMonacoKeybindHelpItem[]
  computed: <T>(getter: () => T) => ComputedRef<T>
  getFaAppStylingStore: () => I_faAppStylingStylingWindowStore
  getFaColorCustomPropertyNamesForHelpPanel: () => readonly string[]
  getFaKeybindsStore: () => { snapshot: I_faKeybindsSnapshot | null }
  loadMonacoModule: () => Promise<{
    monaco: { editor: { create: (host: HTMLElement, opts: Record<string, unknown>) => unknown } }
  }>
  nextTick: (fn?: () => void | Promise<void>) => Promise<void>
  onBeforeUnmount: (hook: () => void) => void
  onMounted: (hook: () => void) => void
  reconcileMountedMonacoWithWorkingCss: (opts: {
    editor: I_faMonacoStandaloneEditorLike | null
    workingCss: string
  }) => void
  ref: <T>(value: T) => Ref<T>
  runFaActionAwait: <Id extends T_faActionId>(
    id: Id,
    payload: I_faActionPayloadMap[Id]
  ) => Promise<boolean>
  scheduleFaFloatingWindowDelayedHide: (
    existingId: number | null,
    ms: number,
    onHide: () => void
  ) => number
  shallowRef: <T>(value: T) => Ref<T>
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
  watch: T_vueWatch
}): {
    getMonacoKeybindHelpItems: () => I_faMonacoKeybindHelpItem[]
    useMonacoMount: (params: { onChange: (value: string) => void }) => I_FaMonacoMount
    wireAppStylingPersistedCssIntoOpenEditor: (opts: {
      getPersistedCss: () => string
      monaco: I_FaMonacoMount
      windowModel: Ref<boolean>
      workingCss: Ref<string>
    }) => void
    useWindowAppStyling: (props: { directInput?: T_dialogName }) => I_FaWindowAppStylingState
    useWindowAppStylingFramePersist: (opts: {
      h: Ref<number>
      windowModel: Ref<boolean>
      w: Ref<number>
      x: Ref<number>
      y: Ref<number>
    }) => void
    useWindowAppStylingHelpMenu: () => {
      helpKeybindMenuOpen: Ref<boolean>
      onHelpIconMouseEnter: () => void
      onHelpIconMouseLeave: () => void
    }
    useWindowAppStylingHelpPanel: (
      helpKeybindMenuOpen: Ref<boolean | undefined>
    ) => {
      faThemeCustomPropertyNames: Ref<readonly string[]>
      monacoKeybindHelpItems: ComputedRef<I_faMonacoKeybindHelpItem[]>
    }
    useWindowAppStylingSurface: (props: { directInput?: T_dialogName }) => I_WindowAppStylingSurface
  } {
/** Matches the previous QTooltip delay on the styling help icon (ms). */
  const WINDOW_APP_STYLING_HELP_HOVER_OPEN_DELAY_MS = 500

  type T_resolvedDialogComponentStore = ReturnType<typeof deps.S_DialogComponent> | null

  function resolveDialogComponentStore (): T_resolvedDialogComponentStore {
    try {
      return deps.S_DialogComponent()
    } catch {
      return null
    }
  }

  function isMacPlatformForMonacoKeybindHelp (): boolean {
    const snapshot = deps.Result.fromThrowable(
      (): I_faKeybindsSnapshot | null => deps.getFaKeybindsStore().snapshot,
      (): null => null
    )().unwrapOr(null)
    if (snapshot !== null && snapshot.platform === 'darwin') {
      return true
    }

    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent
      if (typeof ua === 'string' && /Mac|iPhone|iPad/i.test(ua)) {
        return true
      }
    }
    return false
  }

  function getMonacoKeybindHelpItems (): I_faMonacoKeybindHelpItem[] {
    return deps.buildMonacoKeybindHelpItems(isMacPlatformForMonacoKeybindHelp())
  }

  function useMonacoMount (params: {
    onChange: (value: string) => void
  }): I_FaMonacoMount {
    const editor = deps.shallowRef<I_faMonacoStandaloneEditorLike | null>(null)
    const isLoading = deps.shallowRef(false)
    const loadError = deps.shallowRef<string | null>(null)
    let contentChangeDisposer: { dispose: () => void } | null = null

    function disposeEditor (): void {
      if (contentChangeDisposer !== null) {
        const disposable = contentChangeDisposer
        void deps.Result.fromThrowable(
          (): void => {
            disposable.dispose()
          },
          (): undefined => undefined
        )()
        contentChangeDisposer = null
      }
      if (editor.value !== null) {
        const disposed = editor.value
        void deps.Result.fromThrowable(
          (): void => {
            disposed.dispose()
          },
          (): undefined => undefined
        )()
        editor.value = null
      }
    }

    async function mountInto (host: HTMLElement, initialValue: string): Promise<void> {
      if (editor.value !== null) {
        editor.value.setValue(initialValue)
        return
      }
      isLoading.value = true
      loadError.value = null
      await Promise.resolve(
        deps.ResultAsync.fromPromise(
          (async (): Promise<void> => {
            const { monaco } = await deps.loadMonacoModule()
            const created = monaco.editor.create(host, {
              value: initialValue,
              language: 'css',
              automaticLayout: true,
              minimap: { enabled: false },
              theme: 'vs-dark',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2,
              fontSize: 13
            }) as unknown as I_faMonacoStandaloneEditorLike
            editor.value = created
            contentChangeDisposer = created.onDidChangeModelContent(() => {
              params.onChange(created.getValue())
            })
          })(),
          (error): unknown => error
        ).match(
          () => undefined,
          (error) => {
            loadError.value = error instanceof Error ? error.message : String(error)
            console.error('[WindowAppStyling] Monaco load/mount failed', error)
          }
        )
      ).finally(() => {
        isLoading.value = false
      })
    }

    deps.onBeforeUnmount(() => {
      disposeEditor()
    })

    return {
      disposeEditor,
      editor,
      isLoading,
      loadError,
      mountInto
    }
  }

  function watchAppStylingEditorCssLivePreview (
    workingCss: Ref<string>,
    windowModel: Ref<boolean>
  ): void {
    deps.watch([workingCss, windowModel], ([cssVal, open]: [string, boolean]) => {
      if (open) {
        deps.getFaAppStylingStore().setCssLivePreview(cssVal)
      }
    })
  }

  function wireAppStylingPersistedCssIntoOpenEditor (opts: {
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

  async function refreshPersistedAppStylingAndCloseWindow (
    windowModel: Ref<boolean>
  ): Promise<void> {
    const st = deps.getFaAppStylingStore()
    const ok = await st.refreshAppStyling()
    if (!ok) {
      return
    }
    st.clearCssLivePreview()
    windowModel.value = false
  }

  function clearAppStylingLivePreviewAndRefreshFromDisk (windowModel: Ref<boolean>): void {
    const st = deps.getFaAppStylingStore()
    if (!windowModel.value && st.cssLivePreview === null) {
      return
    }
    st.clearCssLivePreview()
    void st.refreshAppStyling()
  }

  function wireAppStylingWindowOpenFromMenuAndProps (options: {
    openWindow: () => void
    props: { directInput?: T_dialogName }
  }): void {
    const { openWindow, props } = options

    deps.watch(
      () => resolveDialogComponentStore()?.dialogUUID,
      () => {
        const store = resolveDialogComponentStore()
        if (store?.dialogToOpen === 'WindowAppStyling') {
          openWindow()
        }
      }
    )

    deps.watch(
      () => props.directInput,
      () => {
        if (props.directInput === 'WindowAppStyling') {
          openWindow()
        }
      },
      { immediate: true }
    )

    deps.onMounted(() => {
      if (props.directInput === 'WindowAppStyling') {
        openWindow()
      }
    })
  }

  function useWindowAppStyling (props: { directInput?: T_dialogName }): I_FaWindowAppStylingState {
    const windowModel = deps.ref(false)
    const documentName = deps.ref<T_dialogName>('WindowAppStyling')
    const workingCss = deps.ref('')
    const editorHostRef = deps.ref<HTMLDivElement | null>(null)
    let hideAfterTransitionId: number | null = null
    const stylingStore = deps.getFaAppStylingStore()

    const monaco = useMonacoMount({
      onChange (next: string): void {
        workingCss.value = next
      }
    })

    function syncWorkingFromStore (): void {
      workingCss.value = stylingStore.css
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
      await refreshPersistedAppStylingAndCloseWindow(windowModel)
    }

    async function saveAndCloseWindow (): Promise<void> {
      const ok = await deps.runFaActionAwait('saveAppStyling', { css: workingCss.value })
      if (ok) {
        windowModel.value = false
      }
    }

    watchAppStylingEditorCssLivePreview(workingCss, windowModel)

    wireAppStylingPersistedCssIntoOpenEditor({
      getPersistedCss: () => stylingStore.css,
      monaco,
      windowModel,
      workingCss
    })

    deps.watch(windowModel, async (isOpen: boolean, wasOpen: boolean) => {
      if (isOpen && !wasOpen) {
        if (hideAfterTransitionId !== null) {
          clearTimeout(hideAfterTransitionId)
          hideAfterTransitionId = null
        }
        await deps.nextTick()
        await onWindowShow()
      }
      if (!isOpen && wasOpen) {
        stylingStore.clearCssLivePreview()
        hideAfterTransitionId = deps.scheduleFaFloatingWindowDelayedHide(
          hideAfterTransitionId,
          deps.FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS,
          () => {
            hideAfterTransitionId = null
            onWindowHide()
          }
        )
      }
    })

    deps.onBeforeUnmount(() => {
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

  function useWindowAppStylingFramePersist (opts: {
    h: Ref<number>
    windowModel: Ref<boolean>
    w: Ref<number>
    x: Ref<number>
    y: Ref<number>
  }): void {
    const styling = deps.getFaAppStylingStore()

    deps.useFaFloatingWindowFramePersist({
      failureActionId: 'reportAppStylingPersistFailure',
      h: opts.h,
      persistFrame: async () => {
        await styling.persistAppStylingPartialSilent({
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

  function useWindowAppStylingHelpMenu (): {
    helpKeybindMenuOpen: Ref<boolean>
    onHelpIconMouseEnter: () => void
    onHelpIconMouseLeave: () => void
  } {
    const helpKeybindMenuOpen = deps.ref(false)
    let helpMenuHoverTimer: ReturnType<typeof setTimeout> | undefined

    function clearHelpMenuHoverTimer (): void {
      if (helpMenuHoverTimer === undefined) {
        return
      }
      clearTimeout(helpMenuHoverTimer)
      helpMenuHoverTimer = undefined
    }

    function onHelpIconMouseEnter (): void {
      clearHelpMenuHoverTimer()
      helpMenuHoverTimer = setTimeout(() => {
        helpMenuHoverTimer = undefined
        helpKeybindMenuOpen.value = true
      }, WINDOW_APP_STYLING_HELP_HOVER_OPEN_DELAY_MS)
    }

    function onHelpIconMouseLeave (): void {
      clearHelpMenuHoverTimer()
    }

    deps.onBeforeUnmount(() => {
      clearHelpMenuHoverTimer()
    })

    return {
      helpKeybindMenuOpen,
      onHelpIconMouseEnter,
      onHelpIconMouseLeave
    }
  }

  function useWindowAppStylingHelpPanel (
    helpKeybindMenuOpen: Ref<boolean | undefined>
  ): {
      faThemeCustomPropertyNames: Ref<readonly string[]>
      monacoKeybindHelpItems: ComputedRef<I_faMonacoKeybindHelpItem[]>
    } {
    const monacoKeybindHelpItems = deps.computed(() => getMonacoKeybindHelpItems())

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

  /**
 * Wires frame, persistence, help menu, and theme variable list for the app styling floating window SFC.
 */
  function useWindowAppStylingSurface (props: { directInput?: T_dialogName }): I_WindowAppStylingSurface {
    const stylingState = useWindowAppStyling(props)
    const appStylingStore = deps.getFaAppStylingStore()
    const persistedAppStylingFrame = deps.computed(() => appStylingStore.root?.frame ?? null)

    const frame = deps.useFaFloatingWindowFrame(stylingState.windowModel, undefined, {
      persistedFrame: persistedAppStylingFrame
    })

    useWindowAppStylingFramePersist({
      h: frame.h,
      w: frame.w,
      windowModel: stylingState.windowModel,
      x: frame.x,
      y: frame.y
    })

    const helpMenu = useWindowAppStylingHelpMenu()

    const frameStyleWithDialogTransition = deps.computed((): Record<string, string> => ({
      ...(frame.frameStyle.value as Record<string, string>),
      '--q-transition-duration': `${deps.FA_FLOATING_WINDOW_POP_TRANSITION_MS}ms`
    }))

    const {
      faThemeCustomPropertyNames,
      monacoKeybindHelpItems
    } = useWindowAppStylingHelpPanel(helpMenu.helpKeybindMenuOpen)

    return {
      FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: deps.FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
      FA_FLOATING_WINDOW_POP_TRANSITION_MS: deps.FA_FLOATING_WINDOW_POP_TRANSITION_MS,
      buildFaColorVarSwatchStyle: deps.buildFaColorVarSwatchStyle,
      closeWithoutSaving: stylingState.closeWithoutSaving,
      documentName: stylingState.documentName,
      editorHostRef: stylingState.editorHostRef,
      faThemeCustomPropertyNames,
      frameRef: frame.frameRef,
      frameStyleWithDialogTransition,
      helpKeybindMenuOpen: helpMenu.helpKeybindMenuOpen,
      h: frame.h,
      monaco: stylingState.monaco,
      monacoKeybindHelpItems,
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
    getMonacoKeybindHelpItems,
    useMonacoMount,
    wireAppStylingPersistedCssIntoOpenEditor,
    useWindowAppStyling,
    useWindowAppStylingFramePersist,
    useWindowAppStylingHelpMenu,
    useWindowAppStylingHelpPanel,
    useWindowAppStylingSurface
  }
}
