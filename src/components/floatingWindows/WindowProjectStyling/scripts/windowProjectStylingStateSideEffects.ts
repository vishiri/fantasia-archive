import { onMounted, watch, type Ref } from 'vue'
import { Result } from 'neverthrow'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { I_FaMonacoMount } from 'app/src/components/floatingWindows/WindowAppStyling/scripts/useMonacoMount'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'

type T_resolvedDialogComponentStore = ReturnType<typeof S_DialogComponent> | null

/** Pinia dialogs can briefly throw in Storybook canvases — treat outages as unrouted dialogs. */
export function readFaDialogComponentStoreOrNull (): T_resolvedDialogComponentStore {
  return Result.fromThrowable(
    (): T_resolvedDialogComponentStore => S_DialogComponent(),
    (): null => null
  )().unwrapOr(null)
}

export function watchProjectStylingEditorCssLivePreview (
  workingCss: Ref<string>,
  windowModel: Ref<boolean>
): void {
  watch([
    workingCss,
    windowModel
  ], ([
    cssVal,
    open
  ]) => {
    if (open) {
      S_FaProjectStyling().setCssLivePreview(cssVal)
    }
  })
}

export function wireProjectStylingPersistedCssIntoOpenEditor (opts: {
  getPersistedCss: () => string
  monaco: I_FaMonacoMount
  windowModel: Ref<boolean>
  workingCss: Ref<string>
}): void {
  watch(
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

export async function refreshPersistedProjectStylingAndCloseWindow (
  windowModel: Ref<boolean>
): Promise<void> {
  const st = S_FaProjectStyling()
  await st.refreshProjectStyling()
  st.clearCssLivePreview()
  windowModel.value = false
}

export function clearProjectStylingLivePreviewAndRefreshFromKv (
  windowModel: Ref<boolean>
): void {
  const st = S_FaProjectStyling()
  if (!windowModel.value && st.cssLivePreview === null) {
    return
  }
  st.clearCssLivePreview()
  void st.refreshProjectStyling()
}

export function wireProjectStylingWindowOpenFromMenuAndProps (options: {
  openWindow: () => void
  props: { directInput?: T_dialogName }
}): void {
  const openWindowBind = options.openWindow
  const propsBind = options.props

  watch(
    () => readFaDialogComponentStoreOrNull()?.dialogUUID,
    () => {
      const store = readFaDialogComponentStoreOrNull()
      if (store?.dialogToOpen === 'WindowProjectStyling') {
        openWindowBind()
      }
    }
  )

  watch(
    () => propsBind.directInput,
    () => {
      if (propsBind.directInput === 'WindowProjectStyling') {
        openWindowBind()
      }
    },
    {
      immediate: true
    }
  )

  onMounted(() => {
    if (propsBind.directInput === 'WindowProjectStyling') {
      openWindowBind()
    }
  })
}
