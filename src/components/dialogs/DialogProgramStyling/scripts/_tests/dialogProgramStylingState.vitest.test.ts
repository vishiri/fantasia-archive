import {
  beforeEach,
  expect,
  test,
  vi
} from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { useDialogProgramStyling } from '../dialogProgramStylingState'
import type { I_FaDialogProgramStylingState } from '../dialogProgramStylingState'

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

vi.mock('app/src/components/dialogs/DialogProgramStyling/scripts/cssMonaco', () => {
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
    dialogToOpen: 'ProgramStyling',
    dialogUUID: '0'
  })
  dialogStoreRef.throwOnAccess = false
})

interface I_TestHarness {
  state: I_FaDialogProgramStylingState
  setEditorHost: (host: HTMLDivElement | null) => void
  directInput: ReturnType<typeof ref<string | undefined>>
}

function mountUseDialog (initialDirectInput?: 'ProgramStyling') {
  const harness: { current: I_TestHarness | null } = { current: null }

  const Harness = defineComponent({
    setup () {
      const directInput = ref<'ProgramStyling' | undefined>(initialDirectInput)
      const state = useDialogProgramStyling({
        get directInput () {
          return directInput.value
        }
      } as { directInput?: 'ProgramStyling' })
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
 * useDialogProgramStyling
 * Without directInput the dialog stays closed at mount time and exposes the expected ref shape.
 */
test('Test that useDialogProgramStyling returns the expected reactive shape and stays closed by default', () => {
  const { harness } = mountUseDialog()
  const state = harness.current!.state

  expect(state.dialogModel.value).toBe(false)
  expect(state.documentName.value).toBe('ProgramStyling')
  expect(state.workingCss.value).toBe('')
  expect(state.editorHostRef.value).toBeNull()
  expect(typeof state.onDialogShow).toBe('function')
  expect(typeof state.onDialogHide).toBe('function')
  expect(typeof state.closeWithoutSaving).toBe('function')
  expect(typeof state.saveAndCloseDialog).toBe('function')
})

/**
 * useDialogProgramStyling
 * directInput='ProgramStyling' opens the dialog on mount and seeds the working copy from the styling store.
 */
test('Test that directInput ProgramStyling opens the dialog on mount and syncs working css from the store', async () => {
  faProgramStylingCssRef.value = 'body { color: green; }'

  const { harness } = mountUseDialog('ProgramStyling')
  await nextTick()

  expect(harness.current!.state.dialogModel.value).toBe(true)
  expect(harness.current!.state.workingCss.value).toBe('body { color: green; }')
})

/**
 * useDialogProgramStyling
 * Watching dialogUUID opens the dialog whenever the dialog store reports ProgramStyling as the next dialog to open.
 */
test('Test that dialogUUID watch opens the dialog when dialogToOpen is ProgramStyling', async () => {
  const { harness } = mountUseDialog()
  faProgramStylingCssRef.value = '.fromStore { color: pink; }'

  expect(harness.current!.state.dialogModel.value).toBe(false)

  dialogStoreRef.value!.dialogUUID = 'next-uuid'
  await nextTick()

  expect(harness.current!.state.dialogModel.value).toBe(true)
  expect(harness.current!.state.workingCss.value).toBe('.fromStore { color: pink; }')
})

/**
 * useDialogProgramStyling
 * dialogUUID watch ignores opens for other dialog targets so unrelated dialog activity does not steal focus.
 */
test('Test that dialogUUID watch ignores other dialog targets', async () => {
  const { harness } = mountUseDialog()
  dialogStoreRef.value!.dialogToOpen = 'SomethingElse'
  dialogStoreRef.value!.dialogUUID = 'next-uuid'
  await nextTick()

  expect(harness.current!.state.dialogModel.value).toBe(false)
})

/**
 * useDialogProgramStyling
 * If S_DialogComponent throws (Storybook canvas guard), the watcher silently skips opening.
 */
test('Test that dialogUUID watch skips when S_DialogComponent throws', async () => {
  dialogStoreRef.throwOnAccess = true
  const { harness } = mountUseDialog()
  await nextTick()

  expect(harness.current!.state.dialogModel.value).toBe(false)
})

/**
 * useDialogProgramStyling
 * Toggling props.directInput to ProgramStyling at runtime opens the dialog through the directInput watch.
 */
test('Test that the directInput watch opens the dialog when props.directInput becomes ProgramStyling', async () => {
  const { harness } = mountUseDialog()
  expect(harness.current!.state.dialogModel.value).toBe(false)

  harness.current!.directInput.value = 'ProgramStyling'
  await nextTick()

  expect(harness.current!.state.dialogModel.value).toBe(true)
})

/**
 * useDialogProgramStyling
 * Toggling props.directInput away from ProgramStyling fires the watcher but does not open the dialog.
 */
test('Test that the directInput watch does not open the dialog when directInput becomes a non-target value', async () => {
  const { harness } = mountUseDialog()
  expect(harness.current!.state.dialogModel.value).toBe(false)

  harness.current!.directInput.value = 'SomethingElse'
  await nextTick()

  expect(harness.current!.state.dialogModel.value).toBe(false)
})

/**
 * useDialogProgramStyling
 * onDialogShow with a valid editor host mounts the cold-loaded Monaco editor.
 */
test('Test that onDialogShow mounts Monaco when editorHostRef is set', async () => {
  const { harness } = mountUseDialog()
  const host = document.createElement('div')
  harness.current!.setEditorHost(host)
  faProgramStylingCssRef.value = '.seeded { color: orange; }'
  // Manually open and seed working copy as openDialog() would.
  harness.current!.state.workingCss.value = faProgramStylingCssRef.value

  await harness.current!.state.onDialogShow()

  expect(monacoEditorCreateMock).toHaveBeenCalledTimes(1)
  expect(monacoEditorCreateMock.mock.calls[0]?.[0]).toBe(host)
})

/**
 * useDialogProgramStyling
 * Editor onChange callback wired through useMonacoMount writes back into workingCss.
 */
test('Test that Monaco onChange updates the workingCss ref via the wired callback', async () => {
  const { harness } = mountUseDialog()
  const host = document.createElement('div')
  harness.current!.setEditorHost(host)
  await harness.current!.state.onDialogShow()

  editorInstance.setValue('typed by user')
  editorInstance.__listener?.()

  expect(harness.current!.state.workingCss.value).toBe('typed by user')
})

/**
 * useDialogProgramStyling
 * onDialogShow is a no-op when the editor host ref has not been bound by Vue yet.
 */
test('Test that onDialogShow is a no-op when editorHostRef is null', async () => {
  const { harness } = mountUseDialog()
  await harness.current!.state.onDialogShow()
  expect(monacoEditorCreateMock).not.toHaveBeenCalled()
})

/**
 * useDialogProgramStyling
 * onDialogHide disposes the editor and clears the working copy so reopening starts from the store again.
 */
test('Test that onDialogHide disposes Monaco and clears the working css', async () => {
  const { harness } = mountUseDialog()
  const host = document.createElement('div')
  harness.current!.setEditorHost(host)
  await harness.current!.state.onDialogShow()
  harness.current!.state.workingCss.value = 'about to be cleared'

  harness.current!.state.onDialogHide()

  expect(harness.current!.state.workingCss.value).toBe('')
})

/**
 * useDialogProgramStyling
 * closeWithoutSaving simply flips dialogModel to false; nothing is dispatched to the action manager.
 */
test('Test that closeWithoutSaving flips dialogModel without invoking any action', async () => {
  const { harness } = mountUseDialog('ProgramStyling')
  await nextTick()
  expect(harness.current!.state.dialogModel.value).toBe(true)

  harness.current!.state.closeWithoutSaving()

  expect(harness.current!.state.dialogModel.value).toBe(false)
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()
})

/**
 * useDialogProgramStyling
 * saveAndCloseDialog dispatches the saveProgramStyling action with the current working css and closes on success.
 */
test('Test that saveAndCloseDialog dispatches saveProgramStyling and closes the dialog on success', async () => {
  const { harness } = mountUseDialog('ProgramStyling')
  await nextTick()
  harness.current!.state.workingCss.value = 'a { color: red; }'

  await harness.current!.state.saveAndCloseDialog()

  expect(runFaActionAwaitMock).toHaveBeenCalledWith('saveProgramStyling', { css: 'a { color: red; }' })
  expect(harness.current!.state.dialogModel.value).toBe(false)
})

/**
 * useDialogProgramStyling
 * If the action returns a falsy result the dialog stays open so the user can retry without losing the working copy.
 */
test('Test that saveAndCloseDialog keeps the dialog open when the action returns falsy', async () => {
  runFaActionAwaitMock.mockResolvedValueOnce(false as unknown as true)
  const { harness } = mountUseDialog('ProgramStyling')
  await nextTick()
  harness.current!.state.workingCss.value = 'persist me later'

  await harness.current!.state.saveAndCloseDialog()

  expect(harness.current!.state.dialogModel.value).toBe(true)
})
