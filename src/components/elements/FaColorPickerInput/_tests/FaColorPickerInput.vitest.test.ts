/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import FaColorPickerInput from '../FaColorPickerInput.vue'
import { FA_COLOR_PICKER_INPUT_DEFAULT_HEX } from 'app/types/I_faColorPickerInput'

const testLocator = 'faColorPickerInput-test'

const qInputStub = defineComponent({
  name: 'QInput',
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['click', 'focus', 'update:modelValue'],
  methods: {
    onClick (): void {
      this.$emit('click')
    },
    onFocus (): void {
      this.$emit('focus')
    },
    onInput (event: Event): void {
      const target = event.target
      const value = target instanceof HTMLInputElement ? target.value : ''
      this.$emit('update:modelValue', value)
    }
  },
  template: `
    <div class="q-input-stub-host">
      <slot name="prepend" />
      <input
        class="q-input-stub"
        :value="modelValue"
        v-bind="$attrs"
        @click="onClick"
        @focus="onFocus"
        @input="onInput"
      />
      <slot name="append" />
    </div>
  `
})

const qIconStub = defineComponent({
  inheritAttrs: true,
  template: '<span class="q-icon-stub" v-bind="$attrs" />'
})

const qMenuStub = defineComponent({
  name: 'QMenu',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['hide', 'update:modelValue'],
  template: `
    <div
      v-if="modelValue"
      class="q-menu-stub"
      @click="$emit('update:modelValue', false); $emit('hide')"
    >
      <slot />
    </div>
  `
})

async function openFaColorPickerInputMenu (
  wrapper: ReturnType<typeof mount>
): Promise<void> {
  await wrapper.find('input.q-input-stub').trigger('focus')
}

/**
 * FaColorPickerInput
 * Opens the picker menu when the field is focused or clicked.
 */
test('Test that FaColorPickerInput opens the picker menu from the input field', async () => {
  const w = mount(FaColorPickerInput, {
    props: {
      modelValue: '#aabbcc',
      testLocator
    },
    global: {
      stubs: {
        QColor: true,
        QIcon: qIconStub,
        QInput: qInputStub,
        QMenu: qMenuStub
      }
    }
  })

  expect(w.find('.q-menu-stub').exists()).toBe(false)

  await w.find('input.q-input-stub').trigger('focus')
  expect(w.find('.q-menu-stub').exists()).toBe(true)
  expect(w.find('[data-test-locator="faColorPickerInput-test-pickerIcon"]').exists()).toBe(true)

  await w.find('input.q-input-stub').trigger('click')
  expect(w.find('.q-menu-stub').exists()).toBe(true)
})

/**
 * FaColorPickerInput
 * Emits hex updates from the text field and color picker.
 */
test('Test that FaColorPickerInput emits model updates from the field and picker', async () => {
  const w = mount(FaColorPickerInput, {
    props: {
      modelValue: '#aabbcc',
      testLocator
    },
    global: {
      stubs: {
        QColor: defineComponent({
          props: {
            noFooter: {
              type: Boolean,
              default: false
            },
            palette: {
              type: Array,
              default: () => []
            }
          },
          emits: ['change', 'update:modelValue'],
          template: '<div class="q-color-stub" @click="$emit(\'update:modelValue\', \'#112233\'); $emit(\'change\', \'#112233\')" />'
        }),
        QIcon: qIconStub,
        QInput: qInputStub,
        QMenu: qMenuStub
      }
    }
  })

  expect(w.find('[data-test-locator="faColorPickerInput-test-swatch"]').attributes('style')).toContain(
    'background-color: rgb(170, 187, 204)'
  )

  await w.find('input.q-input-stub').setValue('#445566')
  expect(w.emitted('update:modelValue')?.[0]).toEqual(['#445566'])

  await openFaColorPickerInputMenu(w)
  await w.find('.q-color-stub').trigger('click')
  expect(w.emitted('update:modelValue')?.slice(-1)[0]).toEqual(['#112233'])
})

/**
 * FaColorPickerInput
 * Keeps the swatch transparent when the model value is blank.
 */
test('Test that FaColorPickerInput keeps the swatch transparent for blank model values', async () => {
  const w = mount(FaColorPickerInput, {
    props: {
      modelValue: '',
      testLocator
    },
    global: {
      stubs: {
        QColor: true,
        QIcon: qIconStub,
        QInput: qInputStub,
        QMenu: qMenuStub
      }
    }
  })

  const swatch = w.find('[data-test-locator="faColorPickerInput-test-swatch"]')
  expect(swatch.classes()).toContain('faColorPickerInput__swatch--empty')
  expect(swatch.attributes('style')).toContain('background-color: transparent')
})

/**
 * FaColorPickerInput
 * Normalizes null picker output to an empty string.
 */
test('Test that FaColorPickerInput normalizes null picker updates to an empty string', async () => {
  const w = mount(FaColorPickerInput, {
    props: {
      modelValue: '#aabbcc',
      testLocator
    },
    global: {
      stubs: {
        QColor: defineComponent({
          emits: ['change', 'update:modelValue'],
          template: '<div class="q-color-null-stub" @click="$emit(\'update:modelValue\', null); $emit(\'change\', null)" />'
        }),
        QIcon: qIconStub,
        QInput: qInputStub,
        QMenu: qMenuStub
      }
    }
  })

  await openFaColorPickerInputMenu(w)
  await w.find('.q-color-null-stub').trigger('click')
  expect(w.emitted('update:modelValue')?.slice(-1)[0]).toEqual([''])
})

/**
 * FaColorPickerInput
 * Uses defaultHex for the picker preview while the swatch stays transparent when unset.
 */
test('Test that FaColorPickerInput honors defaultHex for the picker when the model is blank', async () => {
  const qColorStub = defineComponent({
    name: 'QColor',
    props: {
      modelValue: {
        type: String,
        default: ''
      }
    },
    template: '<div class="q-color-default-hex-stub" />'
  })

  const w = mount(FaColorPickerInput, {
    props: {
      defaultHex: '#ff00ff',
      modelValue: '  ',
      testLocator
    },
    global: {
      stubs: {
        QColor: qColorStub,
        QIcon: qIconStub,
        QInput: qInputStub,
        QMenu: qMenuStub
      }
    }
  })

  const swatch = w.find('[data-test-locator="faColorPickerInput-test-swatch"]')
  expect(swatch.classes()).toContain('faColorPickerInput__swatch--empty')
  expect(swatch.attributes('style')).toContain('background-color: transparent')

  await openFaColorPickerInputMenu(w)
  expect(w.findComponent(qColorStub).props('modelValue')).toBe('#ff00ff')
  expect(FA_COLOR_PICKER_INPUT_DEFAULT_HEX).toBe('#808080')
})

/**
 * FaColorPickerInput
 * Shows the Quasar palette footer when a palette prop is provided.
 */
test('Test that FaColorPickerInput enables the palette footer when palette colors are provided', async () => {
  const qColorStub = defineComponent({
    name: 'QColor',
    props: {
      noFooter: {
        type: Boolean,
        default: false
      },
      palette: {
        type: Array,
        default: () => []
      }
    },
    template: '<div class="q-color-palette-stub" />'
  })

  const w = mount(FaColorPickerInput, {
    props: {
      modelValue: '#aabbcc',
      palette: ['#112233', '#445566'],
      testLocator
    },
    global: {
      stubs: {
        QColor: qColorStub,
        QIcon: qIconStub,
        QInput: qInputStub,
        QMenu: qMenuStub
      }
    }
  })

  await openFaColorPickerInputMenu(w)

  const colorPicker = w.findComponent(qColorStub)
  expect(colorPicker.props('noFooter')).toBe(false)
  expect(colorPicker.props('palette')).toEqual(['#112233', '#445566'])
})

/**
 * FaColorPickerInput
 * Hides the palette footer when no palette colors are provided.
 */
test('Test that FaColorPickerInput hides the palette footer when palette is empty', async () => {
  const qColorStub = defineComponent({
    name: 'QColor',
    props: {
      noFooter: {
        type: Boolean,
        default: false
      },
      palette: {
        type: Array,
        default: () => []
      }
    },
    template: '<div class="q-color-palette-stub" />'
  })

  const w = mount(FaColorPickerInput, {
    props: {
      modelValue: '#aabbcc',
      palette: [],
      testLocator
    },
    global: {
      stubs: {
        QColor: qColorStub,
        QIcon: qIconStub,
        QInput: qInputStub,
        QMenu: qMenuStub
      }
    }
  })

  await openFaColorPickerInputMenu(w)

  const colorPicker = w.findComponent(qColorStub)
  expect(colorPicker.props('noFooter')).toBe(true)
  expect(colorPicker.props('palette')).toEqual([])
})

const qBtnStub = defineComponent({
  inheritAttrs: true,
  props: {
    disable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  template: `
    <button
      type="button"
      class="q-btn-stub"
      :disabled="disable"
      v-bind="$attrs"
      @click="$emit('click')"
    >
      <slot />
    </button>
  `
})

const qTooltipStub = defineComponent({
  template: '<span class="q-tooltip-stub"><slot /></span>'
})

/**
 * FaColorPickerInput
 * Shows the append-to-palette button in draft mode and emits the next palette string.
 */
test('Test that FaColorPickerInput appends the current color to a draft world palette', async () => {
  const w = mount(FaColorPickerInput, {
    props: {
      modelValue: '#aabbcc',
      palette: ['#112233'],
      paletteAppend: {
        mode: 'draft',
        worldColorPalette: '#112233'
      },
      testLocator
    },
    global: {
      stubs: {
        QColor: true,
        QBtn: qBtnStub,
        QIcon: qIconStub,
        QInput: qInputStub,
        QMenu: qMenuStub,
        QTooltip: qTooltipStub
      },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  const appendButton = w.find('[data-test-locator="faColorPickerInput-test-appendToPalette"]')
  expect(appendButton.exists()).toBe(true)
  expect(appendButton.attributes('disabled')).toBeUndefined()
  expect(appendButton.attributes('data-test-tooltip-text')).toBe(
    'faColorPickerInput.appendToWorldPaletteTooltip'
  )

  await appendButton.trigger('click')

  expect(w.emitted('append-to-world-palette')?.[0]).toEqual(['#112233;#AABBCC'])
})

/**
 * FaColorPickerInput
 * Disables append when the current color already exists in the target palette.
 */
test('Test that FaColorPickerInput disables append for duplicate palette colors', () => {
  const w = mount(FaColorPickerInput, {
    props: {
      modelValue: '#112233',
      paletteAppend: {
        mode: 'draft',
        worldColorPalette: '#112233;#445566'
      },
      testLocator
    },
    global: {
      stubs: {
        QColor: true,
        QBtn: qBtnStub,
        QIcon: qIconStub,
        QInput: qInputStub,
        QMenu: qMenuStub,
        QTooltip: qTooltipStub
      },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  const appendButton = w.find('[data-test-locator="faColorPickerInput-test-appendToPalette"]')
  expect(appendButton.attributes('disabled')).toBeDefined()
  expect(appendButton.attributes('data-test-tooltip-text')).toBe(
    'faColorPickerInput.appendToWorldPaletteDuplicateTooltip'
  )
})

/**
 * FaColorPickerInput
 * Closes the picker menu when the menu hide handler runs.
 */
test('Test that FaColorPickerInput closes the picker menu on hide', async () => {
  const w = mount(FaColorPickerInput, {
    props: {
      modelValue: '#aabbcc',
      testLocator
    },
    global: {
      stubs: {
        QColor: true,
        QIcon: qIconStub,
        QInput: qInputStub,
        QMenu: qMenuStub
      }
    }
  })

  await openFaColorPickerInputMenu(w)
  expect(w.find('.q-menu-stub').exists()).toBe(true)

  await w.find('.q-menu-stub').trigger('click')
  expect(w.find('.q-menu-stub').exists()).toBe(false)
})
