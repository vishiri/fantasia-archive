/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

const { runFaActionAwaitMock } = vi.hoisted(() => {
  return {
    runFaActionAwaitMock: vi.fn(async () => true)
  }
})

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => {
  return {
    runFaActionAwait: runFaActionAwaitMock
  }
})

import type { I_faProjectMedia } from 'app/types/I_faProjectMediaDomain'
import { i18n } from 'app/i18n/externalFileLoader'
import * as dialogStores from 'app/src/stores/S_Dialog'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'

import DialogProjectMedia from '../DialogProjectMedia.vue'
import DialogProjectMediaPanelsColumn from '../DialogProjectMediaPanelsColumn.vue'

const projectMediaQDialogStub = defineComponent({
  name: 'QDialog',
  inheritAttrs: false,
  props: {
    modelValue: {
      default: false,
      type: Boolean
    },
    persistent: {
      default: false,
      type: Boolean
    }
  },
  emits: ['update:modelValue', 'hide'],
  template: `
    <div
      class="project-media-qdialog-stub"
      :data-persistent="String(persistent)"
      v-bind="$attrs"
    >
      <div v-if="modelValue" class="project-media-qdialog-inner">
        <slot />
      </div>
    </div>
  `
})

const projectMediaQInputStub = defineComponent({
  inheritAttrs: true,
  props: {
    modelValue: {
      default: '',
      type: String
    },
    placeholder: {
      default: '',
      type: String
    },
    type: {
      default: 'text',
      type: String
    }
  },
  emits: ['update:modelValue'],
  methods: {
    focus () {
      return undefined
    }
  },
  template: `
    <div class="q-input-stub" v-bind="$attrs">
      <slot name="prepend" />
      <textarea
        v-if="type === 'textarea'"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target).value)"
      />
      <input
        v-else
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target).value)"
      />
    </div>
  `
})

const projectMediaDialogGlobal = {
  mocks: { $t: (k: string) => k },
  stubs: {
    QBtn: {
      props: {
        disable: {
          default: false,
          type: Boolean
        },
        label: {
          default: '',
          type: String
        }
      },
      template: '<button type="button" v-bind="$attrs" :disabled="disable">{{ label }}<slot /></button>'
    },
    QCard: { template: '<div><slot /></div>' },
    QCardActions: { template: '<div><slot /></div>' },
    QCardSection: { template: '<div><slot /></div>' },
    QDialog: projectMediaQDialogStub,
    QIcon: { template: '<i><slot /></i>' },
    QInput: projectMediaQInputStub,
    QSeparator: { template: '<div class="q-separator-stub" v-bind="$attrs"></div>' },
    QTabPanel: { template: '<div class="q-tab-panel-stub"><slot /></div>' },
    QTabPanels: { template: '<div class="q-tab-panels-stub"><slot /></div>' },
    DialogProjectMediaListGrid: {
      props: {
        items: {
          default: () => [],
          type: Array
        }
      },
      template:
        '<div data-test-locator="dialogProjectMedia-listGrid">{{ items.length }}</div>'
    },
    DialogProjectMediaMassEditList: {
      props: {
        modelValue: {
          default: () => [],
          type: Array
        }
      },
      template:
        '<div data-test-locator="dialogProjectMedia-massEditList">{{ modelValue.length }}</div>'
    },
    DialogProjectMediaSingleEditPanel: {
      name: 'DialogProjectMediaSingleEditPanel',
      props: ['row', 'isSaveDisabled'],
      template: `
        <div>
          <div data-test-locator="dialogProjectMedia-title-mediaSingleEdit">
            dialogs.projectMedia.titleSingle
          </div>
          <button
            type="button"
            data-test-locator="dialogProjectMedia-singleEdit-close"
          >
            dialogs.projectMedia.closeButton
          </button>
          <button
            type="button"
            data-test-locator="dialogProjectMedia-singleEdit-saveAndClose"
            :disabled="isSaveDisabled"
          >
            dialogs.projectMedia.singleEditSaveAndCloseButton
          </button>
        </div>
      `
    },
    DialogProjectMediaSingleEditSlide: {
      name: 'DialogProjectMediaSingleEditSlide',
      props: ['row', 'nextDisabled', 'previousDisabled'],
      emits: ['close', 'next', 'previous', 'save', 'saveStay', 'update:row'],
      template: '<div data-test-locator="dialogProjectMedia-singleEditSlide"></div>'
    },
    Transition: {
      name: 'Transition',
      emits: ['after-leave'],
      template: '<div class="project-media-transition-stub"><slot /></div>'
    }
  }
} as const

beforeEach(() => {
  vi.restoreAllMocks()
  runFaActionAwaitMock.mockReset()
  runFaActionAwaitMock.mockResolvedValue(true)
})

/**
 * DialogProjectMedia
 * directInput should open the shell and surface i18n title, search, and close keys.
 */
test('Test that DialogProjectMedia renders shell for ProjectMedia input', async () => {
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: { directInput: 'ProjectMedia' }
  })

  await flushPromises()

  expect(w.html()).toContain('dialogComponent')
  expect(w.html()).toContain('ProjectMedia')
  expect(w.get('[data-test-locator="dialogProjectMedia-title-mediaList"]').text())
    .toBe('dialogs.projectMedia.titleList')
  expect(w.get('[data-test-locator="dialogProjectMedia-title-mediaAdd"]').text())
    .toBe('dialogs.projectMedia.titleAdd')
  expect(w.get('[data-test-locator="dialogProjectMedia-title-mediaAddOnlineUrls"]').text())
    .toBe('dialogs.projectMedia.titleAddOnline')
  expect(w.get('[data-test-locator="dialogProjectMedia-title-mediaMassEdit"]').text())
    .toBe('dialogs.projectMedia.titleMassEdit')
  expect(w.find('.project-media-qdialog-stub').attributes('aria-label'))
    .toBe('dialogs.projectMedia.titleList')
  expect(w.text()).toContain('dialogs.projectMedia.closeButton')
  expect(w.text()).not.toContain('dialogs.projectMedia.panelMediaList')
  expect(w.find('[data-test-locator="dialogProjectMedia-panelTitle-mediaList"]').exists()).toBe(false)
  expect(w.find('[data-test-locator="dialogProjectMedia-search"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectMedia-listGrid"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectMedia-listGrid"]').text()).toBe('0')
  expect(w.find('[data-test-locator="dialogProjectMedia-addOnlineUrlsSubmit"]').exists()).toBe(false)
  expect(w.find('.dialogProjectMedia__cardActions').exists()).toBe(false)
  expect(w.find('.project-media-qdialog-stub').attributes('data-persistent')).toBe('true')
  expect(w.getComponent(DialogProjectMediaPanelsColumn).props('selectedPanel')).toBe('mediaList')
  expect(w.find('[data-test-locator="dialogProjectMedia-massEditList"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectMedia-massEditList"]').text()).toBe('0')
  await w.getComponent(DialogProjectMediaPanelsColumn).vm.$emit('update:massEditRows', [])
  const searchInput = w.get('[data-test-locator="dialogProjectMedia-search"] input')
  await searchInput.setValue('needle')
  await flushPromises()
  expect((searchInput.element as HTMLInputElement).value).toBe('needle')
  await w.get('[data-test-locator="dialogProjectMedia-button-close"]').trigger('click')
  w.unmount()
})

/**
 * DialogProjectMedia
 * Component dialog store UUID changes should open when dialogToOpen matches.
 */
test('Test that DialogProjectMedia opens from S_DialogComponent UUID watch', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const st = S_DialogComponent()

  const w = mount(DialogProjectMedia, {
    global: {
      ...projectMediaDialogGlobal,
      plugins: [pinia]
    }
  })

  await flushPromises()

  st.dialogToOpen = 'ProjectMedia'
  st.generateDialogUUID()
  await flushPromises()

  expect(w.find('.project-media-qdialog-inner').exists()).toBe(true)
  expect(w.get('[data-test-locator="dialogProjectMedia-title-mediaList"]').text())
    .toBe('dialogs.projectMedia.titleList')
  w.unmount()
})

/**
 * DialogProjectMedia
 * directInput watch should open only when the prop becomes ProjectMedia.
 */
test('Test that DialogProjectMedia reacts to directInput prop after mount', async () => {
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal
  })

  await flushPromises()

  await w.setProps({ directInput: 'ProjectMedia' })
  await flushPromises()

  expect(w.get('[data-test-locator="dialogProjectMedia-title-mediaList"]').text())
    .toBe('dialogs.projectMedia.titleList')
  w.unmount()
})

/**
 * DialogProjectMedia
 * resolveDialogComponentStore should swallow failures after registerComponentDialogStackGuard captured a store instance.
 */
test('Test that DialogProjectMedia tolerates S_DialogComponent throwing from resolve helper', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const orig = dialogStores.S_DialogComponent
  let calls = 0
  vi.spyOn(dialogStores, 'S_DialogComponent').mockImplementation(() => {
    calls += 1
    if (calls === 1) {
      return orig()
    }
    throw new Error('component dialog store unavailable')
  })

  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: { directInput: 'ProjectMedia' }
  })

  await flushPromises()
  w.unmount()
})

/**
 * DialogProjectMedia
 * Root q-dialog should accept v-model updates from the dialog shell.
 */
test('Test that DialogProjectMedia forwards q-dialog v-model updates', async () => {
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: { directInput: 'ProjectMedia' }
  })

  await flushPromises()

  const dlg = w.findComponent({ name: 'QDialog' })
  await dlg.vm.$emit('update:modelValue', false)
  await flushPromises()

  expect(w.find('.project-media-qdialog-inner').exists()).toBe(false)
  w.unmount()
})

/**
 * DialogProjectMedia
 * Store UUID watch should ignore dialogToOpen values other than ProjectMedia.
 */
test('Test that DialogProjectMedia store watch skips non-project-media dialogToOpen', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const st = S_DialogComponent()

  const w = mount(DialogProjectMedia, {
    global: {
      ...projectMediaDialogGlobal,
      plugins: [pinia]
    }
  })

  await flushPromises()

  st.dialogToOpen = 'AppSettings'
  st.generateDialogUUID()
  await flushPromises()

  expect(w.find('.project-media-qdialog-inner').exists()).toBe(false)
  w.unmount()
})

/**
 * DialogProjectMedia
 * directInput watch should ignore values other than ProjectMedia.
 */
test('Test that DialogProjectMedia directInput watch skips other dialog names', async () => {
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal
  })

  await flushPromises()

  await w.setProps({ directInput: 'AppSettings' })
  await flushPromises()

  expect(w.find('.project-media-qdialog-inner').exists()).toBe(false)
  w.unmount()
})

/**
 * DialogProjectMedia
 * directInput watch should no-op when the prop becomes undefined.
 */
test('Test that DialogProjectMedia directInput watch handles undefined', async () => {
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: { directInput: 'ProjectMedia' }
  })

  await flushPromises()

  await w.setProps({ directInput: undefined })
  await flushPromises()

  w.unmount()
})

/**
 * DialogProjectMedia
 * initialPanel prop wins over the store requested panel on open.
 */
test('Test that DialogProjectMedia initialPanel prop selects the add panel', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  S_DialogComponent().projectMediaRequestedPanel = 'mediaMassEdit'

  const w = mount(DialogProjectMedia, {
    global: {
      ...projectMediaDialogGlobal,
      plugins: [pinia]
    },
    props: {
      directInput: 'ProjectMedia',
      initialPanel: 'mediaAdd'
    }
  })

  await flushPromises()

  expect(w.getComponent(DialogProjectMediaPanelsColumn).props('selectedPanel')).toBe('mediaAdd')
  expect(w.find('.project-media-qdialog-stub').attributes('data-persistent')).toBe('false')
  expect(w.find('.project-media-qdialog-stub').attributes('aria-label'))
    .toBe('dialogs.projectMedia.titleAdd')
  expect(w.find('[data-test-locator="dialogProjectMedia-addDropZone"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectMedia-addOfflineMediaButton"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectMedia-addOnlineMediaButton"]').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogProjectMedia
 * Add online media should slide to the URL textarea panel.
 */
test('Test that DialogProjectMedia add online media slides to the URL textarea', async () => {
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: {
      directInput: 'ProjectMedia',
      initialPanel: 'mediaAdd'
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="dialogProjectMedia-addDropZone"]').exists()).toBe(true)
  await w.get('[data-test-locator="dialogProjectMedia-addOnlineMediaButton"]').trigger('click')
  await flushPromises()

  expect(w.getComponent(DialogProjectMediaPanelsColumn).props('selectedPanel')).toBe(
    'mediaAddOnlineUrls'
  )
  expect(w.find('.project-media-qdialog-stub').attributes('aria-label'))
    .toBe('dialogs.projectMedia.titleAddOnline')
  expect(w.find('.project-media-qdialog-stub').attributes('data-persistent')).toBe('false')
  expect(w.find('.dialogProjectMedia__cardActions').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectMedia-addOnlineUrlsTitle"]').exists()).toBe(true)
  expect(w.get('[data-test-locator="dialogProjectMedia-addOnlineUrlsTitle"]').element.tagName)
    .toBe('H6')
  expect(w.find('[data-test-locator="dialogProjectMedia-addOnlineUrlsSubmit"]').exists()).toBe(true)
  expect(
    (w.get('[data-test-locator="dialogProjectMedia-addOnlineUrlsSubmit"]').element as HTMLButtonElement)
      .disabled
  ).toBe(true)
  expect(w.text()).toContain('dialogs.projectMedia.addOnlineUrlsTitle')
  expect(w.text()).toContain('dialogs.projectMedia.addOnlineUrlsSubmitButton')
  expect(w.text()).toContain('dialogs.projectMedia.closeButton')
  const urlsField = w.get('[data-test-locator="dialogProjectMedia-addOnlineUrlsInput"] textarea')
  await urlsField.setValue('https://example.com/media')
  await flushPromises()
  expect((urlsField.element as HTMLTextAreaElement).value).toBe('https://example.com/media')
  expect(w.find('.project-media-qdialog-stub').attributes('data-persistent')).toBe('true')
  expect(
    (w.get('[data-test-locator="dialogProjectMedia-addOnlineUrlsSubmit"]').element as HTMLButtonElement)
      .disabled
  ).toBe(false)
  await urlsField.setValue('')
  await flushPromises()
  expect(w.find('.project-media-qdialog-stub').attributes('data-persistent')).toBe('false')
  w.unmount()
})

/**
 * DialogProjectMedia
 * Submit media list should append intake rows and switch to mass-edit.
 */
test('Test that DialogProjectMedia submit media list switches to mass-edit with rows', async () => {
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: {
      directInput: 'ProjectMedia',
      initialPanel: 'mediaAdd'
    }
  })

  await flushPromises()

  await w.get('[data-test-locator="dialogProjectMedia-addOnlineMediaButton"]').trigger('click')
  await flushPromises()
  const urlsField = w.get('[data-test-locator="dialogProjectMedia-addOnlineUrlsInput"] textarea')
  await urlsField.setValue('https://example.com/one.png\n\nhttps://example.com/two.jpg')
  await w.get('[data-test-locator="dialogProjectMedia-addOnlineUrlsSubmit"]').trigger('click')
  await flushPromises()

  expect(w.getComponent(DialogProjectMediaPanelsColumn).props('selectedPanel')).toBe('mediaMassEdit')
  expect(w.find('.project-media-qdialog-stub').attributes('data-persistent')).toBe('true')
  expect(w.find('.project-media-qdialog-stub').attributes('aria-label'))
    .toBe('dialogs.projectMedia.titleMassEdit')
  expect(w.find('[data-test-locator="dialogProjectMedia-massEditList"]').text()).toBe('2')
  expect(w.text()).toContain('dialogs.projectMedia.massEditCloseWithoutSavingButton')
  expect(w.text()).toContain('dialogs.projectMedia.massEditSaveAndBackToListButton')
  expect(w.text()).toContain('dialogs.projectMedia.massEditSaveAndCloseButton')
  expect(w.find('[data-test-locator="dialogProjectMedia-button-saveAndBackToList"]').exists())
    .toBe(true)
  expect(w.find('[data-test-locator="dialogProjectMedia-button-saveAndClose"]').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogProjectMedia
 * Closing the dialog should restore the add drop zone panel.
 */
test('Test that DialogProjectMedia close resets the add online URLs panel', async () => {
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: {
      directInput: 'ProjectMedia',
      initialPanel: 'mediaAdd'
    }
  })

  await flushPromises()

  await w.get('[data-test-locator="dialogProjectMedia-addOnlineMediaButton"]').trigger('click')
  await flushPromises()
  expect(w.getComponent(DialogProjectMediaPanelsColumn).props('selectedPanel')).toBe(
    'mediaAddOnlineUrls'
  )

  const dlg = w.findComponent({ name: 'QDialog' })
  await dlg.vm.$emit('update:modelValue', false)
  await flushPromises()
  await dlg.vm.$emit('update:modelValue', true)
  await flushPromises()

  expect(w.getComponent(DialogProjectMediaPanelsColumn).props('selectedPanel')).toBe('mediaAdd')
  expect(w.find('.project-media-qdialog-stub').attributes('data-persistent')).toBe('false')
  expect(w.find('[data-test-locator="dialogProjectMedia-massEditList"]').text()).toBe('0')
  w.unmount()
})

/**
 * DialogProjectMedia
 * Live store panel changes switch the slide while the dialog stays open.
 */
test('Test that DialogProjectMedia switches panel from projectMediaRequestedPanel while open', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const st = S_DialogComponent()

  const w = mount(DialogProjectMedia, {
    global: {
      ...projectMediaDialogGlobal,
      plugins: [pinia]
    },
    props: { directInput: 'ProjectMedia' }
  })

  await flushPromises()

  expect(w.getComponent(DialogProjectMediaPanelsColumn).props('selectedPanel')).toBe('mediaList')
  st.projectMediaRequestedPanel = 'mediaSingleEdit'
  await flushPromises()
  expect(w.getComponent(DialogProjectMediaPanelsColumn).props('selectedPanel')).toBe(
    'mediaSingleEdit'
  )
  w.unmount()
})

/**
 * DialogProjectMedia
 * Opening the list slide fills the grid from listMedia.
 */
test('Test that DialogProjectMedia fills the list grid from listMedia', async () => {
  const listed: I_faProjectMedia[] = [{
    createdAtMs: 0,
    displayName: 'saved',
    externalEmbed: '',
    externalLink: 'https://cdn.example.com/foo/bar.png',
    externalType: 'linked',
    id: 'saved',
    internalEmbed: null,
    internalLink: '',
    internalType: 'linked_outside',
    type: 'external',
    updatedAtMs: 0
  }]
  vi.mocked(window.faContentBridgeAPIs.projectContent.listMedia).mockResolvedValue({
    items: listed
  })

  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: { directInput: 'ProjectMedia' }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="dialogProjectMedia-listGrid"]').text()).toBe('1')
  w.unmount()
})

/**
 * DialogProjectMedia
 * Single-edit tab hides generic Close and disables Save and close when empty.
 */
test('Test that DialogProjectMedia single-edit tab hides generic Close and disables save', async () => {
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: {
      directInput: 'ProjectMedia',
      initialPanel: 'mediaSingleEdit'
    }
  })

  await flushPromises()

  expect(w.get('[data-test-locator="dialogProjectMedia-title-mediaSingleEdit"]').text())
    .toBe('dialogs.projectMedia.titleSingle')
  expect(w.find('[data-test-locator="dialogProjectMedia-button-close"]').exists()).toBe(false)
  expect(w.find('[data-test-locator="dialogProjectMedia-singleEdit-close"]').exists()).toBe(true)
  expect(
    (w.get('[data-test-locator="dialogProjectMedia-singleEdit-saveAndClose"]')
      .element as HTMLButtonElement).disabled
  ).toBe(true)
  expect(w.find('.project-media-qdialog-stub').attributes('data-persistent')).toBe('false')
  w.unmount()
})

/**
 * DialogProjectMedia
 * List thumb select opens the slide and hides the generic Close footer.
 */
test('Test that DialogProjectMedia list select opens the single-edit slide', async () => {
  const listed: I_faProjectMedia = {
    createdAtMs: 0,
    displayName: 'saved',
    externalEmbed: '',
    externalLink: 'https://cdn.example.com/foo/bar.png',
    externalType: 'linked',
    id: 'saved',
    internalEmbed: null,
    internalLink: '',
    internalType: 'linked_outside',
    type: 'external',
    updatedAtMs: 0
  }
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: { directInput: 'ProjectMedia' }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="dialogProjectMedia-singleEditSlide"]').exists()).toBe(false)
  expect(w.find('[data-test-locator="dialogProjectMedia-button-close"]').exists()).toBe(true)
  await w.getComponent(DialogProjectMediaPanelsColumn).vm.$emit('selectListItem', listed)
  await flushPromises()
  expect(w.find('[data-test-locator="dialogProjectMedia-singleEditSlide"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectMedia-button-close"]').exists()).toBe(false)
  const slide = w.getComponent({ name: 'DialogProjectMediaSingleEditSlide' })
  await w.getComponent(DialogProjectMediaPanelsColumn).vm.$emit(
    'update:singleEditRow',
    {
      createdAtMs: listed.createdAtMs,
      displayName: listed.displayName,
      externalEmbed: listed.externalEmbed,
      externalLink: listed.externalLink,
      externalType: listed.externalType,
      id: listed.id,
      internalEmbed: listed.internalEmbed,
      internalLink: listed.internalLink,
      internalType: listed.internalType,
      isNew: false,
      type: listed.type,
      updatedAtMs: listed.updatedAtMs
    }
  )
  await slide.vm.$emit('update:row', {
    createdAtMs: listed.createdAtMs,
    displayName: 'renamed',
    externalEmbed: listed.externalEmbed,
    externalLink: listed.externalLink,
    externalType: listed.externalType,
    id: listed.id,
    internalEmbed: listed.internalEmbed,
    internalLink: listed.internalLink,
    internalType: listed.internalType,
    isNew: false,
    type: listed.type,
    updatedAtMs: listed.updatedAtMs
  })
  await slide.vm.$emit('previous')
  await slide.vm.$emit('next')
  await slide.vm.$emit('saveStay')
  await slide.vm.$emit('save')
  await slide.vm.$emit('close')
  await flushPromises()
  await w.getComponent({ name: 'Transition' }).vm.$emit('after-leave')
  await flushPromises()
  w.unmount()
})

/**
 * DialogProjectMedia
 * Slide Escape blurs a focused field first, then closes when no field is active.
 */
test('Test that DialogProjectMedia Escape blurs a focused field before closing the slide', async () => {
  const listed: I_faProjectMedia = {
    createdAtMs: 0,
    displayName: 'saved',
    externalEmbed: '',
    externalLink: 'https://cdn.example.com/foo/bar.png',
    externalType: 'linked',
    id: 'saved',
    internalEmbed: null,
    internalLink: '',
    internalType: 'linked_outside',
    type: 'external',
    updatedAtMs: 0
  }
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: { directInput: 'ProjectMedia' }
  })

  await flushPromises()
  await w.getComponent(DialogProjectMediaPanelsColumn).vm.$emit('selectListItem', listed)
  await flushPromises()
  expect(w.find('[data-test-locator="dialogProjectMedia-singleEditSlide"]').exists()).toBe(true)

  const field = document.createElement('input')
  document.body.appendChild(field)
  field.focus()
  expect(document.activeElement).toBe(field)
  field.dispatchEvent(new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key: 'Escape'
  }))
  await flushPromises()
  expect(document.activeElement).not.toBe(field)
  expect(w.find('[data-test-locator="dialogProjectMedia-singleEditSlide"]').exists()).toBe(true)

  document.body.dispatchEvent(new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key: 'Escape'
  }))
  await flushPromises()
  await w.getComponent({ name: 'Transition' }).vm.$emit('after-leave')
  await flushPromises()
  expect(w.find('[data-test-locator="dialogProjectMedia-singleEditSlide"]').exists()).toBe(false)
  field.remove()
  w.unmount()
})

/**
 * DialogProjectMedia
 * Mass-edit footer save buttons persist rows.
 */
test('Test that DialogProjectMedia mass-edit save buttons persist', async () => {
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: {
      directInput: 'ProjectMedia',
      initialPanel: 'mediaAdd'
    }
  })

  await flushPromises()
  await w.get('[data-test-locator="dialogProjectMedia-addOnlineMediaButton"]').trigger('click')
  await flushPromises()
  const urlsField = w.get('[data-test-locator="dialogProjectMedia-addOnlineUrlsInput"] textarea')
  await urlsField.setValue('https://example.com/one.png')
  await w.get('[data-test-locator="dialogProjectMedia-addOnlineUrlsSubmit"]').trigger('click')
  await flushPromises()
  await w.get('[data-test-locator="dialogProjectMedia-button-saveAndBackToList"]').trigger('click')
  await flushPromises()
  expect(runFaActionAwaitMock).toHaveBeenCalled()
  w.unmount()

  const closeSave = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: {
      directInput: 'ProjectMedia',
      initialPanel: 'mediaAdd'
    }
  })
  await flushPromises()
  await closeSave.get('[data-test-locator="dialogProjectMedia-addOnlineMediaButton"]').trigger(
    'click'
  )
  await flushPromises()
  await closeSave.get('[data-test-locator="dialogProjectMedia-addOnlineUrlsInput"] textarea')
    .setValue('https://example.com/two.png')
  await closeSave.get('[data-test-locator="dialogProjectMedia-addOnlineUrlsSubmit"]').trigger(
    'click'
  )
  await flushPromises()
  await closeSave.get('[data-test-locator="dialogProjectMedia-button-saveAndClose"]').trigger(
    'click'
  )
  await flushPromises()
  closeSave.unmount()
})

/**
 * DialogProjectMedia
 * A blank title uses the untitled label from the language active at save time.
 */
test('Test that DialogProjectMedia blank media title uses the current untitled label', async () => {
  const translate = i18n.global.t
  i18n.global.t = (key: string) => {
    if (key === 'dialogs.projectMedia.untitledDisplayName') {
      return 'Nameless'
    }
    return key
  }
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: {
      directInput: 'ProjectMedia',
      initialPanel: 'mediaAdd'
    }
  })

  try {
    await flushPromises()
    await w.get('[data-test-locator="dialogProjectMedia-addOnlineMediaButton"]').trigger('click')
    await flushPromises()
    await w.get('[data-test-locator="dialogProjectMedia-addOnlineUrlsInput"] textarea')
      .setValue('https://example.com')
    await w.get('[data-test-locator="dialogProjectMedia-addOnlineUrlsSubmit"]').trigger('click')
    await flushPromises()
    await w.get('[data-test-locator="dialogProjectMedia-button-saveAndClose"]').trigger('click')
    await flushPromises()
    expect(runFaActionAwaitMock).toHaveBeenCalledWith('saveProjectMedia', expect.objectContaining({
      items: [
        expect.objectContaining({
          displayName: 'Nameless'
        })
      ]
    }))
  } finally {
    i18n.global.t = translate
    w.unmount()
  }
})

/**
 * DialogProjectMedia
 * Single-edit tab close and save handlers run.
 */
test('Test that DialogProjectMedia single-edit tab emits close and save', async () => {
  const w = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: {
      directInput: 'ProjectMedia',
      initialPanel: 'mediaSingleEdit'
    }
  })

  await flushPromises()
  await w.getComponent(DialogProjectMediaPanelsColumn).vm.$emit('singleEditSave')
  await flushPromises()
  w.unmount()

  const closeTab = mount(DialogProjectMedia, {
    global: projectMediaDialogGlobal,
    props: {
      directInput: 'ProjectMedia',
      initialPanel: 'mediaSingleEdit'
    }
  })
  await flushPromises()
  await closeTab.getComponent(DialogProjectMediaPanelsColumn).vm.$emit('singleEditClose')
  await flushPromises()
  closeTab.unmount()
})
