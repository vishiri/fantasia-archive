/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import noteboardMessages from 'app/i18n/en-US/floatingWindows/L_projectNoteboard'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import { formatFaKeybindCommandLabelFromSnapshot } from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

const windowProjectNoteboardFrameSpies = vi.hoisted(() => {
  return {
    onFramePointerDown: vi.fn(),
    onResizePointerDown: vi.fn(),
    onTitlePointerDown: vi.fn()
  }
})

vi.mock('app/src/scripts/floatingWindows/useFaFloatingWindowFrame', () => ({
  useFaFloatingWindowFrame: () => ({
    frameRef: ref(null),
    frameStyle: ref({}),
    h: ref(400),
    onFramePointerDown: windowProjectNoteboardFrameSpies.onFramePointerDown,
    onResizePointerDown: windowProjectNoteboardFrameSpies.onResizePointerDown,
    onTitlePointerDown: windowProjectNoteboardFrameSpies.onTitlePointerDown,
    titleShortFrameClass: ref(undefined),
    w: ref(400),
    x: ref(0),
    y: ref(0)
  })
}))

vi.mock(
  'app/src/components/floatingWindows/WindowProjectNoteboard/scripts/useWindowProjectNoteboardFramePersist',
  () => ({
    useWindowProjectNoteboardFramePersist: () => undefined
  })
)

vi.mock(
  'app/src/components/floatingWindows/WindowProjectNoteboard/scripts/useWindowProjectNoteboardTextPersist',
  () => ({
    useWindowProjectNoteboardTextPersist: () => undefined
  })
)

import WindowProjectNoteboard from '../WindowProjectNoteboard.vue'

const noteboardT = (k: string): string => {
  if (k === 'floatingWindows.projectNoteboard.title') {
    return noteboardMessages.title
  }
  if (k === 'floatingWindows.projectNoteboard.close') {
    return noteboardMessages.close
  }
  if (k === 'floatingWindows.projectNoteboard.editorAria') {
    return noteboardMessages.editorAria
  }
  return k
}

const windowProjectNoteboardTestGlobalMount = {
  mocks: { $t: noteboardT },
  stubs: {
    FaFloatingWindowBodyTeleport: {
      template: '<div><slot /></div>'
    },
    FaFloatingWindowFrameResizeHandles: {
      template: '<div data-test-locator="faFloatingWindowFrameResizeHandles" />'
    },
    QBtn: {
      inheritAttrs: true,
      template: '<button type="button" v-bind="$attrs"><slot /></button>'
    },
    QCard: { template: '<div><slot /></div>' },
    QCardActions: { template: '<div><slot /></div>' },
    QCardSection: { template: '<div><slot /></div>' },
    Transition: { template: '<div><slot /></div>' }
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  document.body.innerHTML = ''
})

test('Test that WindowProjectNoteboard shows title, editor, and close when opened via directInput', () => {
  const keybinds = S_FaKeybinds()
  keybinds.snapshot = {
    platform: 'win32',
    store: {
      ...FA_KEYBINDS_STORE_DEFAULTS
    }
  }

  const w = mount(WindowProjectNoteboard, {
    global: windowProjectNoteboardTestGlobalMount,
    props: { directInput: 'WindowProjectNoteboard' }
  })

  expect(w.find('[data-test-locator="windowProjectNoteboard-title"]').text()).toContain(noteboardMessages.title)
  expect(w.find('[data-test-locator="windowProjectNoteboard-editor"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="windowProjectNoteboard-button-close"]').exists()).toBe(true)

  const expectedToggleLabel = formatFaKeybindCommandLabelFromSnapshot({
    commandId: 'toggleProjectNoteboard',
    snapshot: keybinds.snapshot
  })
  const keybindRow = w.find('[data-test-locator="windowProjectNoteboard-button-close-keybind"]')
  expect(expectedToggleLabel).not.toBeNull()
  expect(keybindRow.exists()).toBe(true)
  expect(keybindRow.text()).toBe(`(${expectedToggleLabel})`)
  w.unmount()
})

test('Test that WindowProjectNoteboard hides close keybind hint when keybind snapshot is not loaded', () => {
  const keybinds = S_FaKeybinds()
  keybinds.snapshot = null

  const w = mount(WindowProjectNoteboard, {
    global: windowProjectNoteboardTestGlobalMount,
    props: { directInput: 'WindowProjectNoteboard' }
  })

  expect(w.find('[data-test-locator="windowProjectNoteboard-button-close-keybind"]').exists()).toBe(false)
  w.unmount()
})
