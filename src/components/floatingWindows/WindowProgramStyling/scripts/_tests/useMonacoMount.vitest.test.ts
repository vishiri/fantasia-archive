import {
  beforeEach,
  expect,
  test,
  vi
} from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useMonacoMount, type I_FaMonacoMount } from '../useMonacoMount'

const {
  monacoEditorCreateMock,
  editorInstance,
  editorDisposeMock,
  contentChangeDisposeMock
} = vi.hoisted(() => {
  const editorDispose = vi.fn()
  const contentChangeDispose = vi.fn()
  const onDidChangeMock = vi.fn((listener: () => void) => {
    instance.__listener = listener
    return { dispose: contentChangeDispose }
  })
  let currentValue = ''
  const instance = {
    __listener: null as null | (() => void),
    dispose: editorDispose,
    getValue: () => currentValue,
    setValue: (value: string) => {
      currentValue = value
    },
    onDidChangeModelContent: onDidChangeMock,
    layout: vi.fn(),
    focus: vi.fn()
  }

  return {
    monacoEditorCreateMock: vi.fn((_host: unknown, _opts: unknown) => instance),
    editorInstance: instance,
    editorDisposeMock: editorDispose,
    contentChangeDisposeMock: contentChangeDispose
  }
})

vi.mock('app/src/components/floatingWindows/WindowProgramStyling/scripts/cssMonaco', () => {
  return {
    monaco: {
      editor: {
        create: monacoEditorCreateMock
      }
    }
  }
})

beforeEach(() => {
  monacoEditorCreateMock.mockClear()
  monacoEditorCreateMock.mockImplementation((_host: unknown, _opts: unknown) => editorInstance)
  editorDisposeMock.mockClear()
  contentChangeDisposeMock.mockClear()
  editorInstance.__listener = null
})

const Harness = defineComponent({
  props: {
    onMountChange: {
      type: Function,
      required: true
    }
  },
  setup (props) {
    const handle: I_FaMonacoMount = useMonacoMount({
      onChange: (next: string) => props.onMountChange(next)
    })
    ;(globalThis as { __faMonacoHandle?: I_FaMonacoMount }).__faMonacoHandle = handle
    return () => h('div')
  }
})

async function mountHarness (onChange: (value: string) => void) {
  const wrapper = mount(Harness, { props: { onMountChange: onChange } })
  await nextTick()
  return wrapper
}

function getHandle (): I_FaMonacoMount {
  const found = (globalThis as { __faMonacoHandle?: I_FaMonacoMount }).__faMonacoHandle
  if (found === undefined) {
    throw new Error('Monaco mount handle was not assigned by harness setup')
  }
  return found
}

/**
 * useMonacoMount
 * Cold-loads the Monaco wrapper, mounts a CSS editor with the provided initial value, and wires onChange to onDidChangeModelContent.
 */
test('Test that mountInto creates a Monaco editor and forwards content changes', async () => {
  const onChangeSpy = vi.fn()
  await mountHarness(onChangeSpy)
  const handle = getHandle()

  const host = document.createElement('div')
  await handle.mountInto(host, 'a { color: red; }')

  expect(monacoEditorCreateMock).toHaveBeenCalledTimes(1)
  expect(monacoEditorCreateMock.mock.calls[0]?.[0]).toBe(host)
  expect(handle.editor.value).not.toBeNull()
  expect(handle.isLoading.value).toBe(false)
  expect(handle.loadError.value).toBeNull()

  editorInstance.setValue('updated css')
  editorInstance.__listener?.()
  expect(onChangeSpy).toHaveBeenCalledWith('updated css')
})

/**
 * useMonacoMount
 * If mountInto is invoked twice, the second call only refreshes the value via setValue; no second editor is created.
 */
test('Test that mountInto reuses existing instance and refreshes setValue on second call', async () => {
  const onChangeSpy = vi.fn()
  await mountHarness(onChangeSpy)
  const handle = getHandle()
  const host = document.createElement('div')

  await handle.mountInto(host, 'first')
  const setValueSpy = vi.spyOn(editorInstance, 'setValue')

  await handle.mountInto(host, 'second')

  expect(monacoEditorCreateMock).toHaveBeenCalledTimes(1)
  expect(setValueSpy).toHaveBeenCalledWith('second')
})

/**
 * useMonacoMount
 * Surfaces import / mount failures into 'loadError' and clears 'isLoading'.
 */
test('Test that mountInto sets loadError when Monaco editor.create throws', async () => {
  const onChangeSpy = vi.fn()
  await mountHarness(onChangeSpy)
  const handle = getHandle()
  monacoEditorCreateMock.mockImplementationOnce(() => {
    throw new Error('boom')
  })
  const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

  const host = document.createElement('div')
  await handle.mountInto(host, '')

  expect(handle.loadError.value).toBe('boom')
  expect(handle.isLoading.value).toBe(false)
  expect(handle.editor.value).toBeNull()
  errSpy.mockRestore()
})

/**
 * useMonacoMount
 * Non-Error throw values are coerced via String(...) into the visible loadError so the window still renders something useful.
 */
test('Test that mountInto coerces non-Error throws into a string loadError', async () => {
  const onChangeSpy = vi.fn()
  await mountHarness(onChangeSpy)
  const handle = getHandle()
  monacoEditorCreateMock.mockImplementationOnce(() => {
    // eslint-disable-next-line no-throw-literal
    throw 'plain failure'
  })
  const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

  const host = document.createElement('div')
  await handle.mountInto(host, '')

  expect(handle.loadError.value).toBe('plain failure')
  errSpy.mockRestore()
})

/**
 * useMonacoMount
 * disposeEditor cleanly tears down the editor and the content-change disposer; idempotent on repeat calls.
 */
test('Test that disposeEditor disposes the editor and the content change disposer once', async () => {
  const onChangeSpy = vi.fn()
  await mountHarness(onChangeSpy)
  const handle = getHandle()
  const host = document.createElement('div')
  await handle.mountInto(host, '')

  handle.disposeEditor()
  handle.disposeEditor()

  expect(editorDisposeMock).toHaveBeenCalledTimes(1)
  expect(contentChangeDisposeMock).toHaveBeenCalledTimes(1)
  expect(handle.editor.value).toBeNull()
})

/**
 * useMonacoMount
 * Errors thrown by editor.dispose() / content-change disposer.dispose() are swallowed at teardown.
 */
test('Test that disposeEditor swallows errors thrown by dispose calls', async () => {
  const onChangeSpy = vi.fn()
  await mountHarness(onChangeSpy)
  const handle = getHandle()
  const host = document.createElement('div')
  await handle.mountInto(host, '')

  contentChangeDisposeMock.mockImplementationOnce(() => {
    throw new Error('content disposer boom')
  })
  editorDisposeMock.mockImplementationOnce(() => {
    throw new Error('editor disposer boom')
  })

  expect(() => handle.disposeEditor()).not.toThrow()
  expect(handle.editor.value).toBeNull()
})

/**
 * useMonacoMount
 * onBeforeUnmount auto-disposes any live editor.
 */
test('Test that unmounting the harness disposes the live editor', async () => {
  const onChangeSpy = vi.fn()
  const wrapper = await mountHarness(onChangeSpy)
  const handle = getHandle()
  const host = document.createElement('div')
  await handle.mountInto(host, '')

  wrapper.unmount()

  expect(editorDisposeMock).toHaveBeenCalledTimes(1)
})
