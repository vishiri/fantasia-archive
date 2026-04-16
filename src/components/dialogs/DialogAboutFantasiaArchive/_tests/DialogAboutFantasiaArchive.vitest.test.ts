import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import * as dialogStores from 'app/src/stores/S_Dialog'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'

import DialogAboutFantasiaArchive from '../DialogAboutFantasiaArchive.vue'

const aboutQDialogStub = defineComponent({
  name: 'QDialog',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'hide'],
  template: `
    <div class="about-qdialog-stub" v-bind="$attrs">
      <div v-if="modelValue" class="about-qdialog-inner">
        <slot />
      </div>
    </div>
  `
})

const aboutDialogGlobal = {
  mocks: { $t: (k: string) => k },
  stubs: {
    QBtn: { template: '<button type="button"><slot /></button>' },
    QCard: { template: '<div><slot /></div>' },
    QCardActions: { template: '<div><slot /></div>' },
    QCardSection: { template: '<div><slot /></div>' },
    QDialog: aboutQDialogStub,
    QSeparator: { template: '<hr />' },
    SocialContactButtons: { template: '<div data-test-locator="stub-social-contact-buttons" />' }
  }
} as const

beforeEach(() => {
  vi.restoreAllMocks()
})

/**
 * DialogAboutFantasiaArchive
 * directInput should open the about dialog and surface i18n title key via mocked translator.
 */
test('Test that DialogAboutFantasiaArchive renders about dialog shell for AboutFantasiaArchive input', async () => {
  const w = mount(DialogAboutFantasiaArchive, {
    global: aboutDialogGlobal,
    props: { directInput: 'AboutFantasiaArchive' }
  })

  await flushPromises()

  const html = w.html()
  expect(html).toContain('dialogComponent')
  expect(html).toContain('AboutFantasiaArchive')
  expect(w.text()).toContain('dialogs.aboutFantasiaArchive.title')
  expect(w.text()).toContain('dialogs.aboutFantasiaArchive.versionTitle')
  expect(w.text()).toContain('0.0.0-unit-test')
  w.unmount()
})

/**
 * DialogAboutFantasiaArchive
 * Component dialog store UUID changes should open the about dialog when dialogToOpen matches.
 */
test('Test that DialogAboutFantasiaArchive opens from S_DialogComponent UUID watch', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const st = S_DialogComponent()

  const w = mount(DialogAboutFantasiaArchive, {
    global: {
      ...aboutDialogGlobal,
      plugins: [pinia]
    }
  })

  await flushPromises()

  st.dialogToOpen = 'AboutFantasiaArchive'
  st.generateDialogUUID()
  await flushPromises()

  expect(w.html()).toContain('AboutFantasiaArchive')
  expect(w.text()).toContain('dialogs.aboutFantasiaArchive.title')
  w.unmount()
})

/**
 * DialogAboutFantasiaArchive
 * directInput watch should open only when the prop becomes AboutFantasiaArchive.
 */
test('Test that DialogAboutFantasiaArchive reacts to directInput prop after mount', async () => {
  const w = mount(DialogAboutFantasiaArchive, {
    global: {
      ...aboutDialogGlobal,
      stubs: {
        ...aboutDialogGlobal.stubs,
        SocialContactButtons: { template: '<div />' }
      }
    }
  })

  await flushPromises()

  await w.setProps({ directInput: 'AboutFantasiaArchive' })
  await flushPromises()

  expect(w.text()).toContain('dialogs.aboutFantasiaArchive.title')
  w.unmount()
})

/**
 * DialogAboutFantasiaArchive
 * resolveDialogComponentStore should swallow failures after registerComponentDialogStackGuard captured a store instance.
 */
test('Test that DialogAboutFantasiaArchive tolerates S_DialogComponent throwing from resolve helper', async () => {
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

  const w = mount(DialogAboutFantasiaArchive, {
    global: aboutDialogGlobal,
    props: { directInput: 'AboutFantasiaArchive' }
  })

  await flushPromises()
  w.unmount()
})

/**
 * DialogAboutFantasiaArchive
 * Root q-dialog should accept v-model updates from the dialog shell.
 */
test('Test that DialogAboutFantasiaArchive forwards q-dialog v-model updates', async () => {
  const w = mount(DialogAboutFantasiaArchive, {
    global: aboutDialogGlobal,
    props: { directInput: 'AboutFantasiaArchive' }
  })

  await flushPromises()

  const dlg = w.findComponent({ name: 'QDialog' })
  await dlg.vm.$emit('update:modelValue', false)
  await flushPromises()

  w.unmount()
})

/**
 * DialogAboutFantasiaArchive
 * Store UUID watch should ignore dialogToOpen values other than AboutFantasiaArchive.
 */
test('Test that DialogAboutFantasiaArchive store watch skips non-about dialogToOpen', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const st = S_DialogComponent()

  const w = mount(DialogAboutFantasiaArchive, {
    global: {
      ...aboutDialogGlobal,
      plugins: [pinia]
    }
  })

  await flushPromises()

  st.dialogToOpen = 'ProgramSettings'
  st.generateDialogUUID()
  await flushPromises()

  expect(w.find('.about-qdialog-inner').exists()).toBe(false)
  w.unmount()
})

/**
 * DialogAboutFantasiaArchive
 * directInput watch should ignore values other than AboutFantasiaArchive.
 */
test('Test that DialogAboutFantasiaArchive directInput watch skips other dialog names', async () => {
  const w = mount(DialogAboutFantasiaArchive, {
    global: aboutDialogGlobal
  })

  await flushPromises()

  await w.setProps({ directInput: 'ProgramSettings' })
  await flushPromises()

  expect(w.find('.about-qdialog-inner').exists()).toBe(false)
  w.unmount()
})

/**
 * DialogAboutFantasiaArchive
 * openDialog should tolerate a missing appDetails bridge when resolving the version string.
 */
test('Test that DialogAboutFantasiaArchive openDialog handles missing appDetails', async () => {
  const prev = window.faContentBridgeAPIs
  window.faContentBridgeAPIs = {
    ...prev,
    appDetails: undefined
  } as unknown as typeof window.faContentBridgeAPIs

  const w = mount(DialogAboutFantasiaArchive, {
    global: aboutDialogGlobal,
    props: { directInput: 'AboutFantasiaArchive' }
  })

  await flushPromises()

  expect(w.text()).toContain('dialogs.aboutFantasiaArchive.versionTitle')

  window.faContentBridgeAPIs = prev
  w.unmount()
})

/**
 * DialogAboutFantasiaArchive
 * directInput watch should no-op when the prop becomes undefined.
 */
test('Test that DialogAboutFantasiaArchive directInput watch handles undefined', async () => {
  const w = mount(DialogAboutFantasiaArchive, {
    global: aboutDialogGlobal,
    props: { directInput: 'AboutFantasiaArchive' }
  })

  await flushPromises()

  await w.setProps({ directInput: undefined })
  await flushPromises()

  w.unmount()
})
