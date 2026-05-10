import { onMounted, watch, type Ref } from 'vue'
import { Result } from 'neverthrow'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'
import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'

type T_resolvedDialogComponentStore = ReturnType<typeof S_DialogComponent> | null

function resolveDialogComponentStore (): T_resolvedDialogComponentStore {
  return Result.fromThrowable(
    (): T_resolvedDialogComponentStore => S_DialogComponent(),
    (): null => null
  )().unwrapOr(null)
}

export function watchAppStylingEditorCssLivePreview (
  workingCss: Ref<string>,
  windowModel: Ref<boolean>
): void {
  watch([workingCss, windowModel], ([cssVal, open]) => {
    if (open) {
      S_FaAppStyling().setCssLivePreview(cssVal)
    }
  })
}

export async function refreshPersistedAppStylingAndCloseWindow (
  windowModel: Ref<boolean>
): Promise<void> {
  const st = S_FaAppStyling()
  const ok = await st.refreshAppStyling()
  if (!ok) {
    return
  }
  st.clearCssLivePreview()
  windowModel.value = false
}

export function clearAppStylingLivePreviewAndRefreshFromDisk (windowModel: Ref<boolean>): void {
  const st = S_FaAppStyling()
  if (!windowModel.value && st.cssLivePreview === null) {
    return
  }
  st.clearCssLivePreview()
  void st.refreshAppStyling()
}

export function wireAppStylingWindowOpenFromMenuAndProps (options: {
  openWindow: () => void
  props: { directInput?: T_dialogName }
}): void {
  const { openWindow, props } = options

  watch(
    () => resolveDialogComponentStore()?.dialogUUID,
    () => {
      const store = resolveDialogComponentStore()
      if (store?.dialogToOpen === 'WindowAppStyling') {
        openWindow()
      }
    }
  )

  watch(
    () => props.directInput,
    () => {
      if (props.directInput === 'WindowAppStyling') {
        openWindow()
      }
    },
    { immediate: true }
  )

  /**
   * Storybook (and similar hosts) can attach args after the immediate watch's first run; one extra frame
   * catches directInput once the parent has finished hydrating props.
   */
  onMounted(() => {
    if (props.directInput === 'WindowAppStyling') {
      openWindow()
    }
  })
}
