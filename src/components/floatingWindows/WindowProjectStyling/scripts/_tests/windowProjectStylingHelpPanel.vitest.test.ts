/** @vitest-environment jsdom */
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { reactive, ref } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'
import * as faTheme from 'app/src/scripts/faTheme/faTheme_manager'

import { useWindowProjectStylingHelpPanel } from '../windowProjectStyling_manager'

const {
  monacoEditorCreateMock,
  editorInstance,
  runFaActionAwaitMock,
  runFaActionMock,
  dialogStoreRef
} = vi.hoisted(() => {
  let currentValue = ''

  const instance = {
    __listener: null as null | (() => void),
    dispose: vi.fn(),
    getValue (): string {
      return currentValue
    },
    focus: vi.fn(),
    layout: vi.fn(),
    onDidChangeModelContent: vi.fn((listener: () => void) => {
      instance.__listener = listener

      return {
        dispose: vi.fn()
      }
    }),
    setValue (value: string): void {
      currentValue = value
    }
  }

  return {
    dialogStoreRef: {
      throwOnAccess: false,
      value: {
        dialogToOpen: 'AboutFantasiaArchive',
        dialogUUID: 'bootstrap'
      }
    },
    editorInstance: instance,
    monacoEditorCreateMock: vi.fn((_host: unknown, _opts: unknown) => instance),
    runFaActionAwaitMock: vi.fn(async () => true),
    runFaActionMock: vi.fn()
  }
})

vi.mock('app/src/scripts/floatingWindows/windowStylingCssMonaco_manager', () => {
  return {
    monaco: {
      editor: {
        create: monacoEditorCreateMock
      }
    }
  }
})

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => {
  return {
    runFaAction: runFaActionMock,
    runFaActionAwait: runFaActionAwaitMock
  }
})

vi.mock(
  'app/src/components/floatingWindows/WindowAppStyling/scripts/windowAppStyling_manager',
  async (importOriginal) => {
    const actual = await importOriginal<typeof import('app/src/components/floatingWindows/WindowAppStyling/scripts/windowAppStyling_manager')>()
    return {
      ...actual,
      reconcileMountedMonacoWithWorkingCss: vi.fn()
    }
  }
)

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

function primeProjectCssStore (cssPayload: string): void {
  S_FaProjectStyling().applyRoot({
    css: cssPayload,
    frame: null,
    schemaVersion: 1
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  monacoEditorCreateMock.mockReset()
  monacoEditorCreateMock.mockImplementation((_host: unknown, _opts: unknown) => editorInstance)
  runFaActionAwaitMock.mockReset()
  runFaActionAwaitMock.mockResolvedValue(true)
  dialogStoreRef.throwOnAccess = false
  dialogStoreRef.value = reactive({
    dialogToOpen: 'AboutFantasiaArchive',
    dialogUUID: 'seed'
  })
  primeProjectCssStore('')
})

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * useWindowProjectStylingHelpPanel
 * Theme custom property names refresh after the help menu opens.
 */
test('Test that FA custom property names refresh after the help menu opens', async () => {
  const spy = vi.spyOn(faTheme, 'getFaColorCustomPropertyNamesForHelpPanel').mockReturnValue(['--a'])
  const open = ref(false)

  const { faThemeCustomPropertyNames } = useWindowProjectStylingHelpPanel(open)

  expect(spy).toHaveBeenCalled()
  expect([...faThemeCustomPropertyNames.value]).toEqual(['--a'])

  spy.mockClear()

  open.value = true
  await flushPromises()

  expect(spy).toHaveBeenCalled()
})

/**
 * useWindowProjectStylingHelpPanel
 * Palette scan runs on init and when open becomes true, not on false transitions.
 */
test('useWindowProjectStylingHelpPanel leaves FA palette scanners idle unless the overlay menu reports open=true', async () => {
  const spy = vi.spyOn(faTheme, 'getFaColorCustomPropertyNamesForHelpPanel').mockReturnValue([
    '--palette'
  ])

  const open = ref<boolean | undefined>(undefined)
  useWindowProjectStylingHelpPanel(open)

  const callsDuringComposableInit = spy.mock.calls.length
  expect(callsDuringComposableInit).toBeGreaterThan(0)

  spy.mockClear()
  open.value = false
  await flushPromises()
  expect(spy).not.toHaveBeenCalled()

  open.value = true
  await flushPromises()
  expect(spy).toHaveBeenCalled()
})
