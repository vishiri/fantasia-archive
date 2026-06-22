/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import { FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS } from 'app/src/scripts/faDragDrop/functions/faVerticalDraggableTabsDocumentDragCursor'

import DialogProjectSettingsWorldsTabList from '../DialogProjectSettingsWorldsTabList.vue'

const worldsFixture = [
  {
    color: '',
    colorPallete: '',
    displayNameTranslations: { 'en-US': 'Realm' },
    documentCount: 0,
    templateLayout: {
      groups: [],
      placements: []
    },
    id: '550e8400-e29b-41d4-a716-446655440000'
  }
]

/**
 * DialogProjectSettingsWorldsTabList
 * Renders the add button and draggable world tab list root.
 */
test('Test that DialogProjectSettingsWorldsTabList renders add world and list hooks', () => {
  const w = mount(DialogProjectSettingsWorldsTabList, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [],
      selectedWorldId: worldsFixture[0].id,
      worlds: worldsFixture
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsWorldsTabItem: defineComponent({
          template: '<div data-test-locator="dialogProjectSettings-worlds-tab-stub" />'
        }),
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
        }),
        VueDraggable: defineComponent({
          template: '<div class="vue-draggable-stub"><slot /></div>'
        })
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-addButton"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-list"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldsFilterInput"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-tab-stub"]').exists()).toBe(true)
})

/**
 * DialogProjectSettingsWorldsTabList
 * Forwards add world and reorder events.
 */
test('Test that DialogProjectSettingsWorldsTabList forwards add world and reorder', async () => {
  const w = mount(DialogProjectSettingsWorldsTabList, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [],
      selectedWorldId: worldsFixture[0].id,
      worlds: worldsFixture
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsWorldsTabItem: true,
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
        }),
        VueDraggable: defineComponent({
          props: {
            modelValue: {
              type: Array,
              required: true
            }
          },
          emits: ['end', 'update:modelValue'],
          template: `
            <div>
              <slot />
              <button
                type="button"
                data-test-locator="emit-reorder"
                @click="
                  $emit('update:modelValue', [...modelValue].reverse());
                  $emit('end');
                "
              />
            </div>
          `
        })
      }
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-worlds-addButton"]').trigger('click')
  expect(w.emitted('addWorld')).toBeTruthy()

  await w.find('[data-test-locator="emit-reorder"]').trigger('click')
  expect(w.emitted('update:worlds')?.[0]?.[0]).toEqual([...worldsFixture].reverse())
})

/**
 * DialogProjectSettingsWorldsTabList
 * Tracks the dragged world during reorder and clears it when the drag ends.
 */
test('Test that DialogProjectSettingsWorldsTabList tracks drag highlight state', async () => {
  const w = mount(DialogProjectSettingsWorldsTabList, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [],
      selectedWorldId: worldsFixture[0].id,
      worlds: worldsFixture
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsWorldsTabItem: true,
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs"><slot /></button>'
        }),
        VueDraggable: defineComponent({
          props: {
            modelValue: {
              type: Array,
              required: true
            }
          },
          emits: ['end', 'start', 'update:modelValue'],
          setup (_props, { emit }) {
            function emitDragStart (): void {
              const item = document.createElement('div')
              item.setAttribute('data-test-world-id', worldsFixture[0].id)
              emit('start', { item })
            }

            return {
              emitDragStart
            }
          },
          template: `
            <div>
              <slot />
              <button
                type="button"
                data-test-locator="emit-drag-start"
                @click="emitDragStart"
              />
              <button
                type="button"
                data-test-locator="emit-drag-end"
                @click="$emit('end')"
              />
            </div>
          `
        })
      }
    }
  })

  document.body.classList.remove(FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS)

  expect(w.find('.dialogProjectSettingsWorldsTabList').classes()).not.toContain(
    'faVerticalDraggableTabs--listDragging'
  )
  expect(document.body.classList.contains(FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS)).toBe(false)

  await w.find('[data-test-locator="emit-drag-start"]').trigger('click')
  expect(w.find('.dialogProjectSettingsWorldsTabList').classes()).toContain(
    'faVerticalDraggableTabs--listDragging'
  )
  expect(document.body.classList.contains(FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS)).toBe(true)

  await w.find('[data-test-locator="emit-drag-end"]').trigger('click')
  expect(w.find('.dialogProjectSettingsWorldsTabList').classes()).not.toContain(
    'faVerticalDraggableTabs--listDragging'
  )
  expect(document.body.classList.contains(FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS)).toBe(false)
})

/**
 * DialogProjectSettingsWorldsTabList
 * Forwards tab selection from a tab item click.
 */
test('Test that DialogProjectSettingsWorldsTabList forwards tab selection', async () => {
  const w = mount(DialogProjectSettingsWorldsTabList, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [],
      selectedWorldId: worldsFixture[0].id,
      worlds: worldsFixture
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs"><slot /></button>'
        }),
        VueDraggable: defineComponent({
          template: '<div><slot /></div>'
        })
      }
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-worlds-tab"]').trigger('click')
  expect(w.emitted('select')?.[0]).toEqual([worldsFixture[0].id])
})

const worldsFilterFixture = [
  {
    color: '',
    colorPallete: '',
    displayNameTranslations: { 'en-US': 'Gungala' },
    documentCount: 0,
    templateLayout: {
      groups: [],
      placements: []
    },
    id: '550e8400-e29b-41d4-a716-446655440001'
  },
  {
    color: '',
    colorPallete: '',
    displayNameTranslations: { 'en-US': 'New world' },
    documentCount: 0,
    templateLayout: {
      groups: [],
      placements: []
    },
    id: '550e8400-e29b-41d4-a716-446655440002'
  }
]

/**
 * DialogProjectSettingsWorldsTabList
 * Filters visible world tabs by display name while filter text is entered.
 */
test('Test that DialogProjectSettingsWorldsTabList filters world tabs by display name', async () => {
  const w = mount(DialogProjectSettingsWorldsTabList, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [],
      selectedWorldId: worldsFilterFixture[0].id,
      worlds: worldsFilterFixture
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsWorldsTabItem: defineComponent({
          props: {
            world: {
              required: true,
              type: Object
            }
          },
          template: '<div class="world-tab-stub" :data-test-world-name="world.displayNameTranslations[\'en-US\']" />'
        }),
        DialogProjectSettingsVerticalTabListFilterInput: defineComponent({
          props: {
            modelValue: {
              default: '',
              type: String
            }
          },
          emits: ['update:modelValue'],
          template: '<input class="worlds-filter-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
        }),
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs"><slot /></button>'
        }),
        VueDraggable: defineComponent({
          template: '<div class="vue-draggable-stub"><slot /></div>'
        })
      }
    }
  })

  expect(w.findAll('.world-tab-stub')).toHaveLength(2)

  await w.find('.worlds-filter-stub').setValue('gung')
  expect(w.findAll('.world-tab-stub')).toHaveLength(1)
  expect(w.find('.world-tab-stub').attributes('data-test-world-name')).toBe('Gungala')

  await w.find('.worlds-filter-stub').setValue('missing')
  expect(w.find('[data-test-locator="dialogProjectSettings-worldsFilterEmpty"]').exists()).toBe(true)
})

const worldsFilteredReorderFixture = [
  {
    color: '',
    colorPallete: '',
    displayNameTranslations: { 'en-US': 'Alpha' },
    documentCount: 0,
    templateLayout: {
      groups: [],
      placements: []
    },
    id: '550e8400-e29b-41d4-a716-446655440010'
  },
  {
    color: '',
    colorPallete: '',
    displayNameTranslations: { 'en-US': 'Middle' },
    documentCount: 0,
    templateLayout: {
      groups: [],
      placements: []
    },
    id: '550e8400-e29b-41d4-a716-446655440011'
  },
  {
    color: '',
    colorPallete: '',
    displayNameTranslations: { 'en-US': 'Gamma' },
    documentCount: 0,
    templateLayout: {
      groups: [],
      placements: []
    },
    id: '550e8400-e29b-41d4-a716-446655440012'
  }
]

/**
 * DialogProjectSettingsWorldsTabList
 * Merges filtered drag reorder back into the full worlds list.
 */
test('Test that DialogProjectSettingsWorldsTabList merges filtered drag reorder into full list', async () => {
  const w = mount(DialogProjectSettingsWorldsTabList, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [],
      selectedWorldId: worldsFilteredReorderFixture[0].id,
      worlds: worldsFilteredReorderFixture
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsWorldsTabItem: true,
        DialogProjectSettingsVerticalTabListFilterInput: defineComponent({
          props: {
            modelValue: {
              default: '',
              type: String
            }
          },
          emits: ['update:modelValue'],
          template: '<input class="worlds-filter-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
        }),
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs"><slot /></button>'
        }),
        VueDraggable: defineComponent({
          props: {
            modelValue: {
              required: true,
              type: Array
            }
          },
          emits: ['end', 'update:modelValue'],
          template: `
            <div>
              <slot />
              <button
                type="button"
                data-test-locator="emit-filtered-reorder"
                @click="
                  $emit('update:modelValue', [...modelValue].reverse());
                  $emit('end');
                "
              />
            </div>
          `
        })
      }
    }
  })

  await w.find('.worlds-filter-stub').setValue('a')
  await w.find('[data-test-locator="emit-filtered-reorder"]').trigger('click')

  expect(w.emitted('update:worlds')?.[0]?.[0]).toEqual([
    worldsFilteredReorderFixture[2],
    worldsFilteredReorderFixture[1],
    worldsFilteredReorderFixture[0]
  ])
})
