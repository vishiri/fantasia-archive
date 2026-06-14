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

/**
 * DialogProjectSettingsWorldColorPaletteSwatch
 * Opens the picker menu and emits picker-open when the swatch is clicked.
 */
test('Test that DialogProjectSettingsWorldColorPaletteSwatch emits picker-open on click', async () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteSwatch, {
    props: defaultSwatchProps,
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: defaultSwatchStubs
    }
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
    global: {
      stubs: {
        ...defaultSwatchStubs,
        QTooltip: true
      }
    }
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
    global: {
      stubs: {
        ...defaultSwatchStubs,
        QTooltip: true
      }
    }
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
    global: {
      stubs: {
        ...defaultSwatchStubs,
        QTooltip: true
      }
    }
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
    global: {
      stubs: {
        ...defaultSwatchStubs,
        QTooltip: true
      }
    }
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
    global: {
      stubs: {
        ...defaultSwatchStubs,
        QTooltip: true
      }
    }
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
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: defaultSwatchStubs
    }
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
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: defaultSwatchStubs
    }
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
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: defaultSwatchStubs
    }
  })

  await w.trigger('contextmenu')
  const duplicateRow = w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteContextMenu-duplicate"]')
  expect(duplicateRow.attributes('aria-disabled')).toBe('true')
})
