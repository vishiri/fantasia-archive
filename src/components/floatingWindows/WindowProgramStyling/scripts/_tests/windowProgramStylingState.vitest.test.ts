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
import { useWindowProgramStyling } from '../windowProgramStylingState'
import type { I_FaWindowProgramStylingState } from '../windowProgramStylingState'

const {
  monacoEditorCreateMock,
  editorInstance,
  runFaActionAwaitMock,
  faProgramStylingCssRef,
  dialogStoreRef
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
    faProgramStylingCssRef: { value: '' as string },
    dialogStoreRef: {
      value: null as { dialogToOpen: string | null, dialogUUID: string } | null,
      throwOnAccess: false
    }
  }
})

vi.mock('app/src/components/floatingWindows/WindowProgramStyling/scripts/cssMonaco', () => {
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

vi.mock('app/src/stores/S_FaProgramStyling', () => {
  return {
    S_FaProgramStyling: () => ({
      get css () {
        return faProgramStylingCssRef.value
      }
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
  faProgramStylingCssRef.value = ''
  dialogStoreRef.value = reactive({
    dialogToOpen: 'WindowProgramStyling',
    dialogUUID: '0'
  })
  dialogStoreRef.throwOnAccess = false
})

interface I_TestHarness {
  state: I_FaWindowProgramStylingState
  setEditorHost: (host: HTMLDivElement | null) => void
  directInput: ReturnType<typeof ref<T_dialogName | undefined>>
}

function mountUseWindow (initialDirectInput?: T_dialogName) {
  const harness: { current: I_TestHarness | null } = { current: null }

  const Harness = defineComponent({
    setup () {
      const directInput = ref<T_dialogName | undefined>(initialDirectInput)
      const state = useWindowProgramStyling({
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
 * useWindowProgramStyling
 * Without directInput the window stays closed at mount time and exposes the expected ref shape.
 */
test('Test that useWindowProgramStyling returns the expected reactive shape and stays closed by default', () => {
  const { harness } = mountUseWindow()
  const state = harness.current!.state

  expect(state.windowModel.value).toBe(false)
  expect(state.documentName.value).toBe('WindowProgramStyling')
  expect(state.workingCss.value).toBe('')
  expect(state.editorHostRef.value).toBeNull()
  expect(typeof state.onWindowShow).toBe('function')
  expect(typeof state.onWindowHide).toBe('function')
  expect(typeof state.closeWithoutSaving).toBe('function')
  expect(typeof state.saveAndCloseWindow).toBe('function')
})

/**
 * useWindowProgramStyling
 * directInput='WindowProgramStyling' opens the window on mount and seeds the working copy from the styling store.
 */
test('Test that directInput WindowProgramStyling opens the window on mount and syncs working css from the store', async () => {
  faProgramStylingCssRef.value = 'body { color: green; }'

  const { harness } = mountUseWindow('WindowProgramStyling')
  await nextTick()

  expect(harness.current!.state.windowModel.value).toBe(true)
  expect(harness.current!.state.workingCss.value).toBe('body { color: green; }')
})

/**
 * useWindowProgramStyling
 * Watching dialogUUID opens the window whenever the dialog store reports WindowProgramStyling as the next surface to open.
 */
test('Test that dialogUUID watch opens the window when dialogToOpen is WindowProgramStyling', async () => {
  const { harness } = mountUseWindow()
  faProgramStylingCssRef.value = '.fromStore { color: pink; }'

  expect(harness.current!.state.windowModel.value).toBe(false)

  dialogStoreRef.value!.dialogUUID = 'next-uuid'
  await nextTick()

  expect(harness.current!.state.windowModel.value).toBe(true)
  expect(harness.current!.state.workingCss.value).toBe('.fromStore { color: pink; }')
})

/**
 * useWindowProgramStyling
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
 * useWindowProgramStyling
 * If S_DialogComponent throws (Storybook canvas guard), the watcher silently skips opening.
 */
test('Test that dialogUUID watch skips when S_DialogComponent throws', async () => {
  dialogStoreRef.throwOnAccess = true
  const { harness } = mountUseWindow()
  await nextTick()

  expect(harness.current!.state.windowModel.value).toBe(false)
})

/**
 * useWindowProgramStyling
 * Toggling props.directInput to WindowProgramStyling at runtime opens the window through the directInput watch.
 */
test('Test that the directInput watch opens the window when props.directInput becomes WindowProgramStyling', async () => {
  const { harness } = mountUseWindow()
  expect(harness.current!.state.windowModel.value).toBe(false)

  harness.current!.directInput.value = 'WindowProgramStyling'
  await nextTick()

  expect(harness.current!.state.windowModel.value).toBe(true)
})

/**
 * useWindowProgramStyling
 * Toggling props.directInput away from WindowProgramStyling fires the watcher but does not open the window.
 */
test('Test that the directInput watch does not open the window when directInput becomes a non-target value', async () => {
  const { harness } = mountUseWindow()
  expect(harness.current!.state.windowModel.value).toBe(false)

  harness.current!.directInput.value = ''
  await nextTick()

  expect(harness.current!.state.windowModel.value).toBe(false)
})

/**
 * useWindowProgramStyling
 * onWindowShow with a valid editor host mounts the cold-loaded Monaco editor.
 */
test('Test that onWindowShow mounts Monaco when editorHostRef is set', async () => {
  const { harness } = mountUseWindow()
  const host = document.createElement('div')
  harness.current!.setEditorHost(host)
  faProgramStylingCssRef.value = '.seeded { color: orange; }'
  harness.current!.state.workingCss.value = faProgramStylingCssRef.value

  await harness.current!.state.onWindowShow()

  expect(monacoEditorCreateMock).toHaveBeenCalledTimes(1)
  expect(monacoEditorCreateMock.mock.calls[0]?.[0]).toBe(host)
})

/**
 * useWindowProgramStyling
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
 * useWindowProgramStyling
 * onWindowShow is a no-op when the editor host ref has not been bound by Vue yet.
 */
test('Test that onWindowShow is a no-op when editorHostRef is null', async () => {
  const { harness } = mountUseWindow()
  await harness.current!.state.onWindowShow()
  expect(monacoEditorCreateMock).not.toHaveBeenCalled()
})

/**
 * useWindowProgramStyling
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
 * useWindowProgramStyling
 * closeWithoutSaving simply flips windowModel to false; nothing is dispatched to the action manager.
 */
test('Test that closeWithoutSaving flips windowModel without invoking any action', async () => {
  const { harness } = mountUseWindow('WindowProgramStyling')
  await nextTick()
  expect(harness.current!.state.windowModel.value).toBe(true)

  harness.current!.state.closeWithoutSaving()

  expect(harness.current!.state.windowModel.value).toBe(false)
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()
})

/**
 * useWindowProgramStyling
 * saveAndCloseWindow dispatches the saveProgramStyling action with the current working css and closes on success.
 */
test('Test that saveAndCloseWindow dispatches saveProgramStyling and closes the window on success', async () => {
  const { harness } = mountUseWindow('WindowProgramStyling')
  await nextTick()
  harness.current!.state.workingCss.value = 'a { color: red; }'

  await harness.current!.state.saveAndCloseWindow()

  expect(runFaActionAwaitMock).toHaveBeenCalledWith('saveProgramStyling', { css: 'a { color: red; }' })
  expect(harness.current!.state.windowModel.value).toBe(false)
})

/**
 * useWindowProgramStyling
 * If the action returns a falsy result the window stays open so the user can retry without losing the working copy.
 */
test('Test that saveAndCloseWindow keeps the window open when the action returns falsy', async () => {
  runFaActionAwaitMock.mockResolvedValueOnce(false as unknown as true)
  const { harness } = mountUseWindow('WindowProgramStyling')
  await nextTick()
  harness.current!.state.workingCss.value = 'persist me later'

  await harness.current!.state.saveAndCloseWindow()

  expect(harness.current!.state.windowModel.value).toBe(true)
})

/**
 * useWindowProgramStyling
 * After close, working copy and editor are torn down only once the transition duration elapses.
 */
test(
  'Test that onWindowHide runs after the dialog transition delay when the window closes',
  async () => {
    const { harness, wrapper } = mountUseWindow()
    const host = document.createElement('div')
    harness.current!.setEditorHost(host)
    harness.current!.directInput.value = 'WindowProgramStyling'
    await nextTick()
    await flushPromises()

    harness.current!.state.workingCss.value = 'awaiting teardown'

    harness.current!.state.closeWithoutSaving()
    await nextTick()
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
 * useWindowProgramStyling
 * Unmount clears a scheduled hide timeout so a stale callback does not run after teardown.
 */
test(
  'Test that reopening before the hide delay clears the pending post-close timeout',
  async () => {
    const { harness, wrapper } = mountUseWindow()
    const host = document.createElement('div')
    harness.current!.setEditorHost(host)
    harness.current!.directInput.value = 'WindowProgramStyling'
    await nextTick()
    await flushPromises()
    editorInstance.dispose.mockClear()

    harness.current!.state.closeWithoutSaving()
    await nextTick()
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
    harness.current!.directInput.value = 'WindowProgramStyling'
    await nextTick()
    await flushPromises()
    editorInstance.dispose.mockClear()

    harness.current!.state.closeWithoutSaving()
    await nextTick()
    wrapper.unmount()

    await new Promise<void>((resolve) => {
      setTimeout(resolve, FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + 50)
    })

    expect(editorInstance.dispose).toHaveBeenCalled()
  },
  10_000
)
