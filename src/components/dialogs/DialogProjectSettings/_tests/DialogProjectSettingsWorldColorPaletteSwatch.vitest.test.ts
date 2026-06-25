/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldColorPaletteSwatch from '../DialogProjectSettingsWorldColorPaletteSwatch.vue'

const qColorStub = defineComponent({
  name: 'QColor',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['change', 'update:modelValue'],
  template: '<div class="q-color-stub" />'
})

const qMenuStub = defineComponent({
  name: 'QMenu',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'hide'],
  template: '<div v-if="modelValue" class="q-menu-stub" v-bind="$attrs"><slot /></div>'
})

const defaultSwatchProps = {
  duplicateDisabled: false,
  duplicateHexKeys: new Set<string>(),
  entryId: 'entry-a',
  hex: '#112233',
  index: 0,
  isBeingDragged: false,
  isListDragging: false,
  pickerOpen: false,
  worldPickerPalette: ['#112233'] as string[]
}

const defaultSwatchStubs = {
  QColor: qColorStub,
  QIcon: defineComponent({ template: '<span class="q-icon-stub" />' }),
  QItem: defineComponent({
    inheritAttrs: true,
    props: {
      disable: {
        type: Boolean,
        default: false
      }
    },
    template: '<div class="q-item-stub" v-bind="$attrs" :aria-disabled="disable ? \'true\' : undefined" @click="$emit(\'click\')"><slot /></div>'
  }),
  QItemSection: defineComponent({ template: '<div class="q-item-section-stub"><slot /></div>' }),
  QList: defineComponent({ template: '<div class="q-list-stub"><slot /></div>' }),
  QMenu: qMenuStub,
  QSeparator: defineComponent({ template: '<hr class="q-separator-stub" />' }),
  QTooltip: defineComponent({ template: '<span><slot /></span>' })
}

const defaultSwatchGlobal = {
  mocks: {
    $t: (key: string, params?: { hex?: string }) => {
      if (params?.hex !== undefined) {
        return `${key}:${params.hex}`
      }
      return key
    }
  },
  stubs: defaultSwatchStubs
}

const defaultSwatchGlobalTooltipStub = {
  ...defaultSwatchGlobal,
  stubs: {
    ...defaultSwatchStubs,
    QTooltip: true
  }
}

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Opens the picker menu and emits picker-open when the swatch is clicked.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch emits picker-open on click', async () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: defaultSwatchProps,
    global: defaultSwatchGlobal
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteSwatch"]').exists()).toBe(true)
  await w.trigger('click')
  expect(w.emitted('picker-open')).toBeTruthy()
})

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Shows a negative exclamation overlay when the swatch hex is duplicated.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch shows duplicate overlay icon', async () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: {
      ...defaultSwatchProps,
      duplicateHexKeys: new Set(['#112233']),
      worldPickerPalette: []
    },
    global: defaultSwatchGlobalTooltipStub
  })

  expect(w.classes()).toContain('dialogProjectSettingsWorldColorPaletteSwatch--duplicate')
  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteDuplicateIcon"]').exists()
  ).toBe(true)
  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteDuplicateIcon"]')
      .attributes('data-test-duplicate-icon-color')
  ).toBe('negative')
})

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Uses black duplicate icon color on saturated red swatches.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch uses black duplicate icon on red', async () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: {
      ...defaultSwatchProps,
      duplicateHexKeys: new Set(['#ff0000']),
      hex: '#ff0000',
      worldPickerPalette: []
    },
    global: defaultSwatchGlobalTooltipStub
  })

  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteDuplicateIcon"]')
      .attributes('data-test-duplicate-icon-color')
  ).toBe('black')
})

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Keeps the duplicate overlay negative on high-contrast light swatches.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch uses negative duplicate icon on white', async () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: {
      ...defaultSwatchProps,
      duplicateHexKeys: new Set(['#ffffff']),
      hex: '#ffffff',
      worldPickerPalette: []
    },
    global: defaultSwatchGlobalTooltipStub
  })

  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteDuplicateIcon"]')
      .attributes('data-test-duplicate-icon-color')
  ).toBe('negative')
})

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Hides the duplicate overlay when the swatch hex is unique.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch hides duplicate overlay for unique colors', async () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: {
      ...defaultSwatchProps,
      worldPickerPalette: []
    },
    global: defaultSwatchGlobalTooltipStub
  })

  expect(w.classes()).not.toContain('dialogProjectSettingsWorldColorPaletteSwatch--duplicate')
  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteDuplicateIcon"]').exists()
  ).toBe(false)
})

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Syncs picker menu visibility with the pickerOpen prop.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch syncs picker menu with pickerOpen', async () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: {
      ...defaultSwatchProps,
      pickerOpen: true,
      worldPickerPalette: []
    },
    global: defaultSwatchGlobalTooltipStub
  })

  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-colorPalettePickerMenu"]').exists()
  ).toBe(true)
  await w.setProps({ pickerOpen: false })
  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-colorPalettePickerMenu"]').exists()
  ).toBe(false)
})

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Opens the context menu on right-click and emits duplicate or delete actions.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch opens context menu and emits actions', async () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: defaultSwatchProps,
    global: defaultSwatchGlobal
  })

  await w.trigger('contextmenu')
  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteContextMenu"]').exists()
  ).toBe(true)
  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteContextMenu-delete"]')
      .classes()
  ).toContain('text-negative')

  await w
    .find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteContextMenu-duplicate"]')
    .trigger('click')
  expect(w.emitted('duplicate')).toBeTruthy()

  await w.trigger('contextmenu')
  await w
    .find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteContextMenu-delete"]')
    .trigger('click')
  expect(w.emitted('delete')).toBeTruthy()
})

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Ignores right-click context menu while the palette list is dragging.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch blocks context menu while list dragging', async () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: {
      ...defaultSwatchProps,
      isListDragging: true
    },
    global: defaultSwatchGlobal
  })

  await w.trigger('contextmenu')
  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteContextMenu"]').exists()
  ).toBe(false)
})

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Disables duplicate color when duplicateDisabled is true.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch disables duplicate context menu row', async () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: {
      ...defaultSwatchProps,
      duplicateDisabled: true
    },
    global: defaultSwatchGlobal
  })

  await w.trigger('contextmenu')
  const duplicateRow = w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteContextMenu-duplicate"]')
  expect(duplicateRow.attributes('aria-disabled')).toBe('true')
})

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Emits picker-close when the picker menu hides.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch emits picker-close when picker menu hides', async () => {
  const hideMenuStub = defineComponent({
    name: 'QMenu',
    inheritAttrs: false,
    props: {
      modelValue: {
        type: Boolean,
        default: false
      }
    },
    emits: ['hide', 'update:modelValue'],
    template: '<div v-if="modelValue" class="q-menu-stub" v-bind="$attrs" @click="$emit(\'hide\')" />'
  })

  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: {
      ...defaultSwatchProps,
      pickerOpen: true,
      worldPickerPalette: []
    },
    global: {
      mocks: defaultSwatchGlobal.mocks,
      stubs: {
        ...defaultSwatchStubs,
        QMenu: hideMenuStub,
        QTooltip: true
      }
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-worlds-colorPalettePickerMenu"]').trigger('click')
  expect(w.emitted('picker-close')).toBeTruthy()
})

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Exposes hover tooltip text on the swatch when not dragging.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch exposes hover tooltip text', () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: defaultSwatchProps,
    global: defaultSwatchGlobal
  })

  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteSwatch"]').attributes('data-test-tooltip-text')
  ).toBe('#112233')
})

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Renders duplicate warning icon when hex collides with another palette entry.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch renders duplicate warning icon', () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: {
      ...defaultSwatchProps,
      duplicateHexKeys: new Set(['#112233'])
    },
    global: {
      mocks: defaultSwatchGlobal.mocks,
      stubs: {
        ...defaultSwatchStubs,
        QIcon: defineComponent({
          inheritAttrs: true,
          template: '<span class="q-icon-stub" v-bind="$attrs"><slot /></span>'
        })
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteDuplicateIcon"]').exists()).toBe(true)
  expect(w.classes()).toContain('dialogProjectSettingsWorldColorPaletteSwatch--duplicate')
})

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Opens the picker menu through click and binds picker menu v-model.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch opens picker menu on click', async () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: defaultSwatchProps,
    global: defaultSwatchGlobal
  })

  await w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteSwatch"]').trigger('click')
  expect(w.emitted('picker-open')).toBeTruthy()
  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-colorPalettePickerMenu"]').exists()
  ).toBe(true)
})

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Closes context and picker menus when QMenu v-model emits false.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch syncs QMenu v-model close events', async () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: defaultSwatchProps,
    global: defaultSwatchGlobal
  })

  await w.trigger('contextmenu')
  const menus = w.findAllComponents({ name: 'QMenu' })
  expect(menus.length).toBeGreaterThanOrEqual(1)
  await menus[0]!.vm.$emit('update:modelValue', false)

  await w.trigger('click')
  const menusAfterClick = w.findAllComponents({ name: 'QMenu' })
  const pickerMenu = menusAfterClick.find(
    (menu) => menu.attributes('data-test-locator') === 'dialogProjectSettings-worlds-colorPalettePickerMenu'
  )
  expect(pickerMenu).toBeDefined()
  await pickerMenu!.vm.$emit('update:modelValue', false)
  expect(w.emitted('picker-close')).toBeTruthy()
})
