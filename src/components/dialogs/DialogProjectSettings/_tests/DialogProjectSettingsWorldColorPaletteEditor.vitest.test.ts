/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import DialogProjectSettingsWorldColorPaletteEditor from '../DialogProjectSettingsWorldColorPaletteEditor.vue'

vi.stubGlobal('crypto', {
  randomUUID: () => '550e8400-e29b-41d4-a716-446655440099'
})

const swatchStub = defineComponent({
  name: 'DialogProjectSettingsWorldColorPaletteSwatch',
  props: {
    entryId: {
      type: String,
      required: true
    },
    hex: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  emits: ['update:hex'],
  template: `
    <button
      type="button"
      class="palette-swatch-stub"
      :data-test-palette-entry-id="entryId"
      :data-test-palette-index="String(index)"
      @click="$emit('update:hex', '#AABBCC')"
    >
      {{ hex }}
    </button>
  `
})

/**
 * DialogProjectSettingsWorldColorPaletteEditor
 * Renders palette swatches and emits palette updates when colors change.
 */
test('Test that DialogProjectSettingsWorldColorPaletteEditor emits palette updates', async () => {
  const w = mount(DialogProjectSettingsWorldColorPaletteEditor, {
    props: {
      colorPallete: '#112233;#445566'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsWorldColorPaletteSwatch: swatchStub,
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
        })
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteEditor"]').exists()).toBe(true)
  expect(w.findAll('.palette-swatch-stub')).toHaveLength(2)

  await w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteAddButton"]').trigger('click')
  expect(w.emitted('update:colorPallete')?.length).toBeGreaterThan(0)

  await w.find('.palette-swatch-stub').trigger('click')
  expect(w.emitted('update:colorPallete')?.slice(-1)[0]?.[0]).toContain('#AABBCC')
})
