/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- colocated defineComponent harness slices per test */
import { flushPromises, mount } from '@vue/test-utils'
import {
  defineComponent,
  h,
  nextTick,
  reactive,
  ref,
  type Ref
} from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import {
  afterEach,
  beforeEach,
  expect,
  test,
  vi
} from 'vitest'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'

import type { I_FaWindowProjectStylingState } from 'app/types/I_faWindowStylingMonaco'

import {
  useWindowProjectStyling,
  useWindowProjectStylingSurface
} from '../windowProjectStyling_manager'

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

  editorInstance.__listener = null

  editorInstance.dispose.mockClear()

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
  vi.clearAllMocks()
})

interface I_TestHarness {
  directInputRef: Ref<T_dialogName | undefined>
  setEditorHost: (host: HTMLDivElement | null) => void
  state: I_FaWindowProjectStylingState
}

function mountUseWindowProject (
  initialDirectInput?: T_dialogName | undefined
): { harness: { current: I_TestHarness | null }, wrapper: ReturnType<typeof mount> } {
  const harness = { current: null as I_TestHarness | null }

  const Harness = defineComponent({
    setup () {
      const directInputRef = ref<T_dialogName | undefined>(initialDirectInput)

      const state = useWindowProjectStyling({
        get directInput () {
          return directInputRef.value
        }
      })

      harness.current = {
        directInputRef,

        setEditorHost (host: HTMLDivElement | null): void {
          state.editorHostRef.value = host
        },

        state
      }

      return () => h('div')
    }
  })

  const wrapper = mount(Harness)

  return {
    harness,
    wrapper
  }
}

test('useWindowProjectStyling returns the baseline floating-window surface while hidden', () => {
  const { harness, wrapper } = mountUseWindowProject()
  const state = harness.current!.state

  expect(state.windowModel.value).toBe(false)

  expect(state.documentName.value).toBe('WindowProjectStyling')

  expect(state.workingCss.value).toBe('')
  expect(state.editorHostRef.value).toBeNull()

  wrapper.unmount()
})

test('WindowProjectStyling directInput previews open the floating window pulling SQLite css seeds', async () => {
  primeProjectCssStore('body { outline: none; }')

  const { harness, wrapper } = mountUseWindowProject('WindowProjectStyling')
  await nextTick()
  await flushPromises()

  expect(harness.current!.state.windowModel.value).toBe(true)

  expect(harness.current!.state.workingCss.value).toBe('body { outline: none; }')

  wrapper.unmount()
})

test('dialogUUID rotations open routing when DialogComponent targets WindowProjectStyling', async () => {
  primeProjectCssStore(':root {}')

  dialogStoreRef.value.dialogToOpen = 'WindowProjectStyling'

  const { harness, wrapper } = mountUseWindowProject()
  await nextTick()

  dialogStoreRef.value.dialogUUID = 'next-route'

  await nextTick()
  await flushPromises()

  expect(harness.current!.state.windowModel.value).toBe(true)

  wrapper.unmount()
})

test('extra dialogUUID rotations while the window stays open do not replace workingCss from the store', async () => {
  primeProjectCssStore(':root { --a: 1; }')

  dialogStoreRef.value.dialogToOpen = 'WindowProjectStyling'

  const { harness, wrapper } = mountUseWindowProject()
  await nextTick()

  dialogStoreRef.value.dialogUUID = 'route-a'

  await nextTick()
  await flushPromises()

  expect(harness.current!.state.windowModel.value).toBe(true)

  expect(harness.current!.state.workingCss.value).toBe(':root { --a: 1; }')

  harness.current!.state.workingCss.value = '.edited { color: red; }'

  dialogStoreRef.value.dialogUUID = 'route-b'

  await nextTick()
  await flushPromises()

  expect(harness.current!.state.workingCss.value).toBe('.edited { color: red; }')

  wrapper.unmount()
})

test('dialogUUID routing stays silent while S_DialogComponent is unavailable', async () => {
  dialogStoreRef.throwOnAccess = true

  const { harness, wrapper } = mountUseWindowProject()
  await nextTick()

  dialogStoreRef.value.dialogUUID = 'ghost-route'

  await nextTick()
  await flushPromises()

  expect(harness.current!.state.windowModel.value).toBe(false)

  wrapper.unmount()
})

test('runtime directInput swaps open the routed WindowProject surface', async () => {
  primeProjectCssStore('p {}')

  const { harness, wrapper } = mountUseWindowProject()
  expect(harness.current!.state.windowModel.value).toBe(false)

  harness.current!.directInputRef.value = 'WindowProjectStyling'

  await nextTick()
  await flushPromises()

  expect(harness.current!.state.windowModel.value).toBe(true)

  wrapper.unmount()
})

test('onWindowShow cold-mounts Monaco when the Vue editor host resolves', async () => {
  const { harness, wrapper } = mountUseWindowProject()

  harness.current!.setEditorHost(document.createElement('div'))
  primeProjectCssStore('.seed {}')
  harness.current!.state.workingCss.value = '.seed {}'

  await harness.current!.state.onWindowShow()

  expect(monacoEditorCreateMock).toHaveBeenCalledTimes(1)

  wrapper.unmount()
})

test('onWindowShow skips Monaco while the floating window host ref is absent', async () => {
  const { harness, wrapper } = mountUseWindowProject()

  await harness.current!.state.onWindowShow()

  expect(monacoEditorCreateMock).not.toHaveBeenCalled()

  wrapper.unmount()
})

test('Monaco emits onChange deltas into the mirrored workingCss ref', async () => {
  const { harness, wrapper } = mountUseWindowProject()

  harness.current!.setEditorHost(document.createElement('div'))

  await harness.current!.state.onWindowShow()

  editorInstance.setValue('next draft')

  editorInstance.__listener?.()

  expect(harness.current!.state.workingCss.value).toBe('next draft')

  wrapper.unmount()
})

test('saveAndCloseWindow requests sync persistence and shuts the chrome when IPC succeeds', async () => {
  primeProjectCssStore('')
  runFaActionAwaitMock.mockResolvedValue(true)

  const { harness, wrapper } = mountUseWindowProject('WindowProjectStyling')
  await nextTick()

  harness.current!.state.workingCss.value = 'final css'

  await harness.current!.state.saveAndCloseWindow()

  expect(runFaActionAwaitMock).toHaveBeenCalledWith('saveProjectStyling', {
    css: 'final css'
  })

  expect(harness.current!.state.windowModel.value).toBe(false)

  wrapper.unmount()
})

test('saveAndCloseWindow leaves the chrome open while persistence refuses to commit', async () => {
  primeProjectCssStore('')
  runFaActionAwaitMock.mockResolvedValue(false)

  const { harness, wrapper } = mountUseWindowProject('WindowProjectStyling')
  await nextTick()

  await harness.current!.state.saveAndCloseWindow()

  expect(harness.current!.state.windowModel.value).toBe(true)

  wrapper.unmount()
})

test('closeWithoutSaving refreshes project KV overlays then collapses live preview bookkeeping', async () => {
  const projectKvStore = S_FaProjectStyling()

  const refreshSpy = vi.spyOn(projectKvStore, 'refreshProjectStyling').mockResolvedValue(true)

  primeProjectCssStore('')
  projectKvStore.setCssLivePreview('temp')

  const { harness, wrapper } = mountUseWindowProject('WindowProjectStyling')
  await nextTick()

  await harness.current!.state.closeWithoutSaving()

  expect(refreshSpy).toHaveBeenCalledTimes(1)

  expect(harness.current!.state.windowModel.value).toBe(false)

  expect(S_FaProjectStyling().cssLivePreview).toBe(null)

  wrapper.unmount()
})

test('hiding WindowProjectStyling invokes clearCssLivePreview through the lifecycle watch', async () => {
  const clearSpy = vi.spyOn(S_FaProjectStyling(), 'clearCssLivePreview')

  const { harness, wrapper } = mountUseWindowProject()

  harness.current!.state.windowModel.value = true
  await nextTick()

  harness.current!.state.windowModel.value = false
  await nextTick()
  await flushPromises()

  expect(clearSpy).toHaveBeenCalledTimes(1)

  wrapper.unmount()
})

/**
 * useWindowProjectStylingSurface
 * Composes frame, help panel, and core project styling state for the SFC.
 */
test('Test that useWindowProjectStylingSurface exposes frame bindings when opened', async () => {
  const surfaceHarness: { current: ReturnType<typeof useWindowProjectStylingSurface> | null } = {
    current: null
  }

  const Harness = defineComponent({
    setup () {
      surfaceHarness.current = useWindowProjectStylingSurface({
        directInput: 'WindowProjectStyling'
      })
      return () => h('div')
    }
  })

  const wrapper = mount(Harness)
  await flushPromises()

  const surface = surfaceHarness.current!
  expect(surface.windowModel.value).toBe(true)
  expect(surface.frameStyleWithDialogTransition.value['--q-transition-duration']).toBeDefined()
  expect(surface.helpKeybindMenuOpen.value).toBe(false)
  expect(Array.isArray(surface.faThemeCustomPropertyNames.value)).toBe(true)

  const faTheme = await import('app/src/scripts/faTheme/faTheme_manager')
  const themeSpy = vi.spyOn(faTheme, 'getFaColorCustomPropertyNamesForHelpPanel').mockReturnValue(['--refreshed'])
  surface.helpKeybindMenuOpen.value = true
  await flushPromises()
  expect(themeSpy).toHaveBeenCalled()
  expect(Array.isArray(surface.monacoKeybindHelpItems.value)).toBe(true)

  wrapper.unmount()
})
