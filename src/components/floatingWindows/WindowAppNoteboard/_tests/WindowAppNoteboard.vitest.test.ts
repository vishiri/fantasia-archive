/** @vitest-environment jsdom */
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import noteboardMessages from 'app/i18n/en-US/floatingWindows/L_appNoteboard'

import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'

const windowAppNoteboardFrameSpies = vi.hoisted(() => {
  return {
    onFramePointerDown: vi.fn(),
    onResizePointerDown: vi.fn(),
    onTitlePointerDown: vi.fn()
  }
})

vi.mock('app/src/scripts/floatingWindows/floatingWindows_manager', async (importOriginal) => {
  const actual = await importOriginal<typeof import('app/src/scripts/floatingWindows/floatingWindows_manager')>()
  return {
    ...actual,
    useFaFloatingWindowFrame: () => ({
      frameRef: ref(null),
      frameStyle: ref({}),
      h: ref(400),
      onFramePointerDown: windowAppNoteboardFrameSpies.onFramePointerDown,
      onResizePointerDown: windowAppNoteboardFrameSpies.onResizePointerDown,
      onTitlePointerDown: windowAppNoteboardFrameSpies.onTitlePointerDown,
      titleShortFrameClass: ref(undefined),
      w: ref(400),
      x: ref(0),
      y: ref(0)
    }),
    useFaFloatingWindowFramePersist: () => undefined
  }
})

vi.mock(
  'app/src/components/floatingWindows/WindowAppNoteboard/scripts/windowAppNoteboard_manager',
  async (importOriginal) => {
    const actual = await importOriginal<typeof import('app/src/components/floatingWindows/WindowAppNoteboard/scripts/windowAppNoteboard_manager')>()
    return {
      ...actual,
      useWindowAppNoteboardFramePersist: () => undefined,
      useWindowAppNoteboardTextPersist: () => undefined
    }
  }
)

import WindowAppNoteboard from '../WindowAppNoteboard.vue'

const noteboardT = (k: string): string => {
  if (k === 'floatingWindows.appNoteboard.title') {
    return noteboardMessages.title
  }
  if (k === 'floatingWindows.appNoteboard.close') {
    return noteboardMessages.close
  }
  if (k === 'floatingWindows.appNoteboard.editorAria') {
    return noteboardMessages.editorAria
  }
  return k
}

const windowAppNoteboardTestGlobalMount = {
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

test('Test that WindowAppNoteboard shows title, editor, and close when opened via directInput', async () => {
  const w = mount(WindowAppNoteboard, {
    global: windowAppNoteboardTestGlobalMount,
    props: { directInput: 'WindowAppNoteboard' }
  })

  expect(w.find('[data-test-locator="windowAppNoteboard-title"]').text()).toContain(noteboardMessages.title)
  expect(w.find('[data-test-locator="windowAppNoteboard-editor"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="windowAppNoteboard-button-close"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="windowAppNoteboard-button-close"]').text()).toContain(noteboardMessages.close)
  w.unmount()
})

/**
 * WindowAppNoteboard
 * Frame chrome should forward pointer events to the floating-window frame composable spies.
 */
test('Test that WindowAppNoteboard forwards frame and title pointerdown targets', async () => {
  windowAppNoteboardFrameSpies.onFramePointerDown.mockClear()
  windowAppNoteboardFrameSpies.onTitlePointerDown.mockClear()

  const w = mount(WindowAppNoteboard, {
    global: windowAppNoteboardTestGlobalMount,
    props: { directInput: 'WindowAppNoteboard' }
  })

  await w.get('[data-test-locator="windowAppNoteboard-frame"]').trigger('pointerdown')
  expect(windowAppNoteboardFrameSpies.onFramePointerDown).toHaveBeenCalledTimes(1)

  await w.get('[data-test-locator="windowAppNoteboard-dragHandle"]').trigger('pointerdown')
  expect(windowAppNoteboardFrameSpies.onTitlePointerDown).toHaveBeenCalledTimes(1)

  w.unmount()
})

/**
 * WindowAppNoteboard
 * Editor typing and close should mutate the noteboard window state.
 */
test('Test that WindowAppNoteboard textarea input and close button update the noteboard store', async () => {
  const noteboard = S_FaAppNoteboard()
  const closeSpy = vi.spyOn(noteboard, 'setWindowOpen')

  const w = mount(WindowAppNoteboard, {
    global: windowAppNoteboardTestGlobalMount,
    props: { directInput: 'WindowAppNoteboard' }
  })

  const editor = w.get('[data-test-locator="windowAppNoteboard-editor"]')
  await editor.setValue('note text')
  expect((editor.element as HTMLTextAreaElement).value).toBe('note text')

  await w.get('[data-test-locator="windowAppNoteboard-button-close"]').trigger('click')
  await flushPromises()

  expect(closeSpy).toHaveBeenCalledWith(false)
  closeSpy.mockRestore()
  w.unmount()
})
