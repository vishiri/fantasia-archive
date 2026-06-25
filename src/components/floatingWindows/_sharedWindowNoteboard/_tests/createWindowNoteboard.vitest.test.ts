/** @vitest-environment jsdom */
import { computed, defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, expect, test, vi } from 'vitest'

import type { T_useFaFloatingWindowFrameInjected } from 'app/types/I_useFaFloatingWindowFrameInjected'
import type { I_faWindowNoteboardVariantConfig } from 'app/types/I_faWindowNoteboardVariantConfig'
import type { T_faWindowNoteboardFactoryDeps } from 'app/types/I_faWindowNoteboardFactoryBind'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'

import { createWindowNoteboard } from '../scripts/windowNoteboard_manager'

const variant: I_faWindowNoteboardVariantConfig = {
  directInputDialogName: 'WindowAppNoteboard',
  documentNameClass: 'WindowAppNoteboard',
  floatingWindowZLayer: 'noteboard',
  persistFrameSilent: vi.fn(async () => undefined),
  saveFailureActionId: 'reportAppNoteboardSaveFailure',
  toggleKeybindCommandId: 'toggleAppNoteboard'
}

const noteboardStore = {
  isWindowOpen: ref(false),
  persistCurrentTextSilent: vi.fn(async () => undefined),
  root: ref<{ frame?: { height: number; width: number; x: number; y: number } | null } | null>(null),
  setWindowOpen: vi.fn((open: boolean) => {
    noteboardStore.isWindowOpen.value = open
  }),
  text: ref('')
}

const useFaFloatingWindowFrameMock = (() => ({
  frameRef: ref(null),
  frameStyle: computed(() => ({})),
  h: ref(200),
  onFramePointerDown: vi.fn(),
  onResizePointerDown: vi.fn(),
  onTitlePointerDown: vi.fn(),
  titleShortFrameClass: computed(() => undefined),
  w: ref(200),
  x: ref(0),
  y: ref(0)
})) as unknown as T_useFaFloatingWindowFrameInjected

function buildFactoryDeps (overrides: Partial<T_faWindowNoteboardFactoryDeps> = {}): T_faWindowNoteboardFactoryDeps {
  return {
    FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: {},
    FA_FLOATING_WINDOW_POP_TRANSITION_MS: 280,
    computed,
    formatFaKeybindCommandLabelFromSnapshot: () => null,
    getFaKeybindsStore: () => ({ snapshot: null }),
    getNoteboardStore: () => noteboardStore as unknown as StoreGeneric,
    onMounted: (hook) => {
      hook()
    },
    storeToRefs: ((store: StoreGeneric) => noteboardStore) as T_piniaStoreToRefs,
    useFaFloatingWindowFrame: useFaFloatingWindowFrameMock,
    useFaFloatingWindowFramePersist: vi.fn(),
    useFaFloatingWindowTextPersist: vi.fn(),
    variant,
    watch: vi.fn((source, effect, options) => {
      if (options?.immediate === true) {
        effect()
      }
      void source()
    }),
    ...overrides
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  noteboardStore.isWindowOpen.value = false
  noteboardStore.text.value = ''
})

test('createWindowNoteboard wires directInput prop to setWindowOpen', async () => {
  const api = createWindowNoteboard(buildFactoryDeps())

  const Harness = defineComponent({
    props: {
      directInput: {
        default: undefined,
        type: String as () => T_dialogName | undefined
      }
    },
    setup (props) {
      api.wireWindowNoteboardDirectInput(props)
      return () => null
    }
  })

  mount(Harness, {
    props: {
      directInput: 'WindowAppNoteboard'
    }
  })

  expect(noteboardStore.setWindowOpen).toHaveBeenCalledWith(true)
})

test('createWindowNoteboard useWindowNoteboard exposes documentNameClass from variant', () => {
  const api = createWindowNoteboard(buildFactoryDeps({
    formatFaKeybindCommandLabelFromSnapshot: () => 'Ctrl+N',
    onMounted: vi.fn(),
    watch: vi.fn()
  }))

  const state = api.useWindowNoteboard({})
  expect(state.documentNameClass).toBe('WindowAppNoteboard')
  expect(state.noteboardToggleKeybindLabel.value).toBe('Ctrl+N')
})
