import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { openDialogComponent } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import * as dialogStores from 'app/src/stores/S_Dialog'
import { S_DialogComponent, S_DialogMarkdown } from 'app/src/stores/S_Dialog'

import DialogMarkdownDocument from '../DialogMarkdownDocument.vue'

const markdownDialogQDialogStub = defineComponent({
  name: 'QDialog',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'hide'],
  template: '<div class="markdown-qdialog-stub" v-bind="$attrs"><slot /></div>'
})

const markdownDialogStubs = {
  QCard: { template: '<div><slot /></div>' },
  QCardActions: { template: '<div><slot /></div>' },
  QCardSection: { template: '<div><slot /></div>' },
  QDialog: markdownDialogQDialogStub,
  QMarkdown: { template: '<div data-test-locator="q-markdown-stub" />' }
} as const

const markdownDialogGlobal = {
  mocks: { $t: (k: string) => k },
  stubs: markdownDialogStubs
} as const

beforeEach(() => {
  vi.restoreAllMocks()
})

/**
 * DialogMarkdownDocument
 * directInput should open dialog styling for the named document on mount.
 */
test('Test that DialogMarkdownDocument activates license layout when directInput is license', async () => {
  const w = mount(DialogMarkdownDocument, {
    global: markdownDialogGlobal,
    props: { directInput: 'license' }
  })

  await flushPromises()

  const html = w.html()
  expect(html).toContain('dialogMarkdownDocument')
  expect(html).toContain('license')
  expect(w.find('[data-test-locator="dialogMarkdownDocument-markdown-wrapper"]').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogMarkdownDocument
 * changeLog directInput should use the matching aria label key from the i18n test double.
 */
test('Test that DialogMarkdownDocument sets changeLog aria label from i18n', async () => {
  const w = mount(DialogMarkdownDocument, {
    global: markdownDialogGlobal,
    props: { directInput: 'changeLog' }
  })

  await flushPromises()

  expect(w.html()).toContain('changeLog')
  expect(w.find('[aria-label="dialogs.markdownDocument.ariaLabels.changeLog"]').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogMarkdownDocument
 * directInput must bump markdown dialog stack count so openDialogComponent does not stack on top.
 */
test('Test that directInput open blocks openDialogComponent while markdown is visible', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const componentStore = S_DialogComponent()
  const genSpy = vi.spyOn(componentStore, 'generateDialogUUID')

  const w = mount(DialogMarkdownDocument, {
    global: {
      ...markdownDialogGlobal,
      plugins: [pinia]
    },
    props: { directInput: 'license' }
  })

  await flushPromises()
  expect(S_DialogMarkdown().markdownDialogOpenCount).toBe(1)

  openDialogComponent('ProgramSettings')
  expect(genSpy).not.toHaveBeenCalled()

  genSpy.mockRestore()
  w.unmount()
})

/**
 * DialogMarkdownDocument
 * advancedSearchCheatSheet directInput should map to the cheat sheet aria label key.
 */
test('Test that DialogMarkdownDocument maps advancedSearchCheatSheet aria label', async () => {
  const w = mount(DialogMarkdownDocument, {
    global: markdownDialogGlobal,
    props: { directInput: 'advancedSearchCheatSheet' }
  })

  await flushPromises()

  expect(w.find('[aria-label="dialogs.markdownDocument.ariaLabels.advancedSearchCheatSheet"]').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogMarkdownDocument
 * advancedSearchGuide and tipsTricksTrivia should map to their aria label keys.
 */
test('Test that DialogMarkdownDocument maps advancedSearchGuide and tipsTricksTrivia aria labels', async () => {
  const wGuide = mount(DialogMarkdownDocument, {
    global: markdownDialogGlobal,
    props: { directInput: 'advancedSearchGuide' }
  })

  await flushPromises()

  expect(wGuide.find('[aria-label="dialogs.markdownDocument.ariaLabels.advancedSearchGuide"]').exists()).toBe(true)
  wGuide.unmount()

  const wTips = mount(DialogMarkdownDocument, {
    global: markdownDialogGlobal,
    props: { directInput: 'tipsTricksTrivia' }
  })

  await flushPromises()

  expect(wTips.find('[aria-label="dialogs.markdownDocument.ariaLabels.tipsTricksTrivia"]').exists()).toBe(true)
  wTips.unmount()
})

/**
 * DialogMarkdownDocument
 * Unknown document names should fall back to the generic markdown aria label key.
 */
test('Test that DialogMarkdownDocument uses fallback aria label for test document id', async () => {
  const w = mount(DialogMarkdownDocument, {
    global: markdownDialogGlobal,
    props: { directInput: 'test' }
  })

  await flushPromises()

  expect(w.find('[aria-label="dialogs.markdownDocument.ariaLabels.fallback"]').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogMarkdownDocument
 * Markdown store UUID bumps should open the dialog when documentToOpen is set.
 */
test('Test that DialogMarkdownDocument opens when S_DialogMarkdown UUID changes', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const md = S_DialogMarkdown()

  const w = mount(DialogMarkdownDocument, {
    global: {
      mocks: { $t: (k: string) => k },
      plugins: [pinia],
      stubs: markdownDialogStubs
    }
  })

  await flushPromises()

  md.documentToOpen = 'license'
  md.generateDialogUUID()
  await flushPromises()

  expect(w.html()).toContain('license')
  w.unmount()
})

/**
 * DialogMarkdownDocument
 * directInput prop updates after mount should open the requested document.
 */
test('Test that DialogMarkdownDocument reacts to directInput prop changes', async () => {
  const w = mount(DialogMarkdownDocument, {
    global: {
      mocks: { $t: (k: string) => k },
      stubs: markdownDialogStubs
    }
  })

  await flushPromises()

  await w.setProps({ directInput: 'changeLog' })
  await flushPromises()

  expect(w.html()).toContain('changeLog')
  w.unmount()
})

/**
 * DialogMarkdownDocument
 * resolveDialogMarkdownStore should swallow failures after the markdown stack guard captured a store instance.
 */
test('Test that DialogMarkdownDocument tolerates S_DialogMarkdown throwing from resolve helper', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const orig = dialogStores.S_DialogMarkdown
  let calls = 0
  vi.spyOn(dialogStores, 'S_DialogMarkdown').mockImplementation(() => {
    calls += 1
    if (calls === 1) {
      return orig()
    }
    throw new Error('markdown store unavailable')
  })

  const w = mount(DialogMarkdownDocument, {
    global: {
      ...markdownDialogGlobal,
      plugins: [pinia]
    },
    props: { directInput: 'license' }
  })

  await flushPromises()
  w.unmount()
})

/**
 * DialogMarkdownDocument
 * Root q-dialog should accept v-model updates from the dialog shell.
 */
test('Test that DialogMarkdownDocument forwards q-dialog v-model updates', async () => {
  const w = mount(DialogMarkdownDocument, {
    global: markdownDialogGlobal,
    props: { directInput: 'license' }
  })

  await flushPromises()

  const dlg = w.findComponent({ name: 'QDialog' })
  await dlg.vm.$emit('update:modelValue', false)
  await flushPromises()

  w.unmount()
})

/**
 * DialogMarkdownDocument
 * Markdown store UUID watch should not open when documentToOpen is an empty string.
 */
test('Test that DialogMarkdownDocument store watch skips empty documentToOpen', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const md = S_DialogMarkdown()

  const w = mount(DialogMarkdownDocument, {
    global: {
      ...markdownDialogGlobal,
      plugins: [pinia]
    }
  })

  await flushPromises()

  md.documentToOpen = ''
  md.generateDialogUUID()
  await flushPromises()

  expect(w.html()).not.toContain('dialogMarkdownDocument license')
  w.unmount()
})

/**
 * DialogMarkdownDocument
 * directInput watch should ignore empty string updates.
 */
test('Test that DialogMarkdownDocument directInput watch skips empty string', async () => {
  const w = mount(DialogMarkdownDocument, {
    global: markdownDialogGlobal,
    props: { directInput: 'license' }
  })

  await flushPromises()

  await w.setProps({ directInput: '' })
  await flushPromises()

  w.unmount()
})
