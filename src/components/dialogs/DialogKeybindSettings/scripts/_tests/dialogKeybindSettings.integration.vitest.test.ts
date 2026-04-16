/**
 * Exercises multiple DialogKeybindSettings scripts modules together (capture, table, state, wiring, keydown).
 * SFC-focused and single-module tests stay in sibling _tests Vitest files next to their SUTs.
 */

import { afterEach, expect, test, vi } from 'vitest'

const { notifyCreateMock } = vi.hoisted(() => {
  return {
    notifyCreateMock: vi.fn(() => {
      return (): void => {}
    })
  }
})

vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('quasar')>()
  return {
    ...actual,
    Notify: {
      ...actual.Notify,
      create: notifyCreateMock
    }
  }
})

import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, defineComponent, nextTick, reactive, ref } from 'vue'
import { createDialogKeybindSettingsCapture } from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsCapture'
import {
  bindOnCaptureClear,
  bindOnCaptureSet,
  bindOnOpenCapture,
  makeDialogKeybindCaptureKeydownHandler
} from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsCaptureHandlers'
import {
  restorePendingChordAndLabelFromBaseline,
  runDialogKeybindCaptureKeydown
} from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsCaptureKeydown'
import { registerDialogKeybindCaptureOpenWatch } from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsCaptureInfrastructure'
import {
  registerDialogKeybindSettingsGlobalSuspend,
  runDialogKeybindSettingsOpen,
  setupDialogKeybindSettingsDialogRouting
} from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsDialogWiring'
import {
  createDialogKeybindSettingsSync,
  useDialogKeybindSettings
} from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsState'
import {
  appendVisualStubKeybindRows,
  buildDialogKeybindSettingsRows,
  buildDialogKeybindSettingsTableColumns,
  createDialogKeybindSettingsTableState
} from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsTable'
import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import type { I_faChordSerialized, I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

const tStub = (key: string) => key

afterEach(() => {
  setActivePinia(createPinia())
})

/**
 * buildDialogKeybindSettingsRows
 * Produces one row per command definition with stable keys.
 */
test('buildDialogKeybindSettingsRows lists all command ids', () => {
  const rows = buildDialogKeybindSettingsRows({
    overrides: {},
    platform: 'win32',
    t: (k: string) => k
  })
  const ids = rows.map((r) => r.commandId).sort()
  expect(ids).toEqual([
    'openKeybindSettings',
    'openProgramSettings',
    'toggleDeveloperTools'
  ])
})

test('buildDialogKeybindSettingsRows marks User keybinds as Add new when effective matches default', () => {
  const rowsDefault = buildDialogKeybindSettingsRows({
    overrides: {},
    platform: 'win32',
    t: tStub
  })
  const program = rowsDefault.find((r) => r.commandId === 'openProgramSettings')
  expect(program?.userChord).toEqual({
    code: 'Comma',
    mods: ['ctrl']
  })
  expect(program?.userShowsAddNewCombo).toBe(true)

  const rowsExplicitSame = buildDialogKeybindSettingsRows({
    overrides: {
      openProgramSettings: {
        code: 'Comma',
        mods: ['ctrl']
      }
    },
    platform: 'win32',
    t: tStub
  })
  expect(rowsExplicitSame.find((r) => r.commandId === 'openProgramSettings')?.userShowsAddNewCombo).toBe(
    true
  )

  const rowsCustom = buildDialogKeybindSettingsRows({
    overrides: {
      openProgramSettings: {
        code: 'KeyX',
        mods: ['ctrl']
      }
    },
    platform: 'win32',
    t: tStub
  })
  expect(rowsCustom.find((r) => r.commandId === 'openProgramSettings')?.userShowsAddNewCombo).toBe(false)
})

test('appendVisualStubKeybindRows adds 30 non-editable rows when enabled', () => {
  const base = buildDialogKeybindSettingsRows({
    overrides: {},
    platform: 'win32',
    t: tStub
  })
  const out = appendVisualStubKeybindRows(base, { enable: true })
  expect(out).toHaveLength(base.length + 30)
  expect(out[out.length - 1]?.rowKey).toBe('dialogKeybindSettings-visual-stub-29')
  expect(out[out.length - 1]?.editable).toBe(false)
})

test('appendVisualStubKeybindRows returns the same array when disabled', () => {
  const base = buildDialogKeybindSettingsRows({
    overrides: {},
    platform: 'win32',
    t: tStub
  })
  expect(appendVisualStubKeybindRows(base, { enable: false })).toBe(base)
})

/**
 * buildDialogKeybindSettingsTableColumns
 * Emits three column descriptors for the q-table.
 */
test('buildDialogKeybindSettingsTableColumns returns name, user, default columns', () => {
  const cols = buildDialogKeybindSettingsTableColumns(tStub)
  expect(cols.map((c) => c.name)).toEqual([
    'name',
    'userKeybinds',
    'defaultKeybinds'
  ])
})

/**
 * createDialogKeybindSettingsTableState
 * Applies the filter string to visible rows.
 */
test('createDialogKeybindSettingsTableState filters rows by name label substring', async () => {
  const filter = ref('')
  const platform = computed(() => 'win32' as NodeJS.Platform)
  const workingOverrides = ref({ ...FA_KEYBINDS_STORE_DEFAULTS.overrides })
  const { tableRows } = createDialogKeybindSettingsTableState({
    filter,
    platform,
    t: tStub,
    workingOverrides
  })
  const fullCount = tableRows.value.length
  expect(fullCount).toBeGreaterThan(0)
  filter.value = 'zzzz-no-match-string'
  await nextTick()
  expect(tableRows.value.length).toBe(0)
})

/**
 * createDialogKeybindSettingsSync
 * Save calls the store and refreshes working overrides only on success.
 */
test('createDialogKeybindSettingsSync onSaveMain returns false when updateKeybinds fails', async () => {
  setActivePinia(createPinia())
  const keybindsStore = S_FaKeybinds()
  const updateSpy = vi.spyOn(keybindsStore, 'updateKeybinds').mockResolvedValue(false)
  const workingOverrides = ref({ ...FA_KEYBINDS_STORE_DEFAULTS.overrides })
  const { onSaveMain, syncWorkingFromStore } = createDialogKeybindSettingsSync({
    keybindsStore,
    workingOverrides
  })
  syncWorkingFromStore()
  const before = JSON.stringify(workingOverrides.value)
  const ok = await onSaveMain()
  expect(ok).toBe(false)
  expect(updateSpy).toHaveBeenCalled()
  expect(JSON.stringify(workingOverrides.value)).toBe(before)
})

test('createDialogKeybindSettingsSync onSaveMain syncs after success and onCloseMain resets working state', async () => {
  setActivePinia(createPinia())
  const keybindsStore = S_FaKeybinds()
  keybindsStore.snapshot = {
    platform: 'win32',
    store: {
      overrides: {
        openProgramSettings: {
          code: 'KeyZ',
          mods: ['alt']
        }
      },
      schemaVersion: 1
    }
  }
  const workingOverrides = ref<I_faKeybindsRoot['overrides']>({})
  const { onSaveMain, onCloseMain, syncWorkingFromStore, initializeForOpen } = createDialogKeybindSettingsSync({
    keybindsStore,
    workingOverrides
  })
  vi.spyOn(keybindsStore, 'updateKeybinds').mockResolvedValue(true)
  workingOverrides.value = {
    openProgramSettings: {
      code: 'KeyY',
      mods: ['ctrl']
    }
  }
  await onSaveMain()
  expect(workingOverrides.value.openProgramSettings?.code).toBe('KeyZ')
  workingOverrides.value = {
    openProgramSettings: {
      code: 'KeyY',
      mods: ['ctrl']
    }
  }
  onCloseMain()
  expect(workingOverrides.value.openProgramSettings?.code).toBe('KeyZ')
  initializeForOpen()
  expect(workingOverrides.value.openProgramSettings?.code).toBe('KeyZ')
  keybindsStore.snapshot = null
  syncWorkingFromStore()
  expect(workingOverrides.value).toEqual({})
})

/**
 * runDialogKeybindSettingsOpen
 * Awaits refresh then opens the dialog model.
 */
test('runDialogKeybindSettingsOpen sets model true after refresh resolves', async () => {
  const dialogModel = ref(false)
  const documentName = ref<T_dialogName>('AboutFantasiaArchive')
  const initializeForOpen = vi.fn()
  const keybindsStore = {
    refreshKeybinds: vi.fn(async () => undefined)
  }
  runDialogKeybindSettingsOpen({
    dialogModel,
    documentName,
    initializeForOpen,
    keybindsStore: keybindsStore as unknown as ReturnType<typeof S_FaKeybinds>
  })
  await flushPromises()
  expect(documentName.value).toBe('KeybindSettings')
  expect(initializeForOpen).toHaveBeenCalledOnce()
  expect(dialogModel.value).toBe(true)
})

test('runDialogKeybindSettingsOpen leaves dialog closed when refresh rejects', async () => {
  notifyCreateMock.mockClear()
  const dialogModel = ref(false)
  const documentName = ref<T_dialogName>('AboutFantasiaArchive')
  const initializeForOpen = vi.fn()
  const keybindsStore = {
    refreshKeybinds: vi.fn(() => Promise.reject(new Error('bridge')))
  }
  runDialogKeybindSettingsOpen({
    dialogModel,
    documentName,
    initializeForOpen,
    keybindsStore: keybindsStore as unknown as ReturnType<typeof S_FaKeybinds>
  })
  await flushPromises()
  expect(documentName.value).toBe('KeybindSettings')
  expect(initializeForOpen).not.toHaveBeenCalled()
  expect(dialogModel.value).toBe(false)
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'globalFunctionality.faKeybinds.loadError',
      type: 'negative'
    })
  )
})

/**
 * registerDialogKeybindSettingsGlobalSuspend
 * Pins suspend while either dialog or capture popup is open and clears on unmount.
 */
test('registerDialogKeybindSettingsGlobalSuspend toggles S_FaKeybinds suspend flag', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const captureOpen = ref(false)
  const dialogModel = ref(false)
  const Comp = defineComponent({
    setup () {
      registerDialogKeybindSettingsGlobalSuspend({
        captureOpen,
        dialogModel
      })
      return {}
    },
    template: '<div />'
  })
  const w = mount(Comp, { global: { plugins: [pinia] } })
  const store = S_FaKeybinds()
  expect(store.suspendGlobalKeybindDispatch).toBe(false)
  dialogModel.value = true
  await nextTick()
  expect(store.suspendGlobalKeybindDispatch).toBe(true)
  dialogModel.value = false
  await nextTick()
  expect(store.suspendGlobalKeybindDispatch).toBe(false)
  captureOpen.value = true
  await nextTick()
  expect(store.suspendGlobalKeybindDispatch).toBe(true)
  w.unmount()
  await nextTick()
  expect(store.suspendGlobalKeybindDispatch).toBe(false)
})

/**
 * createDialogKeybindSettingsCapture
 * Records a normalized chord from a synthetic keydown event.
 */
test('createDialogKeybindSettingsCapture keydown stores formatted pending chord', () => {
  setActivePinia(createPinia())
  const platform = computed(() => 'win32' as NodeJS.Platform)
  const workingOverrides = ref({ ...FA_KEYBINDS_STORE_DEFAULTS.overrides })
  const capture = createDialogKeybindSettingsCapture({
    platform,
    t: tStub,
    workingOverrides
  })
  const row = buildDialogKeybindSettingsRows({
    overrides: {},
    platform: 'win32',
    t: (k: string) => k
  }).find((r) => r.editable)
  expect(row).toBeDefined()
  capture.onOpenCapture(row!)
  expect(capture.captureActionName.value).toBe(row!.nameLabel)
  const ev = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    code: 'KeyB',
    ctrlKey: true,
    key: 'b'
  })
  window.dispatchEvent(ev)
  expect(capture.pendingChord.value).not.toBeNull()
  capture.removeCaptureListener()
})

/**
 * useDialogKeybindSettings
 * Exposes table and capture handles after Pinia is active.
 */
test('useDialogKeybindSettings returns table and capture refs', () => {
  setActivePinia(createPinia())
  const api = useDialogKeybindSettings()
  expect(api.tableRows.value.length).toBeGreaterThan(0)
  expect(api.captureOpen.value).toBe(false)
  expect(api.captureActionName.value).toBe('')
})

test('makeDialogKeybindCaptureKeydownHandler sets validation error when chord is rejected for missing modifier', () => {
  const captureBaselineChord = ref(null)
  const captureError = ref(false)
  const captureErrorMessage = ref('')
  const captureInfoMessage = ref('')
  const captureLabel = ref('')
  const editingCommandId = ref<T_faKeybindCommandId | null>('openKeybindSettings')
  const pendingChord = ref(null)
  const platform = computed(() => 'win32' as NodeJS.Platform)
  const workingOverrides = ref({})
  const handler = makeDialogKeybindCaptureKeydownHandler({
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    editingCommandId,
    pendingChord,
    platform,
    t: tStub,
    workingOverrides
  })
  const ev = new KeyboardEvent('keydown', {
    code: 'KeyA',
    key: 'a'
  })
  handler(ev)
  expect(captureError.value).toBe(true)
  expect(captureErrorMessage.value).toBe('dialogs.keybindSettings.validationNeedModifier')
  expect(captureInfoMessage.value).toBe('')
})

test('makeDialogKeybindCaptureKeydownHandler ignores bare modifier keys without capture hint', () => {
  const captureBaselineChord = ref(null)
  const captureError = ref(false)
  const captureErrorMessage = ref('')
  const captureInfoMessage = ref('')
  const captureLabel = ref('')
  const editingCommandId = ref<T_faKeybindCommandId | null>('openKeybindSettings')
  const pendingChord = ref(null)
  const platform = computed(() => 'win32' as NodeJS.Platform)
  const workingOverrides = ref({})
  const handler = makeDialogKeybindCaptureKeydownHandler({
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    editingCommandId,
    pendingChord,
    platform,
    t: tStub,
    workingOverrides
  })
  const ev = new KeyboardEvent('keydown', {
    code: 'ShiftLeft',
    key: 'Shift',
    shiftKey: true
  })
  handler(ev)
  expect(captureError.value).toBe(false)
  expect(captureErrorMessage.value).toBe('')
  expect(captureInfoMessage.value).toBe('')
})

test('makeDialogKeybindCaptureKeydownHandler clears need modifier error after bare modifier follow-up', () => {
  const captureBaselineChord = ref(null)
  const captureError = ref(false)
  const captureErrorMessage = ref('')
  const captureInfoMessage = ref('')
  const captureLabel = ref('')
  const editingCommandId = ref<T_faKeybindCommandId | null>('openKeybindSettings')
  const pendingChord = ref(null)
  const platform = computed(() => 'win32' as NodeJS.Platform)
  const workingOverrides = ref({})
  const handler = makeDialogKeybindCaptureKeydownHandler({
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    editingCommandId,
    pendingChord,
    platform,
    t: tStub,
    workingOverrides
  })
  handler(new KeyboardEvent('keydown', {
    code: 'KeyA',
    key: 'a'
  }))
  expect(captureError.value).toBe(true)
  expect(captureErrorMessage.value).toBe('dialogs.keybindSettings.validationNeedModifier')
  expect(captureInfoMessage.value).toBe('')
  handler(new KeyboardEvent('keydown', {
    code: 'ControlLeft',
    ctrlKey: true,
    key: 'Control'
  }))
  expect(captureError.value).toBe(false)
  expect(captureErrorMessage.value).toBe('')
  expect(captureInfoMessage.value).toBe('')
})

test('makeDialogKeybindCaptureKeydownHandler flags chord that matches another action effective binding', () => {
  const captureBaselineChord = ref(null)
  const captureError = ref(false)
  const captureErrorMessage = ref('')
  const captureInfoMessage = ref('')
  const captureLabel = ref('')
  const editingCommandId = ref<T_faKeybindCommandId | null>('openKeybindSettings')
  const pendingChord = ref(null)
  const platform = computed(() => 'win32' as NodeJS.Platform)
  const workingOverrides = ref<I_faKeybindsRoot['overrides']>({})
  const handler = makeDialogKeybindCaptureKeydownHandler({
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    editingCommandId,
    pendingChord,
    platform,
    t: tStub,
    workingOverrides
  })
  const ev = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    code: 'Comma',
    ctrlKey: true,
    key: ','
  })
  handler(ev)
  expect(pendingChord.value).toBeNull()
  expect(captureLabel.value).toBe('')
  expect(captureError.value).toBe(true)
  expect(captureErrorMessage.value).toBe('dialogs.keybindSettings.validationConflict')
  expect(captureInfoMessage.value).toBe('')
})

test('makeDialogKeybindCaptureKeydownHandler allows chord when prior default owner moved to a different binding', () => {
  const captureBaselineChord = ref(null)
  const captureError = ref(false)
  const captureErrorMessage = ref('')
  const captureInfoMessage = ref('')
  const captureLabel = ref('')
  const editingCommandId = ref<T_faKeybindCommandId | null>('openKeybindSettings')
  const pendingChord = ref(null)
  const platform = computed(() => 'win32' as NodeJS.Platform)
  const workingOverrides = ref<I_faKeybindsRoot['overrides']>({
    openProgramSettings: {
      code: 'KeyX',
      mods: ['ctrl']
    }
  })
  const handler = makeDialogKeybindCaptureKeydownHandler({
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    editingCommandId,
    pendingChord,
    platform,
    t: tStub,
    workingOverrides
  })
  const ev = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    code: 'Comma',
    ctrlKey: true,
    key: ','
  })
  handler(ev)
  expect(captureError.value).toBe(false)
  expect(captureErrorMessage.value).toBe('')
})

test('makeDialogKeybindCaptureKeydownHandler keeps conflict message after a modifier-only follow-up key', () => {
  const captureBaselineChord = ref(null)
  const captureError = ref(false)
  const captureErrorMessage = ref('')
  const captureInfoMessage = ref('')
  const captureLabel = ref('')
  const editingCommandId = ref<T_faKeybindCommandId | null>('openKeybindSettings')
  const pendingChord = ref(null)
  const platform = computed(() => 'win32' as NodeJS.Platform)
  const workingOverrides = ref<I_faKeybindsRoot['overrides']>({})
  const handler = makeDialogKeybindCaptureKeydownHandler({
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    editingCommandId,
    pendingChord,
    platform,
    t: tStub,
    workingOverrides
  })
  handler(new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    code: 'Comma',
    ctrlKey: true,
    key: ','
  }))
  expect(captureError.value).toBe(true)
  handler(new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    code: 'ShiftLeft',
    key: 'Shift',
    shiftKey: true
  }))
  expect(captureError.value).toBe(true)
  expect(captureErrorMessage.value).toBe('dialogs.keybindSettings.validationConflict')
})

test('bindOnCaptureClear skips workingOverrides mutation when editingCommandId is null', () => {
  setActivePinia(createPinia())
  const workingOverrides = ref({ ...FA_KEYBINDS_STORE_DEFAULTS.overrides })
  const captureBaselineChord = ref<I_faChordSerialized | null>(null)
  const captureError = ref(false)
  const captureErrorMessage = ref('')
  const captureInfoMessage = ref('')
  const captureLabel = ref('')
  const captureOpen = ref(false)
  const editingCommandId = ref<T_faKeybindCommandId | null>(null)
  const pendingChord = ref<I_faChordSerialized | null>(null)
  const before = JSON.stringify(workingOverrides.value)

  bindOnCaptureClear({
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    captureOpen,
    editingCommandId,
    pendingChord,
    workingOverrides
  })()

  expect(JSON.stringify(workingOverrides.value)).toBe(before)
  expect(captureOpen.value).toBe(false)
})

test('bindOnOpenCapture treats userChord undefined like empty when seeding capture fields', () => {
  setActivePinia(createPinia())
  const platform = computed(() => 'win32' as NodeJS.Platform)
  const workingOverrides = ref({ ...FA_KEYBINDS_STORE_DEFAULTS.overrides })
  const captureOpen = ref(false)
  const captureActionName = ref('')
  const captureError = ref(false)
  const captureErrorMessage = ref('')
  const captureInfoMessage = ref('')
  const captureLabel = ref('prior')
  const captureBaselineChord = ref<I_faChordSerialized | null>(null)
  const pendingChord = ref<I_faChordSerialized | null>({
    code: 'KeyZ',
    mods: ['ctrl']
  })
  const editingCommandId = ref<T_faKeybindCommandId | null>(null)
  const handleCaptureKeydown = vi.fn()
  const removeCaptureListener = vi.fn()
  const deps = {
    captureActionName,
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    captureOpen,
    editingCommandId,
    handleCaptureKeydown,
    pendingChord,
    platform,
    removeCaptureListener,
    t: tStub,
    workingOverrides
  }
  const onOpen = bindOnOpenCapture(deps)
  const row = buildDialogKeybindSettingsRows({
    overrides: {},
    platform: 'win32',
    t: tStub
  }).find((r) => r.commandId === 'openProgramSettings')
  expect(row).toBeDefined()
  onOpen({
    ...row!,
    editable: true,
    userChord: undefined as unknown as null
  })
  expect(pendingChord.value).toBeNull()
  expect(captureLabel.value).toBe('')
})

test('bindOnOpenCapture leaves pending chord empty when the row has no effective shortcut', () => {
  setActivePinia(createPinia())
  const platform = computed(() => 'win32' as NodeJS.Platform)
  const workingOverrides = ref({ ...FA_KEYBINDS_STORE_DEFAULTS.overrides })
  const captureOpen = ref(false)
  const captureActionName = ref('')
  const captureError = ref(false)
  const captureErrorMessage = ref('')
  const captureInfoMessage = ref('')
  const captureLabel = ref('prior')
  const captureBaselineChord = ref<{ code: string; mods: ('ctrl' | 'alt' | 'meta' | 'shift')[] } | null>(null)
  const pendingChord = ref<{ code: string; mods: ('ctrl' | 'alt' | 'meta' | 'shift')[] } | null>({
    code: 'KeyZ',
    mods: ['ctrl']
  })
  const editingCommandId = ref<T_faKeybindCommandId | null>(null)
  const removeCaptureListener = vi.fn()
  const handleCaptureKeydown = vi.fn()
  const deps = {
    captureActionName,
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    captureOpen,
    editingCommandId,
    handleCaptureKeydown,
    pendingChord,
    platform,
    removeCaptureListener,
    t: tStub,
    workingOverrides
  }
  const onOpen = bindOnOpenCapture(deps)
  const keybindRow = buildDialogKeybindSettingsRows({
    overrides: {},
    platform: 'win32',
    t: tStub
  }).find((r) => r.commandId === 'openKeybindSettings')
  expect(keybindRow?.userChord).toBeNull()
  expect(keybindRow?.userShowsAddNewCombo).toBe(true)
  expect(keybindRow).toBeDefined()
  onOpen(keybindRow!)
  expect(pendingChord.value).toBeNull()
  expect(captureLabel.value).toBe('')
  expect(captureBaselineChord.value).toBeNull()
})

test('capture handler bindings cover open, clear, and set paths', () => {
  setActivePinia(createPinia())
  const platform = computed(() => 'win32' as NodeJS.Platform)
  const workingOverrides = ref({
    ...FA_KEYBINDS_STORE_DEFAULTS.overrides,
    openProgramSettings: {
      code: 'KeyX',
      mods: ['ctrl' as const]
    }
  })
  const captureOpen = ref(false)
  const captureActionName = ref('')
  const captureError = ref(false)
  const captureErrorMessage = ref('')
  const captureInfoMessage = ref('')
  const captureLabel = ref('')
  const captureBaselineChord = ref<{ code: string; mods: ('ctrl' | 'alt' | 'meta' | 'shift')[] } | null>(null)
  const pendingChord = ref<{ code: string; mods: ('ctrl' | 'alt' | 'meta' | 'shift')[] } | null>(null)
  const editingCommandId = ref<T_faKeybindCommandId | null>(null)
  const removeCaptureListener = vi.fn()
  const handleCaptureKeydown = vi.fn()

  const deps = {
    captureActionName,
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    captureOpen,
    editingCommandId,
    handleCaptureKeydown,
    pendingChord,
    platform,
    removeCaptureListener,
    t: tStub,
    workingOverrides
  }

  const onOpen = bindOnOpenCapture(deps)
  const rows = buildDialogKeybindSettingsRows({
    overrides: workingOverrides.value,
    platform: 'win32',
    t: tStub
  })
  const programRow = rows.find((r) => r.commandId === 'openProgramSettings')
  expect(programRow).toBeDefined()
  onOpen({
    ...programRow!,
    editable: false
  })
  expect(captureOpen.value).toBe(false)

  const editable = rows.find((r) => r.editable && r.commandId === 'openProgramSettings')
  expect(editable).toBeDefined()
  onOpen(editable!)
  expect(captureOpen.value).toBe(true)
  expect(captureActionName.value).toBe(editable!.nameLabel)
  expect(editingCommandId.value).toBe('openProgramSettings')
  expect(pendingChord.value).toEqual({
    code: 'KeyX',
    mods: ['ctrl']
  })
  expect(captureLabel.value.length).toBeGreaterThan(0)
  expect(captureBaselineChord.value).toEqual({
    code: 'KeyX',
    mods: ['ctrl']
  })

  bindOnCaptureClear(deps)()
  expect(pendingChord.value).toBeNull()
  expect(captureOpen.value).toBe(false)
  expect(workingOverrides.value.openProgramSettings).toBeNull()

  const editableAfterClear = buildDialogKeybindSettingsRows({
    overrides: workingOverrides.value,
    platform: 'win32',
    t: tStub
  }).find((r) => r.editable && r.commandId === 'openProgramSettings')
  expect(editableAfterClear).toBeDefined()
  onOpen(editableAfterClear!)
  expect(captureOpen.value).toBe(true)
  pendingChord.value = null
  captureLabel.value = ''
  bindOnCaptureSet(deps)()
  expect(captureOpen.value).toBe(true)

  pendingChord.value = {
    code: 'KeyI',
    mods: [
      'alt',
      'ctrl',
      'shift'
    ]
  }
  bindOnCaptureSet(deps)()
  expect(captureError.value).toBe(true)
  expect(captureErrorMessage.value).toBe('dialogs.keybindSettings.validationConflict')
  expect(captureInfoMessage.value).toBe('')
  expect(pendingChord.value).toEqual({
    code: 'Comma',
    mods: ['ctrl']
  })

  captureError.value = false
  captureErrorMessage.value = ''
  captureInfoMessage.value = ''
  pendingChord.value = {
    code: 'KeyQ',
    mods: ['ctrl']
  }
  bindOnCaptureSet(deps)()
  expect(captureOpen.value).toBe(false)
  expect(workingOverrides.value.openProgramSettings?.code).toBe('KeyQ')
})

test('registerDialogKeybindCaptureOpenWatch removes listener when capture closes', async () => {
  const captureOpen = ref(true)
  const captureActionName = ref('Open program settings')
  const editingCommandId = ref<T_faKeybindCommandId>('openProgramSettings')
  const removed = vi.fn()
  registerDialogKeybindCaptureOpenWatch({
    captureActionName,
    captureOpen,
    editingCommandId,
    removeCaptureListener: removed
  })
  captureOpen.value = false
  await nextTick()
  expect(removed).toHaveBeenCalledOnce()
  expect(editingCommandId.value).toBeNull()
  expect(captureActionName.value).toBe('')
})

test('setupDialogKeybindSettingsDialogRouting opens on UUID and directInput, and saveMain respects result', async () => {
  setActivePinia(createPinia())
  const dialogModel = ref(false)
  const documentName = ref<T_dialogName>('AboutFantasiaArchive')
  const keybindsStore = S_FaKeybinds()
  keybindsStore.snapshot = {
    platform: 'darwin',
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  }
  const initializeForOpen = vi.fn()
  const onSaveMain = vi.fn(async () => false)
  const props = reactive<{ directInput?: T_dialogName }>({})
  const { formatChord, saveMain } = setupDialogKeybindSettingsDialogRouting({
    dialogModel,
    documentName,
    initializeForOpen,
    keybindsStore,
    onSaveMain,
    props
  })
  expect(formatChord({
    code: 'KeyA',
    mods: ['ctrl']
  })).toContain('Ctrl')

  const componentStore = S_DialogComponent()
  componentStore.dialogToOpen = 'ProgramSettings'
  componentStore.generateDialogUUID()
  await flushPromises()
  expect(dialogModel.value).toBe(false)

  componentStore.dialogToOpen = 'KeybindSettings'
  componentStore.generateDialogUUID()
  await flushPromises()
  expect(dialogModel.value).toBe(true)

  dialogModel.value = false
  props.directInput = 'KeybindSettings'
  await nextTick()
  await flushPromises()
  expect(dialogModel.value).toBe(true)

  dialogModel.value = true
  await saveMain()
  expect(onSaveMain).toHaveBeenCalled()
  expect(dialogModel.value).toBe(true)

  onSaveMain.mockResolvedValueOnce(true)
  await saveMain()
  expect(dialogModel.value).toBe(false)
})

test('setupDialogKeybindSettingsDialogRouting directInput watch ignores non-KeybindSettings values', async () => {
  setActivePinia(createPinia())
  const dialogModel = ref(false)
  const documentName = ref<T_dialogName>('AboutFantasiaArchive')
  const keybindsStore = S_FaKeybinds()
  keybindsStore.snapshot = {
    platform: 'win32',
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  }
  const props = reactive<{ directInput?: T_dialogName }>({})
  setupDialogKeybindSettingsDialogRouting({
    dialogModel,
    documentName,
    initializeForOpen: vi.fn(),
    keybindsStore,
    onSaveMain: vi.fn(async () => true),
    props
  })
  props.directInput = 'AboutFantasiaArchive'
  await nextTick()
  await flushPromises()
  expect(dialogModel.value).toBe(false)
})

test('setupDialogKeybindSettingsDialogRouting formatChord uses win32 when snapshot is null', () => {
  setActivePinia(createPinia())
  const dialogModel = ref(false)
  const documentName = ref<T_dialogName>('AboutFantasiaArchive')
  const keybindsStore = S_FaKeybinds()
  keybindsStore.snapshot = null
  const { formatChord } = setupDialogKeybindSettingsDialogRouting({
    dialogModel,
    documentName,
    initializeForOpen: vi.fn(),
    keybindsStore,
    onSaveMain: vi.fn(async () => true),
    props: {}
  })
  expect(formatChord({
    code: 'KeyA',
    mods: ['ctrl']
  })).toContain('Ctrl')
})

test('setupDialogKeybindSettingsDialogRouting registers when Pinia is inactive for dialog store', () => {
  setActivePinia(undefined as never)
  const dialogModel = ref(false)
  const documentName = ref<T_dialogName>('AboutFantasiaArchive')
  const keybindsStore = {
    refreshKeybinds: vi.fn(async () => undefined),
    snapshot: {
      platform: 'win32' as const,
      store: { ...FA_KEYBINDS_STORE_DEFAULTS }
    }
  }
  expect(() => {
    setupDialogKeybindSettingsDialogRouting({
      dialogModel,
      documentName,
      initializeForOpen: vi.fn(),
      keybindsStore: keybindsStore as unknown as ReturnType<typeof S_FaKeybinds>,
      onSaveMain: vi.fn(async () => true),
      props: {}
    })
  }).not.toThrow()
})

test('runDialogKeybindCaptureKeydown skips conflict lookup when editingCommandId is null', () => {
  const captureBaselineChord = ref<I_faChordSerialized | null>(null)
  const captureError = ref(false)
  const captureErrorMessage = ref('')
  const captureInfoMessage = ref('')
  const captureLabel = ref('')
  const editingCommandId = ref<T_faKeybindCommandId | null>(null)
  const pendingChord = ref(null)
  const platform = computed(() => 'win32' as NodeJS.Platform)
  const workingOverrides = ref({})
  runDialogKeybindCaptureKeydown(new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    code: 'Comma',
    ctrlKey: true,
    key: ','
  }), {
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    editingCommandId,
    pendingChord,
    platform,
    t: tStub,
    workingOverrides
  })
  expect(pendingChord.value).toEqual({
    code: 'Comma',
    mods: ['ctrl']
  })
  expect(captureError.value).toBe(false)
})

test('runDialogKeybindCaptureKeydown restores pending chord and label to baseline on duplicate', () => {
  const captureBaselineChord = ref<I_faChordSerialized | null>({
    code: 'Comma',
    mods: ['ctrl']
  })
  const captureError = ref(false)
  const captureErrorMessage = ref('')
  const captureInfoMessage = ref('')
  const captureLabel = ref('Ctrl + ,')
  const editingCommandId = ref<T_faKeybindCommandId | null>('openProgramSettings')
  const pendingChord = ref<I_faChordSerialized | null>({
    code: 'Comma',
    mods: ['ctrl']
  })
  const platform = computed(() => 'win32' as NodeJS.Platform)
  const workingOverrides = ref<I_faKeybindsRoot['overrides']>({})
  runDialogKeybindCaptureKeydown(new KeyboardEvent('keydown', {
    altKey: true,
    bubbles: true,
    cancelable: true,
    code: 'KeyI',
    ctrlKey: true,
    key: 'i',
    shiftKey: true
  }), {
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    editingCommandId,
    pendingChord,
    platform,
    t: tStub,
    workingOverrides
  })
  expect(captureError.value).toBe(true)
  expect(captureErrorMessage.value).toBe('dialogs.keybindSettings.validationConflict')
  expect(pendingChord.value).toEqual({
    code: 'Comma',
    mods: ['ctrl']
  })
  expect(captureLabel.value.length).toBeGreaterThan(0)
})

test('restorePendingChordAndLabelFromBaseline clears display when baseline is null', () => {
  const captureBaselineChord = ref<I_faChordSerialized | null>(null)
  const captureLabel = ref('temp')
  const pendingChord = ref<I_faChordSerialized | null>({
    code: 'KeyB',
    mods: ['ctrl']
  })
  const platform = computed(() => 'win32' as NodeJS.Platform)
  restorePendingChordAndLabelFromBaseline({
    captureBaselineChord,
    captureLabel,
    pendingChord,
    platform
  })
  expect(pendingChord.value).toBeNull()
  expect(captureLabel.value).toBe('')
})
