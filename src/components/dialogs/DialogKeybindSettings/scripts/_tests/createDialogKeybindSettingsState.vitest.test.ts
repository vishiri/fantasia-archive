import { expect, test, vi } from 'vitest'

import { createDialogKeybindSettingsState } from '../functions/createDialogKeybindSettingsState'

test('createDialogKeybindSettingsState exposes state bundle and sync factories', () => {
  const createStateBundle = vi.fn(() => {
    return {
      capture: {},
      filter: {
        value: null
      },
      sync: {
        flushPending: vi.fn()
      },
      table: {},
      workingOverrides: {
        value: {}
      }
    }
  })
  const createSync = vi.fn(() => {
    return {
      flushPending: vi.fn(),
      initializeForOpen: vi.fn(),
      onCloseMain: vi.fn(),
      onSaveMain: vi.fn(),
      syncWorkingFromStore: vi.fn()
    }
  })
  const useSettings = vi.fn(() => {
    return {
      captureActionName: null,
      captureError: false,
      captureErrorMessage: '',
      captureInfoMessage: '',
      captureOpen: false,
      capturePendingChord: null,
      capturePendingLabel: '',
      captureRowId: null,
      dialogModel: {
        value: false
      },
      filter: {
        value: null
      },
      hasUnsavedChanges: false,
      isSaving: false,
      onCaptureClear: vi.fn(),
      onCaptureSet: vi.fn(),
      onCloseMain: vi.fn(),
      onOpenCapture: vi.fn(),
      onSaveMain: vi.fn(),
      rows: [],
      tableColumns: [],
      workingOverrides: {
        value: {}
      }
    }
  })

  const api = createDialogKeybindSettingsState({
    createDialogKeybindSettingsStateBundle: createStateBundle as never,
    createDialogKeybindSettingsSync: createSync as never,
    stateDeps: {
      runFaActionAwait: vi.fn()
    } as never,
    useDialogKeybindSettingsFromDeps: useSettings as never
  })

  const bundle = api.createDialogKeybindSettingsState((key) => key)
  const sync = api.createDialogKeybindSettingsSync({
    filter: {
      value: null
    },
    keybindsStore: {
      snapshot: null
    },
    workingOverrides: {
      value: {}
    }
  } as never)
  const settings = api.useDialogKeybindSettings()

  expect(createStateBundle).toHaveBeenCalledOnce()
  expect(createSync).toHaveBeenCalledOnce()
  expect(useSettings).toHaveBeenCalledOnce()
  expect(bundle).toHaveProperty('table')
  expect(sync).toHaveProperty('flushPending')
  expect(settings).toHaveProperty('dialogModel')
})
