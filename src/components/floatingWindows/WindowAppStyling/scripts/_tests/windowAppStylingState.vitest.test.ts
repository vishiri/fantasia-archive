import {
  beforeEach,
  expect,
  test,
  vi
} from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'
import { useWindowAppStyling } from '../windowAppStylingState'
import type { I_FaWindowAppStylingState } from '../windowAppStylingState'

/**
 * Mirrors Pinia-backed `css` reactivity while `S_FaAppStyling` is mocked without `defineStore`; `watch` on `stylingStore.css` subscribes to this ref inside the mocked getter.
 */
const faAppStylingCssRef = ref('')

const {
  monacoEditorCreateMock,
  editorInstance,
  runFaActionAwaitMock,
  faAppStylingCssLivePreviewRef,
  dialogStoreRef,
  setCssLivePreviewMock,
  clearCssLivePreviewMock,
  refreshAppStylingMock
} = vi.hoisted(() => {
  const editorDispose = vi.fn()
  let currentValue = ''
  const instance = {
    __listener: null as null | (() => void),
    dispose: editorDispose,
    getValue: () => currentValue,
    setValue: (value: string) => {
      currentValue = value
    },
    onDidChangeModelContent: vi.fn((listener: () => void) => {
      instance.__listener = listener
      return { dispose: vi.fn() }
    }),
    layout: vi.fn(),
    focus: vi.fn()
  }

  return {
    monacoEditorCreateMock: vi.fn((_host: unknown, _opts: unknown) => instance),
    editorInstance: instance,
    runFaActionAwaitMock: vi.fn(async () => true),
    faAppStylingCssLivePreviewRef: { value: null as string | null },
    dialogStoreRef: {
      value: null as { dialogToOpen: string | null, dialogUUID: string } | null,
      throwOnAccess: false
    },
    setCssLivePreviewMock: vi.fn(),
    clearCssLivePreviewMock: vi.fn(),
    refreshAppStylingMock: vi.fn(async () => true)
  }
})

vi.mock('app/src/components/floatingWindows/WindowAppStyling/scripts/cssMonaco', () => {
  return {
    monaco: {
      editor: { create: monacoEditorCreateMock }
    }
  }
})

vi.mock('app/src/scripts/actionManager/faActionManagerRun', () => {
  return {
    runFaActionAwait: runFaActionAwaitMock
  }
})

vi.mock('app/src/stores/S_FaAppStyling', () => {
  return {
    S_FaAppStyling: () => ({
      get css () {
        return faAppStylingCssRef.value
      },
      get cssLivePreview () {
        return faAppStylingCssLivePreviewRef.value
      },
      setCssLivePreview (text: string) {
        faAppStylingCssLivePreviewRef.value = text
        setCssLivePreviewMock(text)
      },
      clearCssLivePreview () {
        faAppStylingCssLivePreviewRef.value = null
        clearCssLivePreviewMock()
      },
      refreshAppStyling: refreshAppStylingMock
    })
  }
})

vi.mock('app/src/stores/S_Dialog', () => {
  return {
    S_DialogComponent: () => {
      if (dialogStoreRef.throwOnAccess) {
        throw new Error('S_DialogComponent unavailable')
      }
      return dialogStoreRef.value
    }
  }
})

beforeEach(() => {
  setActivePinia(createPinia())
  monacoEditorCreateMock.mockClear()
  monacoEditorCreateMock.mockImplementation((_host: unknown, _opts: unknown) => editorInstance)
  runFaActionAwaitMock.mockReset()
  runFaActionAwaitMock.mockResolvedValue(true)
  faAppStylingCssRef.value = ''
  faAppStylingCssLivePreviewRef.value = null
  dialogStoreRef.value = reactive({
    dialogToOpen: 'WindowAppStyling',
    dialogUUID: '0'
  })
  dialogStoreRef.throwOnAccess = false
  setCssLivePreviewMock.mockClear()
  clearCssLivePreviewMock.mockClear()
  refreshAppStylingMock.mockClear()
})

interface I_TestHarness {
  state: I_FaWindowAppStylingState
  setEditorHost: (host: HTMLDivElement | null) => void
  directInput: ReturnType<typeof ref<T_dialogName | undefined>>
}

function mountUseWindow (initialDirectInput?: T_dialogName) {
  const harness: { current: I_TestHarness | null } = { current: null }

  const Harness = defineComponent({
    setup () {
      const directInput = ref<T_dialogName | undefined>(initialDirectInput)
      const state = useWindowAppStyling({
        get directInput () {
          return directInput.value
        }
      })
      harness.current = {
        state,
        setEditorHost (host: HTMLDivElement | null): void {
          state.editorHostRef.value = host
        },
        directInput
      }
      return () => h('div')
    }
  })

  const wrapper = mount(Harness)
  return {
    wrapper,
    harness
  }
}

/**
 * useWindowAppStyling
 * Without directInput the window stays closed at mount time and exposes the expected ref shape.
 */
test('Test that useWindowAppStyling returns the expected reactive shape and stays closed by default', () => {
  const { harness } = mountUseWindow()
  const state = harness.current!.state

  expect(state.windowModel.value).toBe(false)
  expect(state.documentName.value).toBe('WindowAppStyling')
  expect(state.workingCss.value).toBe('')
  expect(state.editorHostRef.value).toBeNull()
  expect(typeof state.onWindowShow).toBe('function')
  expect(typeof state.onWindowHide).toBe('function')
  expect(typeof state.closeWithoutSaving).toBe('function')
  expect(typeof state.saveAndCloseWindow).toBe('function')
})

/**
 * useWindowAppStyling
 * directInput='WindowAppStyling' opens the window on mount and seeds the working copy from the styling store.
 */
test('Test that directInput WindowAppStyling opens the window on mount and syncs working css from the store', async () => {
  faAppStylingCssRef.value = 'body { color: green; }'

  const { harness } = mountUseWindow('WindowAppStyling')
  await nextTick()

  expect(harness.current!.state.windowModel.value).toBe(true)
  expect(harness.current!.state.workingCss.value).toBe('body { color: green; }')
})

/**
 * useWindowAppStyling
 * Watching dialogUUID opens the window whenever the dialog store reports WindowAppStyling as the next surface to open.
 */
test('Test that dialogUUID watch opens the window when dialogToOpen is WindowAppStyling', async () => {
  const { harness } = mountUseWindow()
  faAppStylingCssRef.value = '.fromStore { color: pink; }'

  expect(harness.current!.state.windowModel.value).toBe(false)

  dialogStoreRef.value!.dialogUUID = 'next-uuid'
  await nextTick()

  expect(harness.current!.state.windowModel.value).toBe(true)
  expect(harness.current!.state.workingCss.value).toBe('.fromStore { color: pink; }')
})

/**
 * useWindowAppStyling
 * dialogUUID watch ignores opens for other dialog targets so unrelated activity does not steal focus.
 */
test('Test that dialogUUID watch ignores other dialog targets', async () => {
  const { harness } = mountUseWindow()
  dialogStoreRef.value!.dialogToOpen = 'AboutFantasiaArchive'
  dialogStoreRef.value!.dialogUUID = 'next-uuid'
  await nextTick()

  expect(harness.current!.state.windowModel.value).toBe(false)
})

/**
 * useWindowAppStyling
 * If S_DialogComponent throws (Storybook canvas guard), the watcher silently skips opening.
 */
test('Test that dialogUUID watch skips when S_DialogComponent throws', async () => {
  dialogStoreRef.throwOnAccess = true
  const { harness } = mountUseWindow()
  await nextTick()

  expect(harness.current!.state.windowModel.value).toBe(false)
})

/**
 * useWindowAppStyling
 * Toggling props.directInput to WindowAppStyling at runtime opens the window through the directInput watch.
 */
test('Test that the directInput watch opens the window when props.directInput becomes WindowAppStyling', async () => {
  const { harness } = mountUseWindow()
  expect(harness.current!.state.windowModel.value).toBe(false)

  harness.current!.directInput.value = 'WindowAppStyling'
  await nextTick()

  expect(harness.current!.state.windowModel.value).toBe(true)
})

/**
 * useWindowAppStyling
 * Toggling props.directInput away from WindowAppStyling fires the watcher but does not open the window.
 */
test('Test that the directInput watch does not open the window when directInput becomes a non-target value', async () => {
  const { harness } = mountUseWindow()
  expect(harness.current!.state.windowModel.value).toBe(false)

  harness.current!.directInput.value = ''
  await nextTick()

  expect(harness.current!.state.windowModel.value).toBe(false)
})

/**
 * useWindowAppStyling
 * onWindowShow with a valid editor host mounts the cold-loaded Monaco editor.
 */
test('Test that onWindowShow mounts Monaco when editorHostRef is set', async () => {
  const { harness } = mountUseWindow()
  const host = document.createElement('div')
  harness.current!.setEditorHost(host)
  faAppStylingCssRef.value = '.seeded { color: orange; }'
  harness.current!.state.workingCss.value = faAppStylingCssRef.value

  await harness.current!.state.onWindowShow()

  expect(monacoEditorCreateMock).toHaveBeenCalledTimes(1)
  expect(monacoEditorCreateMock.mock.calls[0]?.[0]).toBe(host)
})

/**
 * useWindowAppStyling
 * Editor onChange callback wired through useMonacoMount writes back into workingCss.
 */
test('Test that Monaco onChange updates the workingCss ref via the wired callback', async () => {
  const { harness } = mountUseWindow()
  const host = document.createElement('div')
  harness.current!.setEditorHost(host)
  await harness.current!.state.onWindowShow()

  editorInstance.setValue('typed by user')
  editorInstance.__listener?.()

  expect(harness.current!.state.workingCss.value).toBe('typed by user')
})

/**
 * useWindowAppStyling
 * onWindowShow is a no-op when the editor host ref has not been bound by Vue yet.
 */
test('Test that onWindowShow is a no-op when editorHostRef is null', async () => {
  const { harness } = mountUseWindow()
  await harness.current!.state.onWindowShow()
  expect(monacoEditorCreateMock).not.toHaveBeenCalled()
})

/**
 * useWindowAppStyling
 * onWindowHide disposes the editor and clears the working copy so reopening starts from the store again.
 */
test('Test that onWindowHide disposes Monaco and clears the working css', async () => {
  const { harness } = mountUseWindow()
  const host = document.createElement('div')
  harness.current!.setEditorHost(host)
  await harness.current!.state.onWindowShow()
  harness.current!.state.workingCss.value = 'about to be cleared'

  harness.current!.state.onWindowHide()

  expect(harness.current!.state.workingCss.value).toBe('')
})

/**
 * useWindowAppStyling
 * closeWithoutSaving clears live preview, re-reads styling from disk, closes the window, and does not dispatch save.
 */
test('Test that closeWithoutSaving refreshes from disk, clears preview, and closes without save action', async () => {
  const { harness } = mountUseWindow('WindowAppStyling')
  await nextTick()
  expect(harness.current!.state.windowModel.value).toBe(true)

  await harness.current!.state.closeWithoutSaving()

  expect(refreshAppStylingMock).toHaveBeenCalled()
  expect(clearCssLivePreviewMock).toHaveBeenCalled()
  expect(harness.current!.state.windowModel.value).toBe(false)
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()
})

/**
 * useWindowAppStyling
 * When the disk refresh fails, discard keeps the window open and leaves live preview intact.
 */
test('Test that closeWithoutSaving keeps the window open when refreshAppStyling fails', async () => {
  refreshAppStylingMock.mockResolvedValueOnce(false)
  const { harness } = mountUseWindow('WindowAppStyling')
  await nextTick()
  clearCssLivePreviewMock.mockClear()

  await harness.current!.state.closeWithoutSaving()

  expect(harness.current!.state.windowModel.value).toBe(true)
  expect(clearCssLivePreviewMock).not.toHaveBeenCalled()
})

/**
 * useWindowAppStyling
 * Any path that sets windowModel false should clear live preview so '#faUserCss' cannot stay on unsaved text.
 */
test('Test that setting windowModel false clears live preview', async () => {
  const { harness } = mountUseWindow('WindowAppStyling')
  await nextTick()
  clearCssLivePreviewMock.mockClear()

  harness.current!.state.windowModel.value = false
  await nextTick()

  expect(clearCssLivePreviewMock).toHaveBeenCalled()
})

/**
 * useWindowAppStyling
 * After a normal close, unmount skips an extra refresh when preview is already cleared.
 */
test('Test that unmount after closeWithoutSaving does not call refreshAppStyling again', async () => {
  const { harness, wrapper } = mountUseWindow('WindowAppStyling')
  await nextTick()
  await harness.current!.state.closeWithoutSaving()
  await flushPromises()
  refreshAppStylingMock.mockClear()

  wrapper.unmount()

  expect(refreshAppStylingMock).not.toHaveBeenCalled()
})

/**
 * useWindowAppStyling
 * While the window is open, editor working css is pushed to the app styling store for live preview.
 */
test('Test that opening the app styling window publishes working css as live preview', async () => {
  faAppStylingCssRef.value = 'body { margin: 0; }'
  mountUseWindow('WindowAppStyling')
  await nextTick()
  await flushPromises()
  expect(setCssLivePreviewMock).toHaveBeenCalledWith('body { margin: 0; }')
})

/**
 * useWindowAppStyling
 * Persisted store CSS changes (for example after .faconfig import) resync the Monaco working copy while the window stays open.
 */
test('Test that persisted css changes resync workingCss and Monaco while the window is open', async () => {
  faAppStylingCssRef.value = ':root { --x: 1; }'

  const { harness } = mountUseWindow('WindowAppStyling')
  await nextTick()
  const host = document.createElement('div')
  harness.current!.setEditorHost(host)
  await harness.current!.state.onWindowShow()
  await flushPromises()

  expect(harness.current!.state.workingCss.value).toBe(':root { --x: 1; }')

  faAppStylingCssRef.value = '/* imported */\nbody {}'
  await nextTick()

  expect(harness.current!.state.workingCss.value).toBe('/* imported */\nbody {}')
  expect(editorInstance.getValue()).toBe('/* imported */\nbody {}')
})

/**
 * useWindowAppStyling
 * Editing working css updates live preview while the window stays open.
 */
test('Test that workingCss changes update live preview while the window is open', async () => {
  const { harness } = mountUseWindow('WindowAppStyling')
  await nextTick()
  setCssLivePreviewMock.mockClear()

  harness.current!.state.workingCss.value = 'a { color: lime; }'
  await nextTick()

  expect(setCssLivePreviewMock).toHaveBeenCalledWith('a { color: lime; }')
})

/**
 * useWindowAppStyling
 * saveAndCloseWindow dispatches the saveAppStyling action with the current working css and closes on success.
 */
test('Test that saveAndCloseWindow dispatches saveAppStyling and closes the window on success', async () => {
  const { harness } = mountUseWindow('WindowAppStyling')
  await nextTick()
  harness.current!.state.workingCss.value = 'a { color: red; }'

  await harness.current!.state.saveAndCloseWindow()

  expect(runFaActionAwaitMock).toHaveBeenCalledWith('saveAppStyling', { css: 'a { color: red; }' })
  expect(harness.current!.state.windowModel.value).toBe(false)
})

/**
 * useWindowAppStyling
 * If the action returns a falsy result the window stays open so the user can retry without losing the working copy.
 */
test('Test that saveAndCloseWindow keeps the window open when the action returns falsy', async () => {
  runFaActionAwaitMock.mockResolvedValueOnce(false as unknown as true)
  const { harness } = mountUseWindow('WindowAppStyling')
  await nextTick()
  harness.current!.state.workingCss.value = 'persist me later'

  await harness.current!.state.saveAndCloseWindow()

  expect(harness.current!.state.windowModel.value).toBe(true)
})

/**
 * useWindowAppStyling
 * After close, working copy and editor are torn down only once the transition duration elapses.
 */
test(
  'Test that onWindowHide runs after the dialog transition delay when the window closes',
  async () => {
    const { harness, wrapper } = mountUseWindow()
    const host = document.createElement('div')
    harness.current!.setEditorHost(host)
    harness.current!.directInput.value = 'WindowAppStyling'
    await nextTick()
    await flushPromises()

    harness.current!.state.workingCss.value = 'awaiting teardown'

    await harness.current!.state.closeWithoutSaving()
    await nextTick()
    await flushPromises()
    await new Promise<void>((resolve) => {
      setTimeout(resolve, FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + 50)
    })

    expect(harness.current!.state.workingCss.value).toBe('')
    expect(editorInstance.dispose).toHaveBeenCalled()
    wrapper.unmount()
  },
  10_000
)

/**
 * useWindowAppStyling
 * Unmount clears a scheduled hide timeout so a stale callback does not run after teardown.
 */
test(
  'Test that reopening before the hide delay clears the pending post-close timeout',
  async () => {
    const { harness, wrapper } = mountUseWindow()
    const host = document.createElement('div')
    harness.current!.setEditorHost(host)
    harness.current!.directInput.value = 'WindowAppStyling'
    await nextTick()
    await flushPromises()
    editorInstance.dispose.mockClear()

    await harness.current!.state.closeWithoutSaving()
    await nextTick()
    await flushPromises()
    harness.current!.state.windowModel.value = true
    await nextTick()
    await flushPromises()

    await new Promise<void>((resolve) => {
      setTimeout(resolve, FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + 50)
    })

    expect(editorInstance.dispose).not.toHaveBeenCalled()
    wrapper.unmount()
  },
  10_000
)

test(
  'Test that unmount clears the pending post-close timeout',
  async () => {
    const { harness, wrapper } = mountUseWindow()
    const host = document.createElement('div')
    harness.current!.setEditorHost(host)
    harness.current!.directInput.value = 'WindowAppStyling'
    await nextTick()
    await flushPromises()
    editorInstance.dispose.mockClear()

    await harness.current!.state.closeWithoutSaving()
    await nextTick()
    await flushPromises()
    wrapper.unmount()

    await new Promise<void>((resolve) => {
      setTimeout(resolve, FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + 50)
    })

    expect(editorInstance.dispose).toHaveBeenCalled()
  },
  10_000
)
