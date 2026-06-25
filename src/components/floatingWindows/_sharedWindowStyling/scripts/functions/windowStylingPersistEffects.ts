import type { I_FaMonacoMount } from 'app/types/I_faWindowStylingMonaco'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { Ref } from 'app/types/I_vueCompositionRefs'
import type { T_vueWatch } from 'app/types/I_vueWatchInjected'

export function createWireStylingWindowOpenFromMenuAndProps (deps: {
  onMounted: (hook: () => void) => void
  readFaDialogComponentStoreOrNull: () => { dialogToOpen?: unknown; dialogUUID?: unknown } | null
  watch: T_vueWatch
}): (options: {
    directInputDialogName: T_dialogName
    openWindow: () => void
    props: { directInput?: T_dialogName | undefined }
  }) => void {
  return function wireStylingWindowOpenFromMenuAndProps (options: {
    directInputDialogName: T_dialogName
    openWindow: () => void
    props: { directInput?: T_dialogName | undefined }
  }): void {
    const openWindowBind = options.openWindow
    const propsBind = options.props
    const directInputDialogName = options.directInputDialogName

    deps.watch(
      () => deps.readFaDialogComponentStoreOrNull()?.dialogUUID,
      () => {
        const store = deps.readFaDialogComponentStoreOrNull()
        if (store?.dialogToOpen === directInputDialogName) {
          openWindowBind()
        }
      }
    )

    deps.watch(
      () => propsBind.directInput,
      () => {
        if (propsBind.directInput === directInputDialogName) {
          openWindowBind()
        }
      },
      { immediate: true }
    )

    deps.onMounted(() => {
      if (propsBind.directInput === directInputDialogName) {
        openWindowBind()
      }
    })
  }
}

export function createReadFaDialogComponentStoreOrNull (deps: {
  S_DialogComponent: () => { dialogToOpen?: unknown; dialogUUID?: unknown }
}): () => { dialogToOpen?: unknown; dialogUUID?: unknown } | null {
  return function readFaDialogComponentStoreOrNull (): ReturnType<typeof deps.S_DialogComponent> | null {
    try {
      return deps.S_DialogComponent()
    } catch {
      return null
    }
  }
}

export function createWatchStylingEditorCssLivePreview (deps: {
  watch: T_vueWatch
}): (
    workingCss: Ref<string>,
    windowModel: Ref<boolean>,
    setCssLivePreview: (css: string) => void
  ) => void {
  return function watchStylingEditorCssLivePreview (
    workingCss: Ref<string>,
    windowModel: Ref<boolean>,
    setCssLivePreview: (css: string) => void
  ): void {
    deps.watch([workingCss, windowModel], ([cssVal, open]: [string, boolean]) => {
      if (open) {
        setCssLivePreview(cssVal)
      }
    })
  }
}

export function createWireStylingPersistedCssIntoOpenEditor (deps: {
  watch: T_vueWatch
}): (opts: {
    getPersistedCss: () => string
    monaco: I_FaMonacoMount
    windowModel: Ref<boolean>
    workingCss: Ref<string>
  }) => void {
  return function wireStylingPersistedCssIntoOpenEditor (opts: {
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
}
