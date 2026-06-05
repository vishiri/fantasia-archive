/** @vitest-environment jsdom */
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { reactive, ref } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import * as faTheme from 'app/src/scripts/faTheme/faTheme_manager'

import { useWindowAppStylingHelpPanel } from '../windowAppStyling_manager'

const faAppStylingCssRef = ref('')

const {
  monacoEditorCreateMock,
  runFaActionAwaitMock,
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
    dialogStoreRef: {
      value: null as { dialogToOpen: string | null, dialogUUID: string } | null,
      throwOnAccess: false
    }
  }
})

vi.mock('app/src/scripts/floatingWindows/windowStylingCssMonaco_manager', () => {
  return {
    monaco: {
      editor: { create: monacoEditorCreateMock }
    }
  }
})

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => {
  return {
    runFaAction: vi.fn(),
    runFaActionAwait: runFaActionAwaitMock
  }
})

vi.mock('app/src/stores/S_FaAppStyling', () => {
  return {
    S_FaAppStyling: () => ({
      get css () {
        return faAppStylingCssRef.value
      },
      setCssLivePreview: vi.fn(),
      clearCssLivePreview: vi.fn(),
      refreshAppStyling: vi.fn(async () => true)
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
  faAppStylingCssRef.value = ''
  dialogStoreRef.value = reactive({
    dialogToOpen: 'WindowAppStyling',
    dialogUUID: '0'
  })
  dialogStoreRef.throwOnAccess = false
})

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * useWindowAppStylingHelpPanel
 * Theme custom property names refresh after the help menu opens.
 */
test('Test that FA custom property names refresh after the app styling help menu opens', async () => {
  const spy = vi.spyOn(faTheme, 'getFaColorCustomPropertyNamesForHelpPanel').mockReturnValue(['--a'])
  const open = ref(false)

  const { faThemeCustomPropertyNames } = useWindowAppStylingHelpPanel(open)

  expect(spy).toHaveBeenCalled()
  expect([...faThemeCustomPropertyNames.value]).toEqual(['--a'])

  spy.mockClear()

  open.value = true
  await flushPromises()

  expect(spy).toHaveBeenCalled()
})

/**
 * useWindowAppStylingHelpPanel
 * Palette scan runs on init and when open becomes true, not on false transitions.
 */
test('Test that useWindowAppStylingHelpPanel skips palette refresh when help menu stays closed', async () => {
  const spy = vi.spyOn(faTheme, 'getFaColorCustomPropertyNamesForHelpPanel').mockReturnValue([
    '--palette'
  ])

  const open = ref<boolean | undefined>(undefined)
  useWindowAppStylingHelpPanel(open)

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
