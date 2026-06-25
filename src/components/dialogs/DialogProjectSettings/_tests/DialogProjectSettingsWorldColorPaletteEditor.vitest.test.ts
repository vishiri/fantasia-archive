/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'
import { VueDraggable } from 'vue-draggable-plus'

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

/**
 * DialogProjectSettingsWorldColorPaletteEditor
 * Forwards swatch duplicate, delete, picker, and drag lifecycle events.
 */
test('Test that DialogProjectSettingsWorldColorPaletteEditor forwards swatch and drag events', async () => {
  const swatchEventStub = defineComponent({
    name: 'DialogProjectSettingsWorldColorPaletteSwatch',
    props: {
      entryId: {
        type: String,
        required: true
      },
      index: {
        type: Number,
        required: true
      }
    },
    emits: ['delete', 'duplicate', 'picker-close', 'picker-open', 'update:hex'],
    template: `
      <div class="palette-swatch-event-stub">
        <button type="button" data-test-locator="emit-delete" @click="$emit('delete')" />
        <button type="button" data-test-locator="emit-duplicate" @click="$emit('duplicate')" />
        <button type="button" data-test-locator="emit-picker-open" @click="$emit('picker-open')" />
        <button type="button" data-test-locator="emit-picker-close" @click="$emit('picker-close')" />
        <button type="button" data-test-locator="emit-hex" @click="$emit('update:hex', '#AABBCC')" />
      </div>
    `
  })

  const w = mount(DialogProjectSettingsWorldColorPaletteEditor, {
    props: {
      colorPallete: '#112233;#445566'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsWorldColorPaletteSwatch: swatchEventStub,
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
        })
      }
    }
  })

  const firstSwatch = w.find('.palette-swatch-event-stub')
  await firstSwatch.find('[data-test-locator="emit-delete"]').trigger('click')
  await firstSwatch.find('[data-test-locator="emit-duplicate"]').trigger('click')
  await firstSwatch.find('[data-test-locator="emit-picker-open"]').trigger('click')
  await firstSwatch.find('[data-test-locator="emit-picker-close"]').trigger('click')
  await firstSwatch.find('[data-test-locator="emit-hex"]').trigger('click')

  expect(w.emitted('update:colorPallete')?.length).toBeGreaterThan(0)
})

/**
 * DialogProjectSettingsWorldColorPaletteEditor
 * Applies draggable v-model updates and swatch picker lifecycle handlers.
 */
test('Test that DialogProjectSettingsWorldColorPaletteEditor handles draggable v-model and swatch picker events', async () => {
  const swatchEventStub = defineComponent({
    name: 'DialogProjectSettingsWorldColorPaletteSwatch',
    props: {
      entryId: {
        type: String,
        required: true
      },
      index: {
        type: Number,
        required: true
      }
    },
    emits: ['delete', 'duplicate', 'picker-close', 'picker-open', 'update:hex'],
    template: `
      <div class="palette-swatch-picker-stub" :data-test-entry-id="entryId">
        <button type="button" data-test-locator="emit-duplicate" @click="$emit('duplicate')" />
        <button type="button" data-test-locator="emit-picker-open" @click="$emit('picker-open')" />
        <button type="button" data-test-locator="emit-picker-close" @click="$emit('picker-close')" />
      </div>
    `
  })

  const w = mount(DialogProjectSettingsWorldColorPaletteEditor, {
    props: {
      colorPallete: '#112233;#445566'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsWorldColorPaletteSwatch: swatchEventStub,
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
        })
      }
    }
  })

  const draggable = w.findComponent(VueDraggable)
  const reordered = [
    {
      id: '550e8400-e29b-41d4-a716-446655440099',
      hex: '#445566'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440098',
      hex: '#112233'
    }
  ]
  await draggable.vm.$emit('update:modelValue', reordered)

  const firstSwatch = w.find('.palette-swatch-picker-stub')
  await firstSwatch.find('[data-test-locator="emit-duplicate"]').trigger('click')
  await firstSwatch.find('[data-test-locator="emit-picker-open"]').trigger('click')
  await firstSwatch.find('[data-test-locator="emit-picker-close"]').trigger('click')

  expect(w.emitted('update:colorPallete')?.length).toBeGreaterThan(0)
})
