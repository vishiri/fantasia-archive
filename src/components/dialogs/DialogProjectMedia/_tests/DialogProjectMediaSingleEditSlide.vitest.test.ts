import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import type { I_faProjectMediaMassEditRow } from 'app/types/I_faProjectMediaDomain'

import DialogProjectMediaSingleEditSlide from '../DialogProjectMediaSingleEditSlide.vue'
import { FA_DIALOG_PROJECT_MEDIA_SINGLE_EDIT_SLIDE_MS } from '../scripts/dialogProjectMedia_manager'

const sampleRow: I_faProjectMediaMassEditRow = {
  createdAtMs: 0,
  displayName: 'bar',
  externalEmbed: '',
  externalLink: 'https://cdn.example.com/foo/bar.png',
  externalType: 'linked',
  id: 'row-1',
  internalEmbed: null,
  internalLink: '',
  internalType: 'linked_outside',
  isNew: false,
  type: 'external',
  updatedAtMs: 0
}

const slideGlobal = {
  mocks: { $t: (k: string) => k },
  stubs: {
    DialogProjectMediaSingleEditForm: {
      name: 'DialogProjectMediaSingleEditForm',
      props: {
        dense: {
          default: true,
          type: Boolean
        }
      },
      emits: ['update:row'],
      template: '<div data-test-locator="dialogProjectMedia-singleEdit-form"></div>'
    },
    QBtn: {
      props: {
        disable: {
          default: false,
          type: Boolean
        },
        icon: {
          default: '',
          type: String
        },
        label: {
          default: '',
          type: String
        },
        outline: {
          default: false,
          type: Boolean
        },
        round: {
          default: false,
          type: Boolean
        }
      },
      template: '<button type="button" v-bind="$attrs" :data-icon="icon" :disabled="disable">{{ label }}</button>'
    }
  }
} as const

/**
 * DialogProjectMediaSingleEditSlide
 * Slide chrome has nav, Close, Save without close, and Save and close.
 */
test('Test that DialogProjectMediaSingleEditSlide renders form Close and Save', async () => {
  const w = mount(DialogProjectMediaSingleEditSlide, {
    global: slideGlobal,
    props: {
      nextDisabled: false,
      previousDisabled: true,
      row: sampleRow
    }
  })

  expect(w.find('[data-test-locator="dialogProjectMedia-singleEditSlide"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectMedia-singleEditSlide-backdrop"]').exists())
    .toBe(true)
  expect(w.find('[data-test-locator="dialogProjectMedia-singleEdit-form"]').exists()).toBe(true)
  expect(w.getComponent({ name: 'DialogProjectMediaSingleEditForm' }).props('dense')).toBe(false)
  expect(w.find('.dialogProjectMediaSlideTitle').exists()).toBe(false)
  expect(
    w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-previous"]').attributes('disabled')
  ).toBeDefined()
  expect(
    w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-next"]').attributes('disabled')
  ).toBeUndefined()
  expect(
    w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-previous"]').attributes('data-icon')
  ).toBe('keyboard_arrow_left')
  expect(
    w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-previous"]').classes()
  ).toContain('dialogProjectMediaSingleEditSlide__navBtn')
  expect(
    w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-next"]').classes()
  ).toContain('dialogProjectMediaSingleEditSlide__navBtn')
  expect(w.find('q-tooltip').exists()).toBe(false)
  await w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-close"]').trigger('click')
  expect(w.emitted('close')).toHaveLength(1)
  await w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-saveStay"]').trigger('click')
  expect(w.emitted('saveStay')).toHaveLength(1)
  await w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-save"]').trigger('click')
  expect(w.emitted('save')).toHaveLength(1)
  await w.getComponent({ name: 'DialogProjectMediaSingleEditForm' }).vm.$emit(
    'update:row',
    {
      ...sampleRow,
      displayName: 'changed'
    }
  )
  expect(w.emitted('update:row')?.[0]).toEqual([{
    ...sampleRow,
    displayName: 'changed'
  }])
  await w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-previous"]').trigger('click')
  expect(w.emitted('previous')).toBeUndefined()
  await w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-next"]').trigger('click')
  expect(w.emitted('next')).toHaveLength(1)
  w.unmount()

  const nav = mount(DialogProjectMediaSingleEditSlide, {
    global: slideGlobal,
    props: {
      nextDisabled: true,
      previousDisabled: false,
      row: sampleRow
    }
  })
  await nav.get('[data-test-locator="dialogProjectMedia-singleEditSlide-previous"]').trigger(
    'click'
  )
  expect(nav.emitted('previous')).toHaveLength(1)
  await nav.get('[data-test-locator="dialogProjectMedia-singleEditSlide-next"]').trigger('click')
  expect(nav.emitted('next')).toBeUndefined()
  nav.unmount()
})

/**
 * DialogProjectMediaSingleEditSlide
 * Null row hides the form.
 */
test('Test that DialogProjectMediaSingleEditSlide hides the form when row is null', async () => {
  const w = mount(DialogProjectMediaSingleEditSlide, {
    global: slideGlobal,
    props: {
      nextDisabled: true,
      previousDisabled: true,
      row: null
    }
  })

  expect(w.find('[data-test-locator="dialogProjectMedia-singleEdit-form"]').exists()).toBe(false)
  await w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-next"]').trigger('click')
  expect(w.emitted('next')).toBeUndefined()
  w.unmount()

  const emitOnly = mount(DialogProjectMediaSingleEditSlide, {
    global: slideGlobal,
    props: {
      nextDisabled: false,
      previousDisabled: false,
      row: null
    }
  })
  await emitOnly.get('[data-test-locator="dialogProjectMedia-singleEditSlide-next"]').trigger(
    'click'
  )
  expect(emitOnly.emitted('next')).toHaveLength(1)
  await emitOnly.get('[data-test-locator="dialogProjectMedia-singleEditSlide-previous"]').trigger(
    'click'
  )
  expect(emitOnly.emitted('previous')).toHaveLength(1)
  expect(
    emitOnly.find('[data-test-locator="dialogProjectMedia-singleEditSlide-navTrack"]').classes()
  ).not.toContain('dialogProjectMediaSingleEditSlide__track--split')
  emitOnly.unmount()
})

const neighborRow: I_faProjectMediaMassEditRow = {
  ...sampleRow,
  displayName: 'baz',
  id: 'row-2'
}

function navPaneKinds (
  wrapper: ReturnType<typeof mount>
): string[] {
  return wrapper.findAll('[data-test-locator="dialogProjectMedia-singleEditSlide-navPane"]')
    .map((node) => {
      return node.attributes('data-test-nav-kind') ?? ''
    })
}

/**
 * DialogProjectMediaSingleEditSlide
 * Next duplicates the body; incoming pane sits on the right.
 */
test('Test that DialogProjectMediaSingleEditSlide next duplicates and slides in from the right', async () => {
  const w = mount(DialogProjectMediaSingleEditSlide, {
    global: slideGlobal,
    props: {
      nextDisabled: false,
      previousDisabled: false,
      row: sampleRow
    }
  })

  await w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-next"]').trigger('click')
  expect(w.emitted('next')).toHaveLength(1)
  await w.setProps({
    row: neighborRow
  })
  await w.vm.$nextTick()
  const track = w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-navTrack"]')
  expect(track.classes()).toContain('dialogProjectMediaSingleEditSlide__track--split')
  expect(track.classes()).toContain('dialogProjectMediaSingleEditSlide__track--next')
  expect(track.classes()).toContain('dialogProjectMediaSingleEditSlide__track--moving')
  expect(navPaneKinds(w)).toEqual(['outgoing', 'live'])
  expect(w.findAll('[data-test-locator="dialogProjectMedia-singleEdit-form"]')).toHaveLength(2)
  expect(
    w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-next"]').attributes('disabled')
  ).toBeDefined()
  await w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-next"]').trigger('click')
  expect(w.emitted('next')).toHaveLength(1)
  const forms = w.findAllComponents({ name: 'DialogProjectMediaSingleEditForm' })
  const outgoingForm = forms[0]
  const liveForm = forms[1]
  if (outgoingForm === undefined || liveForm === undefined) {
    throw new Error('expected outgoing and live forms')
  }
  liveForm.vm.$emit('update:row', sampleRow)
  expect(w.emitted('update:row')).toBeUndefined()
  outgoingForm.vm.$emit('update:row', {
    ...sampleRow,
    displayName: 'outgoing'
  })
  await w.vm.$nextTick()
  const panes = w.findAll('[data-test-locator="dialogProjectMedia-singleEditSlide-navPane"]')
  const firstPane = panes[0]
  if (firstPane === undefined) {
    throw new Error('expected first pane')
  }
  await firstPane.trigger('transitionend', { propertyName: 'transform' })
  expect(navPaneKinds(w)).toEqual(['outgoing', 'live'])
  await track.trigger('transitionend', { propertyName: 'opacity' })
  expect(navPaneKinds(w)).toEqual(['outgoing', 'live'])
  await track.trigger('transitionend', { propertyName: 'transform' })
  expect(navPaneKinds(w)).toEqual(['live'])
  expect(w.findAll('[data-test-locator="dialogProjectMedia-singleEdit-form"]')).toHaveLength(1)
  w.unmount()
})

/**
 * DialogProjectMediaSingleEditSlide
 * Previous duplicates the body; incoming pane sits on the left.
 */
test('Test that DialogProjectMediaSingleEditSlide previous duplicates and slides in from the left', async () => {
  const w = mount(DialogProjectMediaSingleEditSlide, {
    global: slideGlobal,
    props: {
      nextDisabled: false,
      previousDisabled: false,
      row: neighborRow
    }
  })

  await w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-previous"]').trigger(
    'click'
  )
  expect(w.emitted('previous')).toHaveLength(1)
  await w.setProps({
    row: sampleRow
  })
  await w.vm.$nextTick()
  const track = w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-navTrack"]')
  expect(track.classes()).toContain('dialogProjectMediaSingleEditSlide__track--split')
  expect(track.classes()).toContain('dialogProjectMediaSingleEditSlide__track--previous')
  expect(track.classes()).toContain('dialogProjectMediaSingleEditSlide__track--moving')
  expect(navPaneKinds(w)).toEqual(['live', 'outgoing'])
  await track.trigger('transitionend', { propertyName: '' })
  expect(navPaneKinds(w)).toEqual(['live'])
  w.unmount()
})

/**
 * DialogProjectMediaSingleEditSlide
 * Missing transform transition still unlocks nav after the slide duration.
 */
test('Test that DialogProjectMediaSingleEditSlide unlocks nav when the track transition never fires', async () => {
  vi.useFakeTimers()
  const run = (async () => {
    const w = mount(DialogProjectMediaSingleEditSlide, {
      global: slideGlobal,
      props: {
        nextDisabled: false,
        previousDisabled: false,
        row: sampleRow
      }
    })

    await w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-next"]').trigger('click')
    await w.setProps({
      row: neighborRow
    })
    await w.vm.$nextTick()
    expect(navPaneKinds(w)).toEqual(['outgoing', 'live'])
    await vi.advanceTimersByTimeAsync(FA_DIALOG_PROJECT_MEDIA_SINGLE_EDIT_SLIDE_MS)
    await w.vm.$nextTick()
    expect(navPaneKinds(w)).toEqual(['live'])
    w.unmount()
  })()
  await run.finally(() => {
    vi.useRealTimers()
  })
})

function dispatchSlideArrowKey (key: string, init: KeyboardEventInit = {}): void {
  window.dispatchEvent(new KeyboardEvent('keydown', {
    bubbles: true,
    key,
    ...init
  }))
}

/**
 * DialogProjectMediaSingleEditSlide
 * Unmodified ArrowLeft / ArrowRight match Previous / Next clicks.
 */
test('Test that DialogProjectMediaSingleEditSlide arrow keys match Previous and Next', async () => {
  const w = mount(DialogProjectMediaSingleEditSlide, {
    global: slideGlobal,
    props: {
      nextDisabled: false,
      previousDisabled: false,
      row: sampleRow
    }
  })

  dispatchSlideArrowKey('ArrowRight')
  expect(w.emitted('next')).toHaveLength(1)
  dispatchSlideArrowKey('ArrowRight')
  expect(w.emitted('next')).toHaveLength(1)
  await w.get('[data-test-locator="dialogProjectMedia-singleEditSlide-navTrack"]').trigger(
    'transitionend',
    { propertyName: 'transform' }
  )
  dispatchSlideArrowKey('ArrowLeft')
  expect(w.emitted('previous')).toHaveLength(1)
  w.unmount()

  const locked = mount(DialogProjectMediaSingleEditSlide, {
    global: slideGlobal,
    props: {
      nextDisabled: true,
      previousDisabled: true,
      row: sampleRow
    }
  })
  dispatchSlideArrowKey('ArrowRight')
  dispatchSlideArrowKey('ArrowLeft')
  expect(locked.emitted('next')).toBeUndefined()
  expect(locked.emitted('previous')).toBeUndefined()
  locked.unmount()

  const withModifiers = mount(DialogProjectMediaSingleEditSlide, {
    global: slideGlobal,
    props: {
      nextDisabled: false,
      previousDisabled: false,
      row: sampleRow
    }
  })
  dispatchSlideArrowKey('ArrowRight', { altKey: true })
  dispatchSlideArrowKey('ArrowLeft', { shiftKey: true })
  expect(withModifiers.emitted('next')).toBeUndefined()
  expect(withModifiers.emitted('previous')).toBeUndefined()
  withModifiers.unmount()

  const withField = mount(DialogProjectMediaSingleEditSlide, {
    global: slideGlobal,
    props: {
      nextDisabled: false,
      previousDisabled: false,
      row: sampleRow
    }
  })
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.dispatchEvent(new KeyboardEvent('keydown', {
    bubbles: true,
    key: 'ArrowRight'
  }))
  expect(withField.emitted('next')).toBeUndefined()
  input.remove()
  withField.unmount()
})
