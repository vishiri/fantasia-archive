import { ref } from 'vue'
import { expect, test, vi } from 'vitest'

import { createWindowStylingEditorSession } from '../functions/windowStylingEditorSession'

test('Test that a styling window show after close disposes the late Monaco mount', async () => {
  const windowModel = ref(true)
  const workingCss = ref('body {}')
  const editorHostRef = ref<HTMLDivElement | null>(document.createElement('div'))
  let releaseMount: (() => void) | undefined
  const disposeEditor = vi.fn()
  const reconcileMountedMonacoWithWorkingCss = vi.fn()
  const session = createWindowStylingEditorSession({
    editorHostRef,
    reconcileMountedMonacoWithWorkingCss,
    syncWorkingCssFromStore: () => undefined,
    useMonacoMount: () => ({
      disposeEditor,
      editor: ref(null),
      isLoading: ref(false),
      loadError: ref<string | null>(null),
      mountInto: () => new Promise<void>((resolve) => {
        releaseMount = resolve
      })
    }),
    windowModel,
    workingCss
  })

  const pending = session.onWindowShow()
  windowModel.value = false
  releaseMount?.()
  await pending
  expect(disposeEditor).toHaveBeenCalledTimes(1)
  expect(reconcileMountedMonacoWithWorkingCss).not.toHaveBeenCalled()
})
