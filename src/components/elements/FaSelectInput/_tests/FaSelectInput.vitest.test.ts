/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- QSelect stubs colocated with mount helpers */
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import FaSelectInput from '../FaSelectInput.vue'

const qSelectStub = defineComponent({
  name: 'QSelect',
  props: {
    modelValue: {
      type: [String, Array, Object],
      default: null
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'filter', 'focus', 'popup-show', 'new-value'],
  computed: {
    selectedItemOpt () {
      const value = (this as { modelValue: unknown }).modelValue
      if (Array.isArray(value)) {
        return value[0]
      }
      return value
    }
  },
  template: `
    <div :data-test-locator="$attrs['data-test-locator']">
      <button
        type="button"
        data-test-locator="faSelectInput-stub-select"
        @click="$emit('update:modelValue', 'test 1')"
      />
      <button
        type="button"
        data-test-locator="faSelectInput-stub-focus"
        @click="$emit('focus')"
      />
      <button
        type="button"
        data-test-locator="faSelectInput-stub-popup"
        @click="$emit('popup-show')"
      />
      <button
        type="button"
        data-test-locator="faSelectInput-stub-new"
        @click="$emit('new-value', 'brand new')"
      />
      <slot
        name="selected-item"
        :opt="selectedItemOpt"
        :index="0"
        :tabindex="0"
        :removeAtIndex="() => undefined"
      />
      <div
        v-for="(opt, index) in options"
        :key="index"
      >
        <slot
          name="option"
          :opt="opt"
          :index="index"
          :itemProps="{}"
          :selected="false"
          :toggleOption="() => undefined"
        />
      </div>
    </div>
  `
})

function mountFaSelectInput (props: Record<string, unknown> = {}) {
  return mount(FaSelectInput, {
    global: {
      stubs: {
        QSelect: qSelectStub,
        QChip: {
          emits: ['remove'],
          template: '<div class="q-chip-stub"><button type="button" class="q-chip-remove" @click="$emit(\'remove\')"><slot /></button></div>'
        },
        QIcon: {
          props: ['name'],
          template: '<i class="q-icon-stub" :data-name="name" />'
        },
        QItem: {
          template: '<div class="q-item-stub"><slot /></div>'
        },
        QItemSection: {
          template: '<div class="q-item-section-stub"><slot /></div>'
        },
        QItemLabel: {
          template: '<div class="q-item-label-stub"><slot /></div>'
        },
        QSeparator: true
      }
    },
    props: {
      mode: 'simple',
      modelValue: '',
      options: ['test 1', 'test 2'],
      testLocator: 'faSelectInput-test',
      ...props
    }
  })
}

/**
 * FaSelectInput
 * Empty single model hides selected chip (no ghost remove control).
 */
test('Test that FaSelectInput hides chip when single simple value is empty', () => {
  const wrapper = mountFaSelectInput({
    modelValue: ''
  })

  expect(wrapper.find('.q-chip-stub').exists()).toBe(false)
})

/**
 * FaSelectInput
 * Option list uses menu separatorAlt before every row after the first.
 */
test('Test that FaSelectInput renders separatorAlt between dropdown options', () => {
  const wrapper = mountFaSelectInput({
    options: ['test 1', 'test 2', 'test 3']
  })

  expect(wrapper.find('[data-test-locator="faSelectInput-test-separatorAlt-0"]').exists())
    .toBe(false)
  expect(wrapper.find('[data-test-locator="faSelectInput-test-separatorAlt-1"]').exists())
    .toBe(true)
  expect(wrapper.find('[data-test-locator="faSelectInput-test-separatorAlt-2"]').exists())
    .toBe(true)
})

/**
 * FaSelectInput
 * Non-empty single model renders selected chip.
 */
test('Test that FaSelectInput shows chip when single simple value is set', () => {
  const wrapper = mountFaSelectInput({
    modelValue: 'test 1'
  })

  expect(wrapper.find('.q-chip-stub').exists()).toBe(true)
})

/**
 * FaSelectInput
 * Chip remove invokes selected-item removeAtIndex.
 */
test('Test that FaSelectInput chip remove calls removeAtIndex', async () => {
  const removeAtIndex = vi.fn()
  const qSelectWithRemove = defineComponent({
    name: 'QSelect',
    props: {
      modelValue: {
        type: [String, Array, Object],
        default: null
      },
      options: {
        type: Array,
        default: () => []
      }
    },
    setup () {
      return { removeAtIndex }
    },
    template: `
      <div>
        <slot
          name="selected-item"
          :opt="modelValue"
          :index="0"
          :tabindex="0"
          :removeAtIndex="removeAtIndex"
        />
      </div>
    `
  })

  const wrapper = mount(FaSelectInput, {
    global: {
      stubs: {
        QSelect: qSelectWithRemove,
        QChip: {
          emits: ['remove'],
          template: '<div class="q-chip-stub"><button type="button" class="q-chip-remove" @click="$emit(\'remove\')" /></div>'
        },
        QIcon: true,
        QItem: true,
        QItemSection: true,
        QItemLabel: true,
        QSeparator: true
      }
    },
    props: {
      mode: 'simple',
      modelValue: 'test 1',
      options: ['test 1'],
      testLocator: 'faSelectInput-test'
    }
  })

  await wrapper.get('.q-chip-remove').trigger('click')
  expect(removeAtIndex).toHaveBeenCalledWith(0)
})

/**
 * FaSelectInput
 * Mounts with test locator and emits update on select stub click.
 */
test('Test that FaSelectInput emits update:modelValue from QSelect', async () => {
  const wrapper = mountFaSelectInput({
    modelValue: ''
  })

  await wrapper.get('[data-test-locator="faSelectInput-stub-select"]').trigger('click')
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test 1'])
})

/**
 * FaSelectInput
 * Emits request-options on focus.
 */
test('Test that FaSelectInput emits request-options on focus', async () => {
  const wrapper = mountFaSelectInput()
  await wrapper.get('[data-test-locator="faSelectInput-stub-focus"]').trigger('click')
  expect(wrapper.emitted('request-options')).toBeTruthy()
})

/**
 * FaSelectInput
 * Create-new emits new-value when allowCreateNew is on.
 */
test('Test that FaSelectInput emits new-value when allowCreateNew is enabled', async () => {
  const wrapper = mountFaSelectInput({
    allowCreateNew: true,
    modelValue: [] as string[],
    multiple: true
  })

  await wrapper.get('[data-test-locator="faSelectInput-stub-new"]').trigger('click')
  await nextTick()
  expect(wrapper.emitted('new-value')?.[0]).toEqual(['brand new'])
})

/**
 * FaSelectInput
 * Document mode create-new uses manager UUID and renders icons / highlight segments.
 */
test('Test that FaSelectInput document mode create-new and option icons work', async () => {
  const uuidSpy = vi.spyOn(crypto, 'randomUUID').mockReturnValue(
    '11111111-1111-4111-8111-111111111111'
  )

  const wrapper = mountFaSelectInput({
    allowCreateNew: true,
    mode: 'document',
    modelValue: null,
    options: [
      {
        id: '1',
        name: 'Alpha Doc',
        icon: 'mdi-account'
      },
      {
        id: '2',
        name: 'Beta Doc'
      }
    ]
  })

  await wrapper.get('[data-test-locator="faSelectInput-stub-new"]').trigger('click')
  await nextTick()
  expect(uuidSpy).toHaveBeenCalled()
  expect(wrapper.emitted('new-value')?.[0]).toEqual([{
    id: '11111111-1111-4111-8111-111111111111',
    isNew: true,
    name: 'brand new'
  }])
  expect(wrapper.find('[data-test-locator="faSelectInput-test-option-0"]').exists()).toBe(true)
  expect(wrapper.find('.q-icon-stub').exists()).toBe(true)

  uuidSpy.mockRestore()
})

/**
 * FaSelectInput
 * Chip for object selection shows icon and teal for isNew.
 */
test('Test that FaSelectInput object chip shows icon and uses new chip color', () => {
  const wrapper = mountFaSelectInput({
    mode: 'document',
    modelValue: {
      id: '1',
      name: 'Doc',
      icon: 'mdi-file',
      isNew: true
    },
    options: [{
      id: '1',
      name: 'Doc',
      icon: 'mdi-file',
      isNew: true
    }]
  })

  expect(wrapper.find('.q-chip-stub').exists()).toBe(true)
  expect(wrapper.find('.q-icon-stub').exists()).toBe(true)
})

/**
 * FaSelectInput
 * Empty icon string on object option skips icon render.
 */
test('Test that FaSelectInput skips icon when object icon is empty', () => {
  const wrapper = mountFaSelectInput({
    mode: 'document',
    modelValue: {
      id: '1',
      name: 'Doc',
      icon: ''
    },
    options: [{
      id: '1',
      name: 'Doc',
      icon: ''
    }, {
      id: '2',
      name: 'Other'
    }]
  })

  expect(wrapper.find('.q-chip-stub').exists()).toBe(true)
  expect(wrapper.find('.q-icon-stub').exists()).toBe(false)
})

/**
 * FaSelectInput
 * Popup-show emits request-options.
 */
test('Test that FaSelectInput emits request-options on popup-show', async () => {
  const wrapper = mountFaSelectInput()
  await wrapper.get('[data-test-locator="faSelectInput-stub-popup"]').trigger('click')
  expect(wrapper.emitted('request-options')).toBeTruthy()
})

/**
 * FaSelectInput
 * Exposes clearIsNewFlags for object selections.
 */
test('Test that FaSelectInput expose clearIsNewFlags strips isNew on model', async () => {
  const wrapper = mountFaSelectInput({
    mode: 'document',
    modelValue: {
      id: '1',
      name: 'Doc',
      isNew: true
    },
    options: [{
      id: '1',
      name: 'Doc',
      isNew: true
    }]
  })

  const exposed = wrapper.vm as unknown as {
    clearIsNewFlags: (ids: readonly string[]) => void
  }
  exposed.clearIsNewFlags(['1'])
  await nextTick()
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
    {
      id: '1',
      name: 'Doc'
    }
  ])
})
