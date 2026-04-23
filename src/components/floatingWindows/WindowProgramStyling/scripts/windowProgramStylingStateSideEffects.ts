import { onMounted, watch, type Ref } from 'vue'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'
import { S_FaProgramStyling } from 'app/src/stores/S_FaProgramStyling'

type T_resolvedDialogComponentStore = ReturnType<typeof S_DialogComponent> | null

function resolveDialogComponentStore (): T_resolvedDialogComponentStore {
  try {
    return S_DialogComponent()
  } catch {
    return null
  }
}

export function watchProgramStylingEditorCssLivePreview (
  workingCss: Ref<string>,
  windowModel: Ref<boolean>
): void {
  watch([workingCss, windowModel], ([cssVal, open]) => {
    if (open) {
      S_FaProgramStyling().setCssLivePreview(cssVal)
    }
  })
}

export async function refreshPersistedProgramStylingAndCloseWindow (
  windowModel: Ref<boolean>
): Promise<void> {
  const st = S_FaProgramStyling()
  const ok = await st.refreshProgramStyling()
  if (!ok) {
    return
  }
  st.clearCssLivePreview()
  windowModel.value = false
}

export function clearProgramStylingLivePreviewAndRefreshFromDisk (windowModel: Ref<boolean>): void {
  const st = S_FaProgramStyling()
  if (!windowModel.value && st.cssLivePreview === null) {
    return
  }
  st.clearCssLivePreview()
  void st.refreshProgramStyling()
}

export function wireProgramStylingWindowOpenFromMenuAndProps (options: {
  openWindow: () => void
  props: { directInput?: T_dialogName }
}): void {
  const { openWindow, props } = options

  watch(
    () => resolveDialogComponentStore()?.dialogUUID,
    () => {
      const store = resolveDialogComponentStore()
      if (store?.dialogToOpen === 'WindowProgramStyling') {
        openWindow()
      }
    }
  )

  watch(
    () => props.directInput,
    () => {
      if (props.directInput === 'WindowProgramStyling') {
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
    if (props.directInput === 'WindowProgramStyling') {
      openWindow()
    }
  })
}
